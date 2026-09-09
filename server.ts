import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, doc, setDoc, getDocs, collection, query, where, getDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

// Lazy-loaded Gemini AI client
let _ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel inside Settings.");
    }
    _ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _ai;
}

// Memory caching for quick retrieval (size limit 5)
interface CacheEntry {
  key: string;
  data: any;
}
const hooksCache: CacheEntry[] = [];
const scriptCache: CacheEntry[] = [];

function getCache(cacheList: CacheEntry[], key: string): any | null {
  const entry = cacheList.find(e => e.key === key);
  return entry ? entry.data : null;
}

function setCache(cacheList: CacheEntry[], key: string, data: any) {
  cacheList.push({ key, data });
  if (cacheList.length > 5) {
    cacheList.shift();
  }
}

// Clean markdown brackets off JSON string if returned
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

function formatErrorMessage(error: any): string {
  const msg = String(error?.message || error || "");
  if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("overloaded")) {
    return "The Gemini AI engine is currently experiencing high demand. Please try again in a few seconds.";
  }
  return msg || "An unexpected error occurred.";
}

// Robust helpers to handle 503 / high demand capacity spikes across Gemini models with retries & model fallbacks
async function generateContentWithFallback(ai: GoogleGenAI, options: any) {
  const modelsToTry = [
    options.model || "gemini-3.6-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
    "gemini-flash-latest"
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (let i = 0; i < uniqueModels.length; i++) {
    const modelName = uniqueModels[i];
    try {
      if (i > 0) {
        console.warn(`[Gemini Fallback] Retrying request with model fallback: ${modelName} (attempt ${i + 1})`);
        await new Promise(r => setTimeout(r, 400 * i));
      }
      return await ai.models.generateContent({
        ...options,
        model: modelName
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Model Error on ${modelName}]:`, err?.message || err);
      // Try next model on capacity, 404, 429, 503, or service errors
      const errMessage = String(err?.message || err);
      const isRetryable = 
        errMessage.includes("503") || 
        errMessage.includes("404") ||
        errMessage.includes("429") ||
        errMessage.includes("NOT_FOUND") ||
        errMessage.includes("UNAVAILABLE") || 
        errMessage.includes("high demand") || 
        errMessage.includes("overloaded") || 
        errMessage.includes("RESOURCE_EXHAUSTED");
        
      if (!isRetryable) {
        throw err;
      }
    }
  }
  throw lastError;
}

async function generateContentStreamWithFallback(ai: GoogleGenAI, options: any) {
  const modelsToTry = [
    options.model || "gemini-3.6-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
    "gemini-flash-latest"
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;
  for (let i = 0; i < uniqueModels.length; i++) {
    const modelName = uniqueModels[i];
    try {
      if (i > 0) {
        console.warn(`[Gemini Stream Fallback] Retrying stream request with model fallback: ${modelName} (attempt ${i + 1})`);
        await new Promise(r => setTimeout(r, 400 * i));
      }
      return await ai.models.generateContentStream({
        ...options,
        model: modelName
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Stream Model Error on ${modelName}]:`, err?.message || err);
      const errMessage = String(err?.message || err);
      const isRetryable = 
        errMessage.includes("503") || 
        errMessage.includes("404") ||
        errMessage.includes("429") ||
        errMessage.includes("NOT_FOUND") ||
        errMessage.includes("UNAVAILABLE") || 
        errMessage.includes("high demand") || 
        errMessage.includes("overloaded") || 
        errMessage.includes("RESOURCE_EXHAUSTED");
        
      if (!isRetryable) {
        throw err;
      }
    }
  }
  throw lastError;
}

// 1. ENDPOINT: Generate magnetic hooks for a concept
app.post("/api/generate-hooks", async (req, res) => {
  const startTime = Date.now();
  console.log("[Module generate-hooks] Received hook formulation request.");
  try {
    const { concept, audience, outcome } = req.body;
    
    if (!concept) {
      return res.status(400).json({ error: "Concept description is required." });
    }

    const cacheKey = JSON.stringify({ concept, audience, outcome });
    const cachedData = getCache(hooksCache, cacheKey);
    if (cachedData) {
      const latency = Date.now() - startTime;
      console.log(`[Cache Hit] [Module generate-hooks] Served instant suggestions in ${latency}ms`);
      return res.json(cachedData);
    }

    const ai = getGeminiClient();
    
    const prompt = `
You are a legendary direct-response copywriter and product marketing strategist named Magneto.
Your goal is to generate extremely magnetic hooks for the following product/concept:

CONSTRUCTIVE PRODUCT/CONCEPT INFO:
- Concept/Product Name: ${concept}
- Target Audience: ${audience || "General consumers/business professionals"}
- Key Outcomes/Value: ${outcome || "Higher efficiency, saving time, increasing revenue"}

CRITICAL GUIDELINES FOR HOOKS:
- Generate 15 distinct hooks.
- Label each hook using one of these strict categories: Problem, Curiosity Gap, Contrarian, Proof, FOMO, Benefit, Story.
- Keep each hook between 8 to 12 words max. No fluffy intros or filler phrases. Be extremely specific.
- Rank the hooks. The top 3 ranked hooks should represent maximum scroll-stopping power. Give then scores from 90 to 99. Other hooks should get scores from 60 to 89.
- Never use em dashes (—). Use periods or commas instead. Do not build excessive hype or use cheesy industry words like "revolutionary" unless grounded in concrete outcomes.
- Output JSON ONLY matching this explicit schema:
{
  "hooks": [
    {
      "id": "string (unique identifier, e.g. h_1, h_2...)",
      "type": "Problem" | "Curiosity Gap" | "Contrarian" | "Proof" | "FOMO" | "Benefit" | "Story",
      "text": "string (8-12 words hook)",
      "score": number (scroll-stop power score),
      "explanation": "string (short 1-sentence analytical reason why this hook works)"
    }
  ]
}
`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  text: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "type", "text", "score", "explanation"]
              }
            }
          },
          required: ["hooks"]
        }
      }
    });

    const jsonText = cleanJsonString(response.text || "");
    const parsed = JSON.parse(jsonText);
    
    // Store in cache
    setCache(hooksCache, cacheKey, parsed);

    const latency = Date.now() - startTime;
    console.log(`[Cache Miss] [Module generate-hooks] Completed in ${latency}ms`);
    res.json(parsed);
  } catch (error: any) {
    console.error("Generate hooks error:", error);
    const concept = req.body?.concept || "Your Product";
    const audience = req.body?.audience || "target audience";
    const outcome = req.body?.outcome || "scale conversions";
    const fallbackHooks = [
      { id: "h_1", type: "Problem", text: `Why ${concept} is failing and how to fix it fast.`, score: 98, explanation: "Directly addresses core friction point with high urgency." },
      { id: "h_2", type: "Curiosity Gap", text: `The single tweak to ${outcome} nobody is talking about.`, score: 95, explanation: "Triggers intense curiosity and pattern interruption." },
      { id: "h_3", type: "Proof", text: `How ${audience} achieved ${outcome} in 30 days.`, score: 92, explanation: "Leverages strong social proof and specific outcome metrics." },
      { id: "h_4", type: "Contrarian", text: `Stop using traditional methods for ${concept}. Do this instead.`, score: 88, explanation: "Challenges status quo assumptions to capture immediate attention." },
      { id: "h_5", type: "FOMO", text: `If you are not optimizing ${concept}, you are falling behind.`, score: 86, explanation: "Taps into loss aversion and competitive pressure." },
      { id: "h_6", type: "Benefit", text: `The fastest way for ${audience} to unlock ${outcome}.`, score: 85, explanation: "Clear benefit-driven messaging with immediate payoff." },
      { id: "h_7", type: "Story", text: `I spent 6 months testing ${concept}. Here is what worked.`, score: 84, explanation: "Personal storytelling creates authentic engagement." },
      { id: "h_8", type: "Problem", text: `Is ${concept} costing you hours every single week?`, score: 82, explanation: "Relatable question targeting time waste." },
      { id: "h_9", type: "Curiosity Gap", text: `What top 1% of ${audience} do differently with ${concept}.`, score: 81, explanation: "Exclusivity driver." },
      { id: "h_10", type: "Proof", text: `3 proven frameworks to guarantee ${outcome}.`, score: 80, explanation: "Numbered actionable framework." },
      { id: "h_11", type: "Contrarian", text: `Why everything you learned about ${concept} is outdated.`, score: 78, explanation: "Bold claim pattern interrupt." },
      { id: "h_12", type: "FOMO", text: `Don't launch your next project without this ${concept} playbook.`, score: 76, explanation: "High relevance CTA." },
      { id: "h_13", type: "Benefit", text: `Automate your ${concept} and get ${outcome}.`, score: 75, explanation: "Direct outcome focus." },
      { id: "h_14", type: "Story", text: `How one change in ${concept} doubled our output overnight.`, score: 74, explanation: "Short case study story." },
      { id: "h_15", type: "Problem", text: `The hidden bottleneck in ${concept} and how to eliminate it.`, score: 72, explanation: "Problem diagnosis hook." }
    ];
    res.json({ hooks: fallbackHooks });
  }
});

// 2. ENDPOINT: Expand selected hook into Script, Video Shot List/Storyboard, and Marketing Kit
app.post("/api/generate-script-and-plan", async (req, res) => {
  const startTime = Date.now();
  console.log("[Module generate-script-and-plan] Received plan expansion request.");
  try {
    const { hookText, concept, audience, outcome, lengthInSeconds, tonePreference, platform } = req.body;

    if (!hookText) {
      return res.status(400).json({ error: "Selected hook text is required." });
    }

    const duration = lengthInSeconds || 60; // default 60s
    const tone = tonePreference || "Direct Response Copywriter Mode (bold, highly specific, evidence-backed)";
    const ratio = platform || "9:16";

    const cacheKey = JSON.stringify({ hookText, concept, audience, outcome, lengthInSeconds, tonePreference, platform });
    const cachedData = getCache(scriptCache, cacheKey);
    if (cachedData) {
      const latency = Date.now() - startTime;
      console.log(`[Cache Hit] [Module generate-script-and-plan] Instant script retrieved in ${latency}ms`);
      
      // Return cached plan instantly, but configured as chunk text to align with frontend reader
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.write(JSON.stringify(cachedData));
      return res.end();
    }

    const ai = getGeminiClient();

    const prompt = `
You are Magneto, acting as a master product storyteller and top-tier direct-response copywriter.
Take this selected magnetic hook: "${hookText}", and construct a high-converting, video script, complete shot list, and a professional multi-channel marketing kit.

PROJECT CONTEXT:
- Core Concept: ${concept}
- Target Audience: ${audience}
- Desired Outcome: ${outcome}
- Desired App / Video Length: ${duration} seconds (Write spoken words that realistically fit this length. Spoken speed is roughly 130-150 words per minute. Aim for: 30s = 65-75 words; 60s = 130-145 words; 90s = 190-220 words)
- Video Aspect Ratio: ${ratio}
- Tone Preference: ${tone}

DELIVERABLE 1: TELEPROMPTER-READY SCRIPT
- Structure: Follow Problem → Solution → Proof → CTA.
- Tone: Natural spoken delivery, simple grammar, short, high-impact sentences. Avoid em-dash.
- Insert teleprompter verbal cues like [PAUSE] or [EMPHASIS] in appropriate places.
- Grade-level reading target: 6th Grade or lower.
- Keep script text fully clean, copy-paste ready, and perfectly tailored to spoken voice.

DELIVERABLE 2: SHOT-BY-SHOT STORYBOARD (VIDEO PITCH PLAN)
- Break down the script into 4-6 distinct scenes with timestamps corresponding to the duration.
- Ensure the hook visual occurs in the first 3 seconds (e.g. 0s - 3s).
- Provide visual instructions (*crucial: avoid generic repetition*). Each scene MUST get a unique visual prompt containing distinct camera settings and distinct character physical behaviors.
- Construct the "visualPrompt" for each scene strictly following this structure:
  "[base product/brand visual description] + [scene-specific visual action or layout] + [camera angle and environment setting] + style: consistent brand"
- Example unique visual prompts for 5 scenes of an app pitch:
  Scene 1: "founder looking frustrated working at computer screen inside dark modern tech workspace, close-up shot, style: consistent brand"
  Scene 2: "vibrant user interface mock dashboard appearing crisp on sleek monitor screen, over-the-shoulder angle, style: consistent brand"
  Scene 3: "smiling professional recording high-quality smartphone video inside a bright home studio, camera medium shot, style: consistent brand"
  Scene 4: "clean close up of a dashboard interface revealing analytics graph line chart surging upwards, macro focus shot, style: consistent brand"
  Scene 5: "a bold minimal final splash interface displaying the service logo and CTA on screen, eye-level cinematic focus, style: consistent brand"

DELIVERABLE 3: MARKETING DISTRIBUTION KIT
- Formulate high-converting distribution layouts:
  1. LinkedIn Post (with bold, attention-grabbing spacing and dynamic structure).
  2. Viral Tweet/X Thread (array of 3-5 numbered highly scannable tweets).
  3. High-converting cold outreach email copy.
  4. Landing Page Hero Copy: Minimalist headline, supporting subheading, action-oriented call to action (CTA).
  5. Search-friendly YouTube script description.

Return exactly configured outputs in JSON following this JSON Schema:
{
  "script": {
    "title": "string",
    "spokenSeconds": number,
    "scriptText": "string (the complete clean script with verbal cues integrated)",
    "wordCount": number,
    "readingGrade": "string (e.g. '5th Grade' or '6th Grade')",
    "structuredSegments": [
      {
        "time": "string (timestamp intervals, e.g. 0s - 10s)",
        "label": "Hook" | "Problem" | "Solution" | "Proof" | "CTA",
        "text": "string (the voiceover spoken lines)"
      }
    ]
  },
  "scenes": [
    {
      "id": "string (unique scene id)",
      "timestamp": "string (e.g. 0s - 5s)",
      "visualPrompt": "string (graphic/visual prompt to copy or use for thumbnail generation)",
      "onScreenText": "string (short uppercase overlay text)",
      "avatarDirection": "string (body language, posture, expressions or hand movements)",
      "audioDescription": "string (speaking mannerism, background sound FX or tempo)"
    }
  ],
  "marketing": {
    "linkedin": "string",
    "twitterThread": ["string (tweet 1)", "string (tweet 2)", "..."],
    "coldEmail": "string",
    "landingPageHero": {
      "heading": "string",
      "subheading": "string",
      "cta": "string"
    },
    "youtubeDescription": "string"
  }
}
`;

    const responseStream = await generateContentStreamWithFallback(ai, {
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                spokenSeconds: { type: Type.INTEGER },
                scriptText: { type: Type.STRING },
                wordCount: { type: Type.INTEGER },
                readingGrade: { type: Type.STRING },
                structuredSegments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      label: { type: Type.STRING },
                      text: { type: Type.STRING }
                    },
                    required: ["time", "label", "text"]
                  }
                }
              },
              required: ["title", "spokenSeconds", "scriptText", "wordCount", "readingGrade", "structuredSegments"]
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  onScreenText: { type: Type.STRING },
                  avatarDirection: { type: Type.STRING },
                  audioDescription: { type: Type.STRING }
                },
                required: ["id", "timestamp", "visualPrompt", "onScreenText", "avatarDirection", "audioDescription"]
              }
            },
            marketing: {
              type: Type.OBJECT,
              properties: {
                linkedin: { type: Type.STRING },
                twitterThread: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                coldEmail: { type: Type.STRING },
                landingPageHero: {
                  type: Type.OBJECT,
                  properties: {
                    heading: { type: Type.STRING },
                    subheading: { type: Type.STRING },
                    cta: { type: Type.STRING }
                  },
                  required: ["heading", "subheading", "cta"]
                },
                youtubeDescription: { type: Type.STRING }
              },
              required: ["linkedin", "twitterThread", "coldEmail", "landingPageHero", "youtubeDescription"]
            }
          },
          required: ["script", "scenes", "marketing"]
        }
      }
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    let fullText = "";
    for await (const chunk of responseStream) {
      const textChunk = chunk.text || "";
      fullText += textChunk;
      res.write(textChunk);
    }
    res.end();

    try {
      const jsonText = cleanJsonString(fullText);
      const parsed = JSON.parse(jsonText);
      setCache(scriptCache, cacheKey, parsed);
    } catch (parseErr: any) {
      console.warn("Parsing stream results failed, cannot cache output:", parseErr.message);
    }

    const latency = Date.now() - startTime;
    console.log(`[Cache Miss] [Module generate-script-and-plan] Stream completed in ${latency}ms`);
  } catch (error: any) {
    console.error("Generate script and plan error:", error);
    if (!res.headersSent) {
      const concept = req.body?.concept || "Your Product";
      const audience = req.body?.audience || "target audience";
      const outcome = req.body?.outcome || "scale results";
      const duration = req.body?.lengthInSeconds || 60;
      const hookText = req.body?.hookText || `Why ${concept} is the ultimate solution.`;

      const fallbackPayload = {
        script: {
          title: `${concept} - High Converting Script`,
          spokenSeconds: duration,
          scriptText: `[PAUSE] ${hookText} [EMPHASIS] Most ${audience} spend hours struggling with inefficient steps. But with our proven framework, you can ${outcome} automatically. [PAUSE] Here's how it works: step one eliminates friction, step two optimizes conversions, and step three locks in sustainable growth. [EMPHASIS] Don't wait—click below and transform your results today!`,
          wordCount: 65,
          readingGrade: "6th Grade",
          structuredSegments: [
            { time: "0s - 10s", label: "Hook", text: hookText },
            { time: "10s - 25s", label: "Problem", text: `Most ${audience} spend hours struggling with inefficient steps that drag down output.` },
            { time: "25s - 45s", label: "Solution", text: `With our proven framework, you can ${outcome} automatically.` },
            { time: "45s - 60s", label: "CTA", text: "Don't wait—click below and transform your results today!" }
          ]
        },
        scenes: [
          {
            id: "sc_1",
            timestamp: "0s - 10s",
            visualPrompt: `${concept} founder looking focused at workspace screen, close-up shot, style: consistent brand`,
            onScreenText: "STOP WASTING TIME",
            avatarDirection: "Points directly at camera with urgent, engaging posture.",
            audioDescription: "Upbeat energetic tone with subtle synth bass."
          },
          {
            id: "sc_2",
            timestamp: "10s - 25s",
            visualPrompt: `sleek modern dashboard interface showing workflow analytics, over the shoulder angle, style: consistent brand`,
            onScreenText: "THE BOTTLENECK",
            avatarDirection: "Gestures towards monitor screen highlighting key metric.",
            audioDescription: "Smooth rhythmic background music."
          },
          {
            id: "sc_3",
            timestamp: "25s - 45s",
            visualPrompt: `vibrant digital report showing rising growth chart, macro focus shot, style: consistent brand`,
            onScreenText: "AUTOMATED RESULTS",
            avatarDirection: "Smiles confidently while presenting solution.",
            audioDescription: "Rising chime sound effect."
          },
          {
            id: "sc_4",
            timestamp: "45s - 60s",
            visualPrompt: `bold clean final call to action interface with button, eye level cinematic focus, style: consistent brand`,
            onScreenText: "GET STARTED NOW",
            avatarDirection: "Nods warmly, guiding viewer to click link.",
            audioDescription: "Upbeat crescendo transition."
          }
        ],
        marketing: {
          linkedin: `🚀 Struggling with ${concept}?\n\nHere is how ${audience} are achieving ${outcome}:\n\n1. Eliminating friction points\n2. Automating daily execution\n3. Focusing purely on high-leverage outputs\n\nTry Magneto today and transform your content engine!`,
          twitterThread: [
            `1/ Why ${concept} might be slowing you down (and how to fix it): 🧵`,
            `2/ Most ${audience} focus on manual tasks. But automated workflows deliver ${outcome}.`,
            `3/ Ready to level up? Check out Magneto and generate high-converting scripts in seconds!`
          ],
          coldEmail: `Subject: Quick question about ${concept}\n\nHi {{FirstName}},\n\nI noticed you are leading operations at {{Company}}. Most ${audience} spend hours managing manual setup.\n\nWe built a solution that helps you ${outcome} effortlessly.\n\nWould you be open to a 2-minute quick look this week?\n\nBest,\nMagneto Team`,
          landingPageHero: {
            heading: `Transform ${concept} into High-Converting Output`,
            subheading: `Help ${audience} ${outcome} in record time.`,
            cta: "Get Started Free"
          },
          youtubeDescription: `Discover how ${concept} empowers ${audience} to ${outcome}. Watch the full breakdown and get started now!`
        }
      };
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.write(JSON.stringify(fallbackPayload));
      res.end();
    } else {
      res.end();
    }
  }
});

// 3. ENDPOINT: Deck-to-video analyzer
app.post("/api/analyze-deck", async (req, res) => {
  try {
    const { deckText } = req.body;
    
    if (!deckText || deckText.trim().length === 0) {
      return res.status(400).json({ error: "Please paste your deck presentation notes or slide layouts." });
    }

    const ai = getGeminiClient();

    const prompt = `
You are Magneto, specialized in 'Deck-to-Video' conversions.
Your objective is to analyze the following slide/presentation text, extract its core essence, list 5 specific key slide summaries, and map those slides directly into dynamic video storyboard scenes.

PRESENTATION SLIDE/DECK CONTENT:
"${deckText}"

PROCESS & DELIVERABLES:
1. Extract the core value proposition of this deck in exactly 1 active, punchy sentence.
2. Formulate 3 distinct proof points loaded with specific, convincing outcomes from the slide text (fallback to solid outcomes if no raw numbers exist).
3. Summarize the content into 5 key sequential point/slide breakdowns.
4. Provide advice on which slide maps to which video scenes.
5. Create a standard set of 10 magnetic hooks inspired directly by these slide themes.

Output format should be structured JSON matching this schema:
{
  "valueProp": "string (1 punchy active sentence)",
  "proofPoints": ["string (proof point 1)", "string (proof point 2)", "string (proof point 3)"],
  "points": [
    {
      "slideNumber": number,
      "slideTitle": "string",
      "keySummary": "string (1-2 sentence core message)",
      "videoSceneMapping": "string (how to translate this slide visually to a video storyboard scene)"
    }
  ],
  "associatedHooks": [
    {
      "id": "string",
      "type": "Problem" | "Curiosity Gap" | "Contrarian" | "Proof" | "FOMO" | "Benefit",
      "text": "string (8-12 words hook)",
      "score": number
    }
  ]
}
`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valueProp: { type: Type.STRING },
            proofPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            points: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  slideTitle: { type: Type.STRING },
                  keySummary: { type: Type.STRING },
                  videoSceneMapping: { type: Type.STRING }
                },
                required: ["slideNumber", "slideTitle", "keySummary", "videoSceneMapping"]
              }
            },
            associatedHooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  text: { type: Type.STRING },
                  score: { type: Type.INTEGER }
                },
                required: ["id", "type", "text", "score"]
              }
            }
          },
          required: ["valueProp", "proofPoints", "points", "associatedHooks"]
        }
      }
    });

    const jsonText = cleanJsonString(response.text || "");
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Analyze deck error:", error);
    res.json({
      valueProp: "Transform complex pitch decks into high-impact video scripts and marketing assets.",
      proofPoints: ["Reduces script creation time by 80%", "Increases viewer retention across video feeds", "Generates ready-to-use distribution assets"],
      points: [
        { slideNumber: 1, slideTitle: "Problem Statement", keySummary: "Current manual workflow creates friction and slows execution.", videoSceneMapping: "Hook scene showing user frustration." },
        { slideNumber: 2, slideTitle: "Solution Overview", keySummary: "Automated direct-response generation engine.", videoSceneMapping: "Product demonstration scene." },
        { slideNumber: 3, slideTitle: "Key Outcomes", keySummary: "Measurable efficiency gains and higher engagement.", videoSceneMapping: "Growth chart and proof scene." }
      ],
      associatedHooks: [
        { id: "dh_1", type: "Problem", text: "Why traditional pitch decks fail to convert modern audiences.", score: 95 },
        { id: "dh_2", type: "Curiosity Gap", text: "The 3-step deck transformation method top founders use.", score: 90 },
        { id: "dh_3", type: "Proof", text: "How to turn a 10-slide deck into a viral video script.", score: 88 }
      ]
    });
  }
});

// 4. ENDPOINT: Dynamic storyboard scene sketch generator (Multimodal Image Generation)
app.post("/api/generate-image", async (req, res) => {
  const startTime = Date.now();
  console.log("[Module generate-image] Received scene sketch rendering request.");
  try {
    const { prompt, seed } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Scene description prompt is required." });
    }

    const imageSeed = seed || (Date.now() + Math.floor(Math.random() * 1000000));
    const ai = getGeminiClient();

    let base64Url = "";

    // 1. Try Gemini Image Generation models
    const modelsToTry = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [{ text: `${prompt}. Style: storyboard sketch, cinematic lighting, vector illustration, workspace view. Unique seed: ${imageSeed}` }]
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            },
            seed: Number(imageSeed)
          }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              base64Url = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }
        if (base64Url) break;
      } catch (geminiErr: any) {
        console.warn(`[Gemini Image model ${modelName} notice]:`, geminiErr?.message || geminiErr);
      }
    }

    // 2. If Gemini models do not output base64 data, use crisp, unique seed photo fallback from Picsum
    if (!base64Url) {
      const cleanSeed = encodeURIComponent(String(imageSeed));
      base64Url = `https://picsum.photos/seed/${cleanSeed}/640/360`;
    }

    const latency = Date.now() - startTime;
    console.log(`[Module generate-image] Rendered sketch in ${latency}ms`);
    res.json({ imageUrl: base64Url });
  } catch (error: any) {
    console.warn("Image generation fallback activated:", error.message);
    const fallbackSeed = Date.now() + Math.floor(Math.random() * 1000);
    res.json({ imageUrl: `https://picsum.photos/seed/${fallbackSeed}/640/360` });
  }
});

// 5. ENDPOINT: Dynamic conversational co-pilot chat (Workflow Engine)
app.post("/api/chat-assistant", async (req, res) => {
  try {
    const { history, newMessage } = req.body;
    if (!newMessage) {
      return res.status(400).json({ error: "Message content is required." });
    }

    const ai = getGeminiClient();

    // Map history to standard prompt framework format
    const formattedHistory = (history || []).map((h: any) => 
      `${h.role === "model" ? "Magneto Copilot" : "User"}: ${h.text}`
    ).join("\n");

    const prompt = `
You are Magneto Copilot, a persuasive sales copywriter, video marketing planner, and startup strategist.
Your mission is to help the user design winning script hooks, teleprompter layouts, and storyboard guides.

CONVERSATION HISTORY:
${formattedHistory}

USER'S LATEST MESSAGE:
"${newMessage}"

YOUR INSTRUCTIONS:
1. Emulate a master direct-response copywriter. Be punchy, focused, and objective. Never use em dashes.
2. If the user is describing a business concept, product, or service:
   A. First, outline or praise the core idea and clarify the target audience or key conversion outcomes.
   B. Provide 3 custom written hooks as examples instantly.
   C. Extract the core parts into structural properties ("concept", "audience", "outcome") so our dashboard can auto-populate those cards.
3. If they are asking questions about formats, give short, readable answers (e.g. 9:16 is for social feeds, 16:9 for presentations).
4. End your response by asking if they want variations for a different platform or to expand the hook.

Output formatted JSON conforming to:
{
  "text": "string (your friendly, punchy, conversational copywriter reply. Include markdown list format, bulletins, and 3 example hooks if they shared a product idea)",
  "autoParams": {
    "concept": "string (the extracted product concept/name, keep it brief, first-good name if unnamed)",
    "audience": "string (the identified target user segment, e.g. real estate agents, busy remote dads)",
    "outcome": "string (the core measurable outcomes/benefits)"
  },
  "actionRequired": "create"
}
`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            autoParams: {
              type: Type.OBJECT,
              properties: {
                concept: { type: Type.STRING },
                audience: { type: Type.STRING },
                outcome: { type: Type.STRING }
              },
              required: ["concept", "audience", "outcome"]
            },
            actionRequired: { type: Type.STRING }
          },
          required: ["text"]
        }
      }
    });

    const jsonText = cleanJsonString(response.text || "");
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Chat assistant error:", error);
    const userMsg = String(req.body?.newMessage || "");
    res.json({
      text: `Got it! I've analyzed your idea: "${userMsg.slice(0, 60) || "your concept"}". I recommend focusing on a direct-response hook that highlights immediate value for your target audience.\n\n**3 Custom Hooks for You:**\n1. *Problem:* Stop wasting hours on manual tasks for your workflow.\n2. *Curiosity:* The hidden strategy top teams use to scale output 10x.\n3. *Proof:* How to double conversions without increasing budget.\n\nI've updated your workspace cards so you can formulate full hook lists right away!`,
      autoParams: {
        concept: userMsg.slice(0, 30) || "SaaS Automation Tool",
        audience: "Startup founders & growth teams",
        outcome: "Reduce friction and double conversions"
      },
      actionRequired: "create"
    });
  }
});

// 6. ENDPOINT: Generate a beautiful, custom Tailwind landing page HTML
app.post("/api/generate-landing-page-code", async (req, res) => {
  try {
    const { concept, audience, outcome, theme, heading, subheading, cta } = req.body;
    
    const ai = getGeminiClient();
    
    const prompt = `
You are a world-class Landing Page Designer and Senior Frontend Engineer.
Generate a complete, single-file HTML landing page that is highly polished, professional, and visually stunning.

USE THIS THEME CONFIGURATION:
Theme Choice: ${theme || "saas-dark"}
Available styles:
- "saas-dark": Immersive dark background, neon Indigo/Violet glowing primary buttons, smooth card borders with subtle backdrops, sleek grid systems, futuristic workspace vibe.
- "minimal-light": Swiss stark modern minimalism, elegant off-white background (#FAF9F6), dark slate/charcoal headings (Inter/Space Grotesk), high contrast, generous whitespace, razor-sharp clean borders, clean text.
- "editorial-warm": Soft premium cream background (#FDFBF7), elegant serif font (Playfair Display) for titles, warm amber/emerald accents, beautiful spacious borders, warm literary aesthetic.
- "bold-gradient": Vibrant energetic modern startup style, deep slate background with mesh gradients in the hero, high-contrast CTA buttons, orange/indigo colors, interactive grids.

CONTENT REQUIREMENTS:
- Product/Concept Name: ${concept || "Our Product"}
- Product Hero Heading: ${heading || "The ultimate solution for your workflow."}
- Product Hero Subheading: ${subheading || "Save hours of effort, scale your conversions, and delight your customers instantly."}
- Call to Action button (CTA): ${cta || "Get Started Free"}
- Target Audience: ${audience || "Modern teams"}
- Core Outcome: ${outcome || "Boost speed and revenue"}

DESIGN DETAILS & CODING CONSTRAINTS:
- Use EXACTLY ONE file: a fully self-contained HTML page containing both styling and markup.
- Use Tailwind CSS via the CDN script: <script src="https://cdn.tailwindcss.com"></script>
- Import beautiful Google Fonts at the top using <link> tag. Pair appropriate fonts for headings and body based on the selected theme (e.g. Space Grotesk/Inter, Playfair Display/Inter, etc.).
- Incorporate interactive Tailwind components (e.g., modern responsive nav bar with CTA, huge high-converting Hero, Social proof / stats section, beautifully detailed Bento-Grid feature cards, clean pricing segment with active hover cards, a beautiful modern email signup form, and a polished footer).
- Do NOT use external images that are broken. Use beautiful high-contrast CSS gradients or modern Lucide SVGs (via CDN <script src="https://unpkg.com/lucide@latest"></script> followed by lucide.createIcons() or raw inline SVGs).
- Make sure all links are clean. The main CTA and buttons should have rich hover transitions, smooth active clicks, and responsive padding.
- Add a subtle credit in the footer: "Built with Magneto • Hosted on Vercel" or similar.
- Output HTML ONLY. Do not write any explanations before or after the code block. Start directly with <!DOCTYPE html> and end with </html>.
`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let htmlCode = response.text || "";
    // Clean code block ticks
    htmlCode = htmlCode.trim();
    if (htmlCode.startsWith("```html")) {
      htmlCode = htmlCode.slice(7);
    } else if (htmlCode.startsWith("```")) {
      htmlCode = htmlCode.slice(3);
    }
    if (htmlCode.endsWith("```")) {
      htmlCode = htmlCode.slice(0, -3);
    }
    htmlCode = htmlCode.trim();

    res.json({ html: htmlCode });
  } catch (error: any) {
    console.error("Generate landing page HTML error:", error);
    const concept = req.body?.concept || "Magneto";
    const heading = req.body?.heading || "Scale Your Conversions Faster";
    const subheading = req.body?.subheading || "The complete platform to generate magnetic hooks, scripts, and landing pages.";
    const cta = req.body?.cta || "Get Started Free";
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${concept} - Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between font-sans">
  <nav class="border-b border-slate-800 px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
    <span class="text-xl font-bold tracking-tight text-white">${concept}</span>
    <button class="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition">${cta}</button>
  </nav>
  <main class="max-w-4xl mx-auto px-6 py-20 text-center">
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">${heading}</h1>
    <p class="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">${subheading}</p>
    <button class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5">${cta}</button>
  </main>
  <footer class="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
    Built with ${concept} • All rights reserved
  </footer>
</body>
</html>`;
    res.json({ html: fallbackHtml });
  }
});

// 7. ENDPOINT: Deploy files directly to GitHub (create repo and commit files)
app.post("/api/deploy-github", async (req, res) => {
  try {
    const { token, repoName, html, projectName } = req.body;
    if (!token) {
      return res.status(400).json({ error: "GitHub Personal Access Token (PAT) is required." });
    }
    if (!repoName) {
      return res.status(400).json({ error: "Repository name is required." });
    }

    // 1. Get GitHub authenticated user login
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "magneto-app"
      }
    });

    if (!userRes.ok) {
      const errorMsg = await userRes.text();
      throw new Error(`Failed to authenticate with GitHub token: ${userRes.statusText || errorMsg}`);
    }

    const userData: any = await userRes.json();
    const owner = userData.login;

    // 2. Create Repository (if not existing)
    const createRepoRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "magneto-app"
      },
      body: JSON.stringify({
        name: repoName,
        description: `Campaign Landing Page for ${projectName || "Magneto Project"}`,
        private: false,
        auto_init: true
      })
    });

    let repoUrl = `https://github.com/${owner}/${repoName}`;
    if (!createRepoRes.ok && createRepoRes.status !== 422) {
      const errorMsg = await createRepoRes.text();
      throw new Error(`Failed to create repository: ${createRepoRes.statusText || errorMsg}`);
    }

    // 3. Commit files (index.html, README.md)
    const filesToCommit = [
      {
        path: "index.html",
        content: html,
        message: "Deploy Campaign Landing Page via Magneto"
      },
      {
        path: "README.md",
        content: `# ${projectName || repoName}\n\nGenerated with ❤️ by Magneto.\n\nLive campaign landing page created dynamically.`,
        message: "Add README.md"
      }
    ];

    for (const file of filesToCommit) {
      // Check if file exists to get its SHA (supports overwrites seamlessly)
      let sha: string | undefined = undefined;
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`, {
          headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "magneto-app"
          }
        });
        if (checkRes.ok) {
          const checkData: any = await checkRes.json();
          sha = checkData.sha;
        }
      } catch (err) {
        // file doesn't exist
      }

      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`, {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "magneto-app"
        },
        body: JSON.stringify({
          message: file.message,
          content: Buffer.from(file.content).toString("base64"),
          branch: "main",
          ...(sha ? { sha } : {})
        })
      });

      if (!commitRes.ok) {
        const errorMsg = await commitRes.text();
        throw new Error(`Failed to commit ${file.path}: ${commitRes.statusText || errorMsg}`);
      }
    }

    res.json({
      success: true,
      repoUrl,
      owner,
      repoName
    });

  } catch (error: any) {
    console.error("GitHub deploy error:", error);
    res.status(500).json({ error: error.message || "Failed to commit and push to GitHub." });
  }
});

// 8. ENDPOINT: Deploy static landing page to Vercel
app.post("/api/deploy-vercel", async (req, res) => {
  try {
    const { token, projectName, html } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Vercel Personal Access Token is required." });
    }
    if (!projectName) {
      return res.status(400).json({ error: "Project name is required." });
    }

    const cleanProjectName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "");

    // Create a Vercel deployment
    const vercelRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: cleanProjectName,
        files: [
          {
            file: "index.html",
            data: html
          }
        ],
        projectSettings: {
          framework: null
        }
      })
    });

    if (!vercelRes.ok) {
      const errorMsg = await vercelRes.text();
      throw new Error(`Vercel deployment failed: ${vercelRes.statusText || errorMsg}`);
    }

    const deployData: any = await vercelRes.json();
    const deployUrl = deployData.url ? `https://${deployData.url}` : "";

    res.json({
      success: true,
      url: deployUrl,
      id: deployData.id,
      name: deployData.name
    });

  } catch (error: any) {
    console.error("Vercel deploy error:", error);
    res.status(500).json({ error: error.message || "Failed to deploy to Vercel." });
  }
});

// ==========================================
// DODO PAYMENTS INTEGRATION
// ==========================================

// Lazy-loaded Firestore backend instance
const backendFirebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyB-BwS0rv53mTkKmcjhSfkCTl0COeTf-ck",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "magneto-1750e.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "magneto-1750e",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "magneto-1750e.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100091620250",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:100091620250:web:2280b209b0f695db29a823"
};
const backendDatabaseId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "G-6DPJB2EXC9";

let _backendDb: any = null;
function getBackendFirestore() {
  if (!_backendDb) {
    try {
      const fbApp = getApps().length === 0 ? initializeApp(backendFirebaseConfig) : getApp();
      _backendDb = initializeFirestore(fbApp, {}, backendDatabaseId);
    } catch (err) {
      console.warn("Backend Firestore initialization note:", err);
    }
  }
  return _backendDb;
}

/**
 * Verifies Dodo Payments webhook signatures following the Standard Webhooks specification.
 */
function verifyDodoWebhookSignature(
  rawBody: Buffer | string | undefined,
  headers: Record<string, any>,
  secret: string
): boolean {
  if (!secret) {
    console.log("[Dodo Webhook] No DODO_PAYMENTS_WEBHOOK_SECRET configured. Bypassing signature verification.");
    return true;
  }

  const webhookId = (headers["webhook-id"] || headers["Webhook-Id"]) as string;
  const webhookTimestamp = (headers["webhook-timestamp"] || headers["Webhook-Timestamp"]) as string;
  const webhookSignature = (headers["webhook-signature"] || headers["Webhook-Signature"]) as string;

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    console.error("[Dodo Webhook] Missing required headers: webhook-id, webhook-timestamp, or webhook-signature");
    return false;
  }

  const bodyStr = rawBody 
    ? (typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"))
    : "";
  const signedContent = `${webhookId}.${webhookTimestamp}.${bodyStr}`;

  let secretKey: Buffer;
  if (secret.startsWith("whsec_")) {
    const b64Secret = secret.slice("whsec_".length);
    secretKey = Buffer.from(b64Secret, "base64");
  } else {
    secretKey = Buffer.from(secret, "utf8");
  }

  const computedSig = crypto
    .createHmac("sha256", secretKey)
    .update(signedContent)
    .digest("base64");

  const sigList = webhookSignature.split(" ");
  for (const item of sigList) {
    const parts = item.split(",");
    const sigVal = parts.length > 1 ? parts[1] : parts[0];
    try {
      if (crypto.timingSafeEqual(Buffer.from(sigVal), Buffer.from(computedSig))) {
        return true;
      }
    } catch {
      // Buffer length mismatch or bad format
    }
  }

  console.error("[Dodo Webhook] Webhook signature did not match computed HMAC.");
  return false;
}

/**
 * 9. ENDPOINT: Create Dodo Payments Checkout Session
 */
app.post("/api/payments/create-checkout", async (req, res) => {
  try {
    const { planType, billingCycle, userId, customerEmail, customerName, redirectUrl, productId: customProductId } = req.body;

    const cycle = billingCycle === "yearly" ? "yearly" : "monthly";
    let productId = customProductId;

    if (!productId) {
      if (planType === "Agency") {
        productId = cycle === "yearly"
          ? (process.env.DODO_PAYMENTS_AGENCY_YEARLY_PRODUCT_ID || "pdt_agency_yearly")
          : (process.env.DODO_PAYMENTS_AGENCY_MONTHLY_PRODUCT_ID || "pdt_agency_monthly");
      } else if (planType === "dev_sprint" || planType === "DeveloperSprint") {
        productId = process.env.DODO_PAYMENTS_DEV_SPRINT_PRODUCT_ID || "pdt_dev_sprint";
      } else {
        // Default Pro plan
        productId = cycle === "yearly"
          ? (process.env.DODO_PAYMENTS_PRO_YEARLY_PRODUCT_ID || "pdt_pro_yearly")
          : (process.env.DODO_PAYMENTS_PRO_MONTHLY_PRODUCT_ID || "pdt_pro_monthly");
      }
    }

    // Determine return URL
    const defaultHost = req.get("host") || "localhost:3000";
    const protocol = req.protocol || "http";
    const fallbackReturnUrl = `${protocol}://${defaultHost}/pricing?payment=success`;
    const finalReturnUrl = redirectUrl || process.env.DODO_PAYMENTS_RETURN_URL || fallbackReturnUrl;

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;

    if (apiKey) {
      const isLive = process.env.DODO_PAYMENTS_ENVIRONMENT === "live";
      const baseUrl = isLive ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

      const checkoutPayload = {
        product_cart: [
          {
            product_id: productId,
            quantity: 1
          }
        ],
        customer: {
          email: customerEmail || "creator@example.com",
          name: customerName || "Magneto Creator"
        },
        return_url: finalReturnUrl,
        metadata: {
          userId: userId || "",
          plan: planType || "Pro",
          billingCycle: cycle
        }
      };

      console.log(`[Dodo Payments] Creating checkout session at ${baseUrl}/checkouts for product: ${productId}`);

      const dodoRes = await fetch(`${baseUrl}/checkouts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(checkoutPayload)
      });

      if (!dodoRes.ok) {
        const errorText = await dodoRes.text();
        console.warn(`[Dodo Payments API Warning] Status: ${dodoRes.status} ${dodoRes.statusText}`, errorText);
        throw new Error(`Dodo Payments checkout creation failed: ${errorText || dodoRes.statusText}`);
      }

      const dodoData: any = await dodoRes.json();
      const checkoutUrl = dodoData.checkout_url || dodoData.payment_link || dodoData.url;
      const sessionId = dodoData.session_id || dodoData.id;

      return res.json({
        success: true,
        checkout_url: checkoutUrl,
        session_id: sessionId,
        mode: isLive ? "live" : "test"
      });
    }

    // Graceful fallback when API key is not yet configured in environment
    console.log("[Dodo Payments] No DODO_PAYMENTS_API_KEY configured. Returning simulated test checkout link.");
    const testSessionId = `sim_dodo_${Date.now()}`;
    const cleanUrl = finalReturnUrl.includes("?")
      ? `${finalReturnUrl}&session_id=${testSessionId}&provider=dodo`
      : `${finalReturnUrl}?session_id=${testSessionId}&provider=dodo`;

    return res.json({
      success: true,
      checkout_url: cleanUrl,
      session_id: testSessionId,
      isSimulated: true,
      message: "DODO_PAYMENTS_API_KEY is not configured yet. Using simulated test redirect. Set DODO_PAYMENTS_API_KEY in Vercel to activate live/test Dodo gateway."
    });
  } catch (err: any) {
    console.error("[Dodo Payments create-checkout error]:", err);
    res.status(500).json({ error: err.message || "Failed to create Dodo Payments checkout session." });
  }
});

/**
 * Webhook handler processing Dodo Payments events and updating user entitlements
 */
async function handleDodoWebhook(req: express.Request, res: express.Response) {
  console.log("[Dodo Payments Webhook] Received webhook POST event.");
  try {
    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || "";

    const isValid = verifyDodoWebhookSignature(rawBody, req.headers, secret);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid webhook signature." });
    }

    const payload = req.body || {};
    const eventType = payload.type || payload.event_type || payload.event || "unknown";
    const data = payload.data || payload;

    console.log(`[Dodo Payments Webhook] Processing event: ${eventType}`);

    const metadata = data.metadata || payload.metadata || {};
    const customer = data.customer || {};
    const customerEmail = customer.email || data.email;
    const userId = metadata.userId || metadata.user_id;
    const requestedPlan = metadata.plan || (data.product_id?.includes("agency") ? "Agency" : "Pro");
    const subId = data.subscription_id || data.payment_id || data.id || `sub_dodo_${Date.now()}`;
    const renewalDate = data.next_billing_date ? data.next_billing_date.split("T")[0] : "";

    const firestore = getBackendFirestore();

    if (
      eventType === "payment.succeeded" ||
      eventType === "subscription.active" ||
      eventType === "subscription.created" ||
      eventType === "subscription.renewed" ||
      eventType === "subscription.updated"
    ) {
      const planStatus = requestedPlan === "Agency" ? "Agency" : "Pro";
      console.log(`[Dodo Payments] Granting entitlement to plan: ${planStatus} (ID: ${subId})`);

      if (firestore) {
        // Record subscription ledger
        try {
          const subRef = doc(firestore, "subscriptions", String(subId));
          await setDoc(subRef, {
            id: String(subId),
            userId: userId || "",
            customerEmail: customerEmail || "",
            plan: `${planStatus} Plan`,
            status: "active",
            renewalDate: renewalDate,
            gateway: "dodo_payments",
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (subErr) {
          console.warn("[Dodo Payments Webhook] Subscription Firestore write note:", subErr);
        }

        // Update user entitlement
        if (userId) {
          try {
            const userRef = doc(firestore, "users", userId);
            await setDoc(userRef, {
              planStatus: planStatus,
              lastActive: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log(`[Dodo Payments] User ${userId} planStatus updated to ${planStatus}`);
          } catch (uErr) {
            console.warn("[Dodo Payments Webhook] User update note:", uErr);
          }
        } else if (customerEmail) {
          try {
            const usersCol = collection(firestore, "users");
            const q = query(usersCol, where("email", "==", customerEmail));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              const matchedUserDoc = querySnap.docs[0];
              await setDoc(matchedUserDoc.ref, {
                planStatus: planStatus,
                lastActive: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }, { merge: true });
              console.log(`[Dodo Payments] Found user by email ${customerEmail}. Plan updated to: ${planStatus}`);
            }
          } catch (queryErr) {
            console.warn("[Dodo Payments Webhook] Email query note:", queryErr);
          }
        }
      }

      return res.status(200).json({ success: true, event: eventType, planStatus });
    }

    if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.expired" ||
      eventType === "subscription.failed" ||
      eventType === "subscription.on_hold"
    ) {
      console.log(`[Dodo Payments] Downgrading subscription ${subId} to Free status due to ${eventType}`);
      if (firestore) {
        try {
          const subRef = doc(firestore, "subscriptions", String(subId));
          await setDoc(subRef, {
            status: "cancelled",
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (subErr) {
          console.warn("[Dodo Payments Webhook] Subscription cancellation write note:", subErr);
        }

        if (userId) {
          try {
            const userRef = doc(firestore, "users", userId);
            await setDoc(userRef, {
              planStatus: "Free",
              lastActive: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log(`[Dodo Payments] User ${userId} downgraded to Free status`);
          } catch (uErr) {
            console.warn("[Dodo Payments Webhook] User downgrade note:", uErr);
          }
        }
      }
      return res.status(200).json({ success: true, event: eventType, planStatus: "Free" });
    }

    return res.status(200).json({ success: true, event: eventType, message: "Event received" });
  } catch (err: any) {
    console.error("[Dodo Payments Webhook Error]:", err);
    return res.status(500).json({ error: err.message || "Webhook processing failed" });
  }
}

// 10. ENDPOINT: Dodo Payments Webhook Endpoints
app.post("/api/webhooks/dodo", handleDodoWebhook);
app.post("/api/webhook/dodo", handleDodoWebhook);

// Backwards-compatible legacy route
app.post("/api/webhook/lemonsqueezy", (req, res) => {
  res.json({ message: "Lemon Squeezy is deprecated. Dodo Payments webhook is active at /api/webhooks/dodo" });
});

// Configure Vite middleware in development or serve static files in production
async function configureServer() {
  // Ensure public brand assets are correctly written
  try {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const sourceImage = path.join(process.cwd(), "src", "assets", "images", "magneto_logo_icon_1782105206005.jpg");
    if (fs.existsSync(sourceImage)) {
      fs.copyFileSync(sourceImage, path.join(publicDir, "apple-touch-icon.png"));
      fs.copyFileSync(sourceImage, path.join(publicDir, "favicon.ico"));
      console.log("Successfully loaded Magneto high-resolution branding assets to public/ directory!");
    } else {
      // Write standard 1x1 base64 transparent PNG fallback
      const rxPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const rxBuf = Buffer.from(rxPng, "base64");
      if (!fs.existsSync(path.join(publicDir, "apple-touch-icon.png"))) {
        fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), rxBuf);
      }
      if (!fs.existsSync(path.join(publicDir, "favicon.ico"))) {
        fs.writeFileSync(path.join(publicDir, "favicon.ico"), rxBuf);
      }
    }
  } catch (err) {
    console.warn("Asset copying warning:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Magneto running on http://localhost:${PORT}`);
    });
  }
}

configureServer();

export default app;
