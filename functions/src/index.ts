import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { handleLemonSqueezyWebhook } from "./webhooks";

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

const app = express();

// Set up CORS
app.use(cors({ origin: true }));

// Express body parser
app.use(express.json());

// Lazy-loaded Gemini AI client
let _ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it as an environment variable in Cloud Functions configuration.");
    }
    _ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-functions',
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    return res.json(parsed);
  } catch (error: any) {
    console.error("Generate hooks error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate hooks." });
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

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
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
      return res.status(500).json({ error: error.message || "Failed to generate script and video plan." });
    } else {
      return res.end();
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    return res.json(parsed);
  } catch (error: any) {
    console.error("Analyze deck error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze deck text." });
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

    const imageSeed = seed || (Date.now() + Math.floor(Math.random() * 1000));
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `${prompt}. Style: consistent brand layout, high-quality visual presentation style, vector illustration, cinematic lighting, workspace sketch. Unique Key: ${imageSeed}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        },
        seed: Number(imageSeed)
      }
    });

    let base64Url = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          base64Url = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }
    }

    if (!base64Url) {
      throw new Error("No image data returned from generator.");
    }

    const latency = Date.now() - startTime;
    console.log(`[Module generate-image] Rendered sketch in ${latency}ms`);
    return res.json({ imageUrl: base64Url });
  } catch (error: any) {
    console.warn("Image generation failed, using styled fallback:", error.message);
    const fallbackUrl = `https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=640&auto=format&fit=crop`;
    return res.json({ 
      imageUrl: fallbackUrl,
      warning: "Showing high-quality preview asset. To render custom sketches, configure your developer Gemini API key in Secrets."
    });
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
    return res.json(parsed);
  } catch (error: any) {
    console.error("Chat assistant error:", error);
    return res.status(500).json({ error: error.message || "Failed to process chat session." });
  }
});

// 6. LEMON SQUEEZY WEBHOOK ENDPOINT
app.post("/api/webhook/lemonsqueezy", handleLemonSqueezyWebhook);

export const api = onRequest(app);
