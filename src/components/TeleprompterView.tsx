import { Play, Pause, RotateCcw, RefreshCw, Volume2, VolumeX, Mic, Info, Gauge, Settings2, Sparkles, Square, Check, Loader2, Timer, Clock, Copy, Download, FileText, Subtitles, FileAudio } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Script } from "../types";

interface TeleprompterViewProps {
  script?: Script;
  isLoading: boolean;
  streamingText?: string;
  progressStage?: string;
  progressPercent?: number;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const AI_VOICES = [
  { id: "ai_kore", voiceName: "Kore", label: "Kore – Studio Professional (Clear Female)" },
  { id: "ai_puck", voiceName: "Puck", label: "Puck – Upbeat Dynamic (Energetic Male)" },
  { id: "ai_fenrir", voiceName: "Fenrir", label: "Fenrir – Founder Pitch (Direct Male)" },
  { id: "ai_charon", voiceName: "Charon", label: "Charon – Calm Executive (Warm Male)" },
  { id: "ai_zephyr", voiceName: "Zephyr", label: "Zephyr – Storyteller (Inspiring Female)" },
];

export default function TeleprompterView({ 
  script, 
  isLoading,
  streamingText,
  progressStage,
  progressPercent,
  errorMessage,
  onRetry,
}: TeleprompterViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(6); // scale from 1 (slow) to 15 (fast)
  const [fontSize, setFontSize] = useState(24);
  
  // AI Voiceover state
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState(true);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("ai_kore");
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [isSpeakingSegment, setIsSpeakingSegment] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Standard conversational pitch pacing: 135 words per minute (WPM)
  const WORDS_PER_MINUTE = 135;

  // Compute word count dynamically from current script (from property, text, or segments)
  const scriptWordCount = useMemo(() => {
    if (script?.wordCount && script.wordCount > 0) return script.wordCount;
    if (script?.scriptText) {
      return script.scriptText.split(/\s+/).filter(Boolean).length;
    }
    if (script?.structuredSegments?.length) {
      return script.structuredSegments.reduce((acc, s) => {
        return acc + (s.text ? s.text.split(/\s+/).filter(Boolean).length : 0);
      }, 0);
    }
    return 0;
  }, [script]);

  // Estimated speaking duration in seconds calculated based on script word count and pacing rate
  const estimatedSpeakingSeconds = useMemo(() => {
    if (!scriptWordCount) return script?.spokenSeconds || 60;
    const baseSeconds = Math.round((scriptWordCount / WORDS_PER_MINUTE) * 60);
    const rateAdjusted = speechRate && speechRate > 0 ? Math.round(baseSeconds / speechRate) : baseSeconds;
    return Math.max(5, rateAdjusted);
  }, [scriptWordCount, speechRate, script?.spokenSeconds]);

  // Live countdown timer state (tracks elapsed speaking duration in seconds)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Remaining speaking time in seconds and pacing status
  const remainingSeconds = Math.max(0, estimatedSpeakingSeconds - elapsedSeconds);
  const deliveryProgressPercent = Math.min(100, Math.round((elapsedSeconds / estimatedSpeakingSeconds) * 100));

  // Time formatter helper MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Live countdown timer ticker: runs whenever teleprompter playback is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Reset countdown when active script changes
  useEffect(() => {
    setElapsedSeconds(0);
  }, [script]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  // Audio references and sequence race guards
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);
  const sequenceIdRef = useRef(0);

  // Safely stop all audio playback (both HTML5 Audio and Web Speech API)
  const stopAllAudio = () => {
    sequenceIdRef.current++;
    isPlayingRef.current = false;

    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.onended = null;
        audioPlayerRef.current.onerror = null;
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      } catch {}
      audioPlayerRef.current = null;
    }
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        if (currentUtteranceRef.current) {
          currentUtteranceRef.current.onend = null;
          currentUtteranceRef.current.onerror = null;
        }
        window.speechSynthesis.cancel();
      } catch {}
    }
    currentUtteranceRef.current = null;
    setIsLoadingAudio(false);
  };

  // Load available system speech synthesis voices for optional fallback
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        try {
          const available = window.speechSynthesis.getVoices();
          if (available && available.length > 0) {
            setBrowserVoices(available);
          }
        } catch (e) {
          console.warn("System voices notice:", e);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      stopAllAudio();
    };
  }, []);

  // Cleanup on script change or unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [script]);

  // Strip stage directions like [EMPHASIS] or [PAUSE] for clean audio reading
  const getCleanSpeechText = (text: string) => {
    return text
      .replace(/\[EMPHASIS\]/gi, "")
      .replace(/\[PAUSE\]/gi, " ... ")
      .replace(/\[\/?EMPHASIS\]/gi, "")
      .replace(/\[\/?PAUSE\]/gi, " ... ")
      .replace(/\[.*?\]/g, "")
      .trim();
  };

  const [isExportingAudio, setIsExportingAudio] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Generate standard SubRip (.srt) subtitle cues for video editing tools
  const generateSrt = (segments: Array<{ time: string; label: string; text: string }>, wpm: number = WORDS_PER_MINUTE) => {
    let currentTimeMs = 0;
    return segments
      .map((seg, idx) => {
        const clean = getCleanSpeechText(seg.text).replace(/\s+/g, " ");
        if (!clean) return "";
        const wordCount = Math.max(1, clean.split(/\s+/).filter(Boolean).length);
        const durationMs = Math.max(2200, Math.round((wordCount / (wpm / 60)) * 1000));
        const startMs = currentTimeMs;
        const endMs = currentTimeMs + durationMs;
        currentTimeMs = endMs + 250;

        const formatSrtTime = (ms: number) => {
          const h = Math.floor(ms / 3600000);
          const m = Math.floor((ms % 3600000) / 60000);
          const s = Math.floor((ms % 60000) / 1000);
          const msRem = ms % 1000;
          return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(msRem).padStart(3, "0")}`;
        };

        return `${idx + 1}\n${formatSrtTime(startMs)} --> ${formatSrtTime(endMs)}\n${clean}\n`;
      })
      .filter(Boolean)
      .join("\n");
  };

  const getCleanFullScriptText = () => {
    if (!script) return "";
    if (script.structuredSegments && script.structuredSegments.length > 0) {
      return script.structuredSegments
        .map((s) => getCleanSpeechText(s.text))
        .filter(Boolean)
        .join(" ");
    }
    return getCleanSpeechText(script.scriptText || "");
  };

  const handleCopyFullScript = async () => {
    const text = getCleanFullScriptText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType("full_text");
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.warn("Failed copying script", e);
    }
  };

  const handleCopySegment = async (idx: number, text: string) => {
    const clean = getCleanSpeechText(text);
    try {
      await navigator.clipboard.writeText(clean);
      setCopiedType(`seg_${idx}`);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      console.warn("Failed copying segment", e);
    }
  };

  const handleExportTxt = () => {
    if (!script) return;
    const cleanFull = getCleanFullScriptText();
    const segmentsFormatted = script.structuredSegments
      ?.map((s, i) => `[${s.time}] Segment ${i + 1} (${s.label}):\n${getCleanSpeechText(s.text)}\n`)
      .join("\n") || cleanFull;

    const content = `TITLE: ${script.title || "Pitch Script"}
TARGET DURATION: ${script.spokenSeconds}s (~${formatTime(estimatedSpeakingSeconds)})
WORD COUNT: ${scriptWordCount} words
READING GRADE: ${script.readingGrade || "Grade 6"}
AI NARRATOR: ${AI_VOICES.find(v => v.id === selectedVoiceId)?.label || "Studio AI Voice"}
PLATFORM: Magneto Pro Pitch & Storyboard Studio
============================================================

FULL SPOKEN NARRATION SCRIPT:
${cleanFull}

============================================================
INDIVIDUAL SEGMENTS & TIME CODES:
${segmentsFormatted}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = `${(script.title || "Voiceover_Script").replace(/[^a-z0-9]/gi, "_")}.txt`;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSrt = () => {
    if (!script?.structuredSegments?.length) return;
    const srtContent = generateSrt(script.structuredSegments, WORDS_PER_MINUTE);
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = `${(script.title || "Pitch_Subtitles").replace(/[^a-z0-9]/gi, "_")}.srt`;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSynthesizedAudio = async () => {
    if (isExportingAudio || !script) return;
    setIsExportingAudio(true);
    try {
      const cleanText = getCleanFullScriptText();
      if (!cleanText) {
        setIsExportingAudio(false);
        return;
      }

      const targetVoiceObj = AI_VOICES.find(v => v.id === selectedVoiceId) || AI_VOICES[0];
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          voiceName: targetVoiceObj.voiceName
        })
      });

      const data = await response.json();
      if (data?.audioUrl) {
        const link = document.createElement("a");
        link.href = data.audioUrl;
        const filename = `${(script.title || "Pitch_Voiceover").replace(/[^a-z0-9]/gi, "_")}_${targetVoiceObj.voiceName}.wav`;
        link.download = filename;
        link.click();
        setCopiedType("audio_downloaded");
        setTimeout(() => setCopiedType(null), 3000);
      } else {
        alert("The AI Voiceover server is currently in quota cooldown or offline. You can still export the TXT or SRT subtitles, or copy the narration text!");
      }
    } catch (err) {
      console.error("Audio download error", err);
      alert("Unable to download synthesized audio. Please try again shortly.");
    } finally {
      setIsExportingAudio(false);
    }
  };

  const [isServerQuotaCooldown, setIsServerQuotaCooldown] = useState(false);

  // Speak with browser Web Speech API (fallback or when system voice selected)
  const speakWithBrowser = (text: string, onEnd: () => void, currentSeqId: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (currentSeqId === sequenceIdRef.current && isPlayingRef.current) onEnd();
      return;
    }

    let isCompleted = false;
    const safeEnd = () => {
      if (isCompleted) return;
      isCompleted = true;
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      currentUtteranceRef.current = null;
      if (currentSeqId === sequenceIdRef.current && isPlayingRef.current) {
        onEnd();
      }
    };

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;

      if (selectedVoiceId.startsWith("sys_")) {
        const sysIdx = parseInt(selectedVoiceId.replace("sys_", ""), 10);
        if (browserVoices[sysIdx]) {
          utterance.voice = browserVoices[sysIdx];
        }
      } else if (browserVoices.length > 0) {
        const isFemale = selectedVoiceId === "ai_kore" || selectedVoiceId === "ai_zephyr";
        const matched = browserVoices.find(v => {
          const n = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          if (!lang.startsWith("en")) return false;
          if (isFemale) {
            return n.includes("female") || n.includes("samantha") || n.includes("victoria") || n.includes("zira");
          } else {
            return n.includes("male") || n.includes("alex") || n.includes("daniel") || n.includes("david");
          }
        }) || browserVoices.find(v => v.lang.toLowerCase().startsWith("en")) || browserVoices[0];

        if (matched) utterance.voice = matched;
      }

      utterance.rate = speechRate;
      utterance.volume = isMuted ? 0 : speechVolume;

      // Watchdog timer to ensure playback never hangs in sandboxed iframes
      const wordCount = text.split(/\s+/).length;
      const estTimeMs = Math.max(3000, (wordCount / (120 * (speechRate || 1) / 60)) * 1000 + 4000);

      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = setTimeout(() => {
        safeEnd();
      }, estTimeMs);

      utterance.onend = () => {
        safeEnd();
      };
      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
          // Intentional stop/cancel, do not trigger sequence advancement
          isCompleted = true;
          if (watchdogTimerRef.current) {
            clearTimeout(watchdogTimerRef.current);
            watchdogTimerRef.current = null;
          }
          currentUtteranceRef.current = null;
          return;
        }
        safeEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis trigger notice:", err);
      safeEnd();
    }
  };

  // Play audio for a given text using Studio AI Voice or browser fallback
  const playSpeechText = async (text: string, onEnd: () => void, currentSeqId: number) => {
    // If sequence already changed or cancelled, bail immediately
    if (currentSeqId !== sequenceIdRef.current || !isPlayingRef.current) return;

    const cleanText = getCleanSpeechText(text);
    if (!cleanText) {
      if (currentSeqId === sequenceIdRef.current && isPlayingRef.current) onEnd();
      return;
    }

    let isCompleted = false;
    const safeEnd = () => {
      if (isCompleted) return;
      isCompleted = true;
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      if (currentSeqId === sequenceIdRef.current && isPlayingRef.current) {
        onEnd();
      }
    };

    // If system voice is explicitly selected or server quota is on cooldown, use instant browser speech
    if (selectedVoiceId.startsWith("sys_") || isServerQuotaCooldown) {
      speakWithBrowser(cleanText, safeEnd, currentSeqId);
      return;
    }

    // Use Gemini Studio AI voiceover via /api/generate-speech
    const targetVoiceObj = AI_VOICES.find(v => v.id === selectedVoiceId) || AI_VOICES[0];
    setIsLoadingAudio(true);

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          voiceName: targetVoiceObj.voiceName
        })
      });

      // Verify sequence is still active after asynchronous network round-trip
      if (currentSeqId !== sequenceIdRef.current || !isPlayingRef.current) {
        setIsLoadingAudio(false);
        return;
      }

      const data = await response.json();
      setIsLoadingAudio(false);

      if (data?.quotaCooldown) {
        setIsServerQuotaCooldown(true);
      }

      if (response.ok && data?.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audioPlayerRef.current = audio;
        audio.volume = isMuted ? 0 : speechVolume;
        audio.playbackRate = speechRate;

        // Watchdog for audio tag in case of decoding stall
        const wordCount = cleanText.split(/\s+/).length;
        const estAudioMs = Math.max(3500, (wordCount / (120 * (speechRate || 1) / 60)) * 1000 + 4000);
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = setTimeout(() => {
          safeEnd();
        }, estAudioMs);

        audio.onended = () => {
          audioPlayerRef.current = null;
          safeEnd();
        };

        audio.onerror = () => {
          audioPlayerRef.current = null;
          speakWithBrowser(cleanText, safeEnd, currentSeqId);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((playErr) => {
            console.warn("Audio autoplay blocked by browser policy, using browser voice engine:", playErr);
            audioPlayerRef.current = null;
            speakWithBrowser(cleanText, safeEnd, currentSeqId);
          });
        }
      } else {
        speakWithBrowser(cleanText, safeEnd, currentSeqId);
      }
    } catch (err) {
      setIsLoadingAudio(false);
      speakWithBrowser(cleanText, safeEnd, currentSeqId);
    }
  };

  // Speak full script or next segments in sequence
  const speakSegmentSequence = (startIndex: number = 0) => {
    if (!script?.structuredSegments?.length) return;

    const currentSeqId = ++sequenceIdRef.current;
    isPlayingRef.current = true;
    setIsPlaying(true);

    let currentIndex = startIndex;

    const speakNext = () => {
      // Abort if playback sequence was superseded or stopped
      if (currentSeqId !== sequenceIdRef.current || !isPlayingRef.current) {
        return;
      }

      if (currentIndex >= script.structuredSegments.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setActiveSegmentIndex(null);
        stopAllAudio();
        return;
      }

      setActiveSegmentIndex(currentIndex);

      // Auto-scroll teleprompter container safely without causing window/page layout jumps
      const segElement = document.getElementById(`teleprompter-seg-${currentIndex}`);
      if (segElement && scrollerRef.current) {
        const container = scrollerRef.current;
        const containerRect = container.getBoundingClientRect();
        const segRect = segElement.getBoundingClientRect();
        const targetScrollTop = container.scrollTop + (segRect.top - containerRect.top) - (container.clientHeight / 2) + (segRect.height / 2);
        container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
      }

      const segmentText = script.structuredSegments[currentIndex].text;
      playSpeechText(segmentText, () => {
        if (currentSeqId === sequenceIdRef.current && isPlayingRef.current) {
          currentIndex++;
          speakNext();
        }
      }, currentSeqId);
    };

    speakNext();
  };

  // Play single segment audio preview
  const handlePlaySingleSegment = (index: number) => {
    if (!script?.structuredSegments[index]) return;

    if (isSpeakingSegment === index) {
      stopAllAudio();
      setIsSpeakingSegment(null);
      return;
    }

    stopAllAudio();
    const currentSeqId = ++sequenceIdRef.current;
    isPlayingRef.current = true;
    setIsSpeakingSegment(index);
    setIsPlaying(false);
    setActiveSegmentIndex(null);

    const segmentText = script.structuredSegments[index].text;
    playSpeechText(segmentText, () => {
      setIsSpeakingSegment(null);
      isPlayingRef.current = false;
    }, currentSeqId);
  };

  // Manual practice scroll loop (when voiceover is disabled or user practices silently)
  useEffect(() => {
    if (isPlaying && !isVoiceoverEnabled) {
      const scroll = () => {
        if (scrollerRef.current) {
          const container = scrollerRef.current;
          scrollPositionRef.current += scrollSpeed * 0.15;

          if (scrollPositionRef.current >= container.scrollHeight - container.clientHeight + 100) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            stopAllAudio();
            setActiveSegmentIndex(null);
            return;
          }
          container.scrollTop = scrollPositionRef.current;
        }
        animationRef.current = requestAnimationFrame(scroll);
      };
      animationRef.current = requestAnimationFrame(scroll);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, isVoiceoverEnabled, scrollSpeed]);

  // Handle master Play / Pause toggle
  const handleTogglePlay = () => {
    if (isPlayingRef.current) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      stopAllAudio();
      setActiveSegmentIndex(null);
      setIsSpeakingSegment(null);
    } else {
      if (remainingSeconds === 0) {
        setElapsedSeconds(0);
      }
      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsSpeakingSegment(null);
      if (isVoiceoverEnabled) {
        speakSegmentSequence(activeSegmentIndex || 0);
      }
    }
  };

  // Handle teleprompter reset
  const handleReset = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    stopAllAudio();
    setActiveSegmentIndex(null);
    setIsSpeakingSegment(null);
    setElapsedSeconds(0);
    scrollPositionRef.current = 0;
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
    }
  };

  // Format emphasis cues
  const formatCue = (text: string) => {
    const words = text.split(" ");
    return words.map((w, index) => {
      if (w.includes("[EMPHASIS]") || w.includes("EMPHASIS")) {
        return (
          <span key={index} className="text-amber-400 font-extrabold uppercase bg-amber-500/10 px-1 rounded-sm border border-amber-500/10">
            {w.replace("[EMPHASIS]", "")}
          </span>
        );
      }
      if (w.includes("[PAUSE]") || w.includes("PAUSE")) {
        return (
          <span key={index} className="text-indigo-400 font-semibold text-[11px] font-mono tracking-widest bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/15 select-none">
            ⏱️ PAUSE
          </span>
        );
      }
      return w + " ";
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                AI Generation Progress
              </span>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                {progressStage || "Analyzing parameters..."}
              </h4>
            </div>
            <span className="text-xl font-mono font-black text-slate-100">
              {progressPercent || 20}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
            <div 
              className="bg-indigo-500 h-full transition-all duration-500 ease-out rounded-full animate-pulse"
              style={{ width: `${progressPercent || 20}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3.5">
          <h5 className="text-[10px] uppercase font-mono font-black tracking-widest text-indigo-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Live Script Stream Feed (Gemini)
          </h5>
          <p className="text-xs font-mono text-slate-350 leading-relaxed max-h-44 overflow-y-auto whitespace-pre-wrap">
            {streamingText ? (
              `${streamingText}█`
            ) : (
              <span className="text-slate-500">Injecting hook, writing direct response narration, parsing scenes...</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl space-y-4 text-center">
        <h4 className="text-base font-bold text-rose-300">Script Generation Notice</h4>
        <p className="text-xs text-rose-200/80 max-w-md mx-auto">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Script Generation
          </button>
        )}
      </div>
    );
  }

  if (!script || !script.structuredSegments || script.structuredSegments.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <Play className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-200">No Teleprompter Script Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose a hook from Step 1 to generate your full spoken teleprompter script and storyboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Teleprompter Meta Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-400">
            Spoken Script • {script.spokenSeconds}s Target
          </span>
          <h3 className="text-base font-bold text-slate-100">{script.title || "Pitch Script"}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center min-w-[95px] shadow-sm">
            <span className="text-[10px] block font-mono text-slate-500 uppercase flex items-center justify-center gap-1">
              <Timer className="w-3 h-3 text-indigo-400" /> Countdown
            </span>
            <span className={`text-xs font-bold font-mono ${
              remainingSeconds === 0
                ? "text-rose-400"
                : remainingSeconds <= 10 && isPlaying
                ? "text-amber-400 animate-pulse"
                : isPlaying
                ? "text-emerald-400"
                : "text-indigo-400"
            }`}>
              {formatTime(remainingSeconds)}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center hidden sm:block">
            <span className="text-[10px] block font-mono text-slate-500 uppercase">Est. Speaking</span>
            <span className="text-xs font-bold text-slate-200 font-mono">
              ~{formatTime(estimatedSpeakingSeconds)}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center">
            <span className="text-[10px] block font-mono text-slate-500 uppercase">Words</span>
            <span className="text-xs font-bold text-slate-200">{scriptWordCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center">
            <span className="text-[10px] block font-mono text-slate-500 uppercase">Grade Level</span>
            <span className="text-xs font-bold text-indigo-400">{script.readingGrade || "Grade 6"}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-center">
            <span className="text-[10px] block font-mono text-slate-500 uppercase">Segments</span>
            <span className="text-xs font-bold text-emerald-400">{script.structuredSegments.length}</span>
          </div>
        </div>
      </div>

      {/* Voiceover Export & Audio Delivery Hub */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
              <Download className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Voiceover Export & Audio Delivery
            </h4>
          </div>
          <p className="text-xs text-slate-400">
            Export narration text, download synthesized studio audio, or grab video-ready subtitle timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Copy Script Narration */}
          <button
            type="button"
            onClick={handleCopyFullScript}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition border cursor-pointer ${
              copiedType === "full_text"
                ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200"
            }`}
            title="Copy clean spoken narration text to clipboard"
          >
            {copiedType === "full_text" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Voiceover!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          {/* Download Synthesized Audio (MP3/WAV) */}
          <button
            type="button"
            onClick={handleDownloadSynthesizedAudio}
            disabled={isExportingAudio}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition border cursor-pointer ${
              copiedType === "audio_downloaded"
                ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                : "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-sm disabled:opacity-60"
            }`}
            title="Synthesize and download audio file (WAV / MP3 format)"
          >
            {isExportingAudio ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Audio...</span>
              </>
            ) : copiedType === "audio_downloaded" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Downloaded!</span>
              </>
            ) : (
              <>
                <FileAudio className="w-3.5 h-3.5" />
                <span>Download Audio</span>
              </>
            )}
          </button>

          {/* Export TXT */}
          <button
            type="button"
            onClick={handleExportTxt}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer"
            title="Download formatted teleprompter script as .txt"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export TXT</span>
          </button>

          {/* Export SRT Subtitles */}
          <button
            type="button"
            onClick={handleExportSrt}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer"
            title="Download timed subtitle file (.srt) for Premiere, CapCut, DaVinci"
          >
            <Subtitles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export SRT</span>
          </button>
        </div>
      </div>

      {/* AI Voiceover Control Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${isVoiceoverEnabled ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}>
              {isVoiceoverEnabled ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  AI Voiceover Speech Engine
                </h4>
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${isVoiceoverEnabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                  {isVoiceoverEnabled ? "ENABLED" : "MUTED"}
                </span>
                {isLoadingAudio && (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Synthesizing...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Synchronized studio text-to-speech with auto-scrolling line tracking & natural voices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                const nextState = !isVoiceoverEnabled;
                setIsVoiceoverEnabled(nextState);
                if (!nextState) stopAllAudio();
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
                isVoiceoverEnabled
                  ? "bg-indigo-600 hover:bg-indigo-500 text-slate-100 border-indigo-500"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
            >
              {isVoiceoverEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {isVoiceoverEnabled ? "Voiceover Active" : "Enable Voiceover"}
            </button>

            <button
              type="button"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={`p-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                showVoiceSettings
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title="Voice Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Voiceover Settings Drawer */}
        {showVoiceSettings && (
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Voice Selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">AI Narrator Voice:</label>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => {
                    setSelectedVoiceId(e.target.value);
                    stopAllAudio();
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <optgroup label="Studio AI Voices (Gemini TTS)">
                    {AI_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </optgroup>
                  {browserVoices.length > 0 && (
                    <optgroup label="System / Browser Voices">
                      {browserVoices.slice(0, 10).map((v, i) => (
                        <option key={`sys_${i}`} value={`sys_${i}`}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Speech Speed / Pace Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>Narrator Pace Rate:</span>
                  <span className="text-indigo-400 font-bold">{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => {
                    const rate = Number(e.target.value);
                    setSpeechRate(rate);
                    if (audioPlayerRef.current) {
                      audioPlayerRef.current.playbackRate = rate;
                    }
                  }}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Speech Volume & Mute */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>Master Audio Volume:</span>
                  <span className="text-indigo-400 font-bold">{isMuted ? "0%" : `${Math.round(speechVolume * 100)}%`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextMute = !isMuted;
                      setIsMuted(nextMute);
                      if (audioPlayerRef.current) {
                        audioPlayerRef.current.volume = nextMute ? 0 : speechVolume;
                      }
                    }}
                    className="p-1.5 bg-slate-800 text-slate-300 hover:text-slate-100 rounded border border-slate-700 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : speechVolume}
                    onChange={(e) => {
                      const vol = Number(e.target.value);
                      setIsMuted(false);
                      setSpeechVolume(vol);
                      if (audioPlayerRef.current) {
                        audioPlayerRef.current.volume = vol;
                      }
                    }}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Audio Reset Row */}
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/50 text-slate-400 font-mono">
              <span>Speech Engine Status: Active & Synced</span>
              <button
                type="button"
                onClick={() => {
                  stopAllAudio();
                  if (isPlaying && isVoiceoverEnabled) {
                    speakSegmentSequence(activeSegmentIndex || 0);
                  }
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Reset active audio playback context"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Voice Engine
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Teleprompter Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col h-[520px]">
        {/* Live Delivery Pacing & Countdown HUD Bar */}
        <div className="bg-slate-900/95 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-3 z-20 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border font-mono transition-colors shadow-sm ${
              remainingSeconds === 0
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : remainingSeconds <= 10 && isPlaying
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse"
                : isPlaying
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-200"
            }`}>
              <Timer className={`w-3.5 h-3.5 ${isPlaying ? "text-emerald-400 animate-spin" : "text-indigo-400"}`} />
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black tracking-tight">{formatTime(remainingSeconds)}</span>
                <span className="text-[10px] text-slate-400 font-normal">/ {formatTime(estimatedSpeakingSeconds)}</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="text-slate-500">•</span>
              <span>{scriptWordCount} words</span>
              <span className="text-slate-500">•</span>
              <span>Est. Pace: {WORDS_PER_MINUTE} WPM</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pacing status badge */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                !isPlaying
                  ? "bg-slate-500"
                  : remainingSeconds === 0
                  ? "bg-rose-500 animate-ping"
                  : remainingSeconds <= 10
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400 animate-pulse"
              }`} />
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-300">
                {!isPlaying
                  ? elapsedSeconds > 0 ? "Paused" : "Ready to Speak"
                  : remainingSeconds === 0
                  ? "Target Reached"
                  : remainingSeconds <= 10
                  ? "Finishing Up"
                  : "On Pace"}
              </span>
            </div>

            {elapsedSeconds > 0 && !isPlaying && (
              <button
                type="button"
                onClick={() => setElapsedSeconds(0)}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                title="Reset countdown timer"
              >
                Reset Timer
              </button>
            )}
          </div>
        </div>

        {/* Live Delivery Progress Bar */}
        <div className="w-full h-1 bg-slate-950 shrink-0 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              remainingSeconds === 0
                ? "bg-rose-500"
                : remainingSeconds <= 10
                ? "bg-amber-500"
                : "bg-indigo-500"
            }`}
            style={{ width: `${deliveryProgressPercent}%` }}
          />
        </div>

        {/* Alignment Focus Shade Helper & Laser Indicator */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-16 bg-slate-900/50 pointer-events-none border-y border-indigo-500/30 flex items-center justify-between px-3 z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping absolute -left-1" />
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 absolute -left-1" />
          <span className="text-[10px] uppercase font-mono font-black tracking-widest text-indigo-400/40 select-none hidden md:inline ml-auto mr-4">
            EYE LEVEL MARKER
          </span>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 absolute -right-1" />
        </div>

        {/* Teleprompter scrollable screen */}
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto px-8 md:px-16 py-32 space-y-8 select-none font-sans leading-relaxed text-center no-scrollbar"
          style={{ scrollBehavior: "auto" }}
        >
          {script.structuredSegments.map((seg, idx) => {
            const isActive = activeSegmentIndex === idx;
            const isSingleSpeaking = isSpeakingSegment === idx;

            return (
              <div
                key={idx}
                id={`teleprompter-seg-${idx}`}
                className={`space-y-3 mx-auto max-w-2xl p-5 rounded-2xl border transition-all duration-300 ${
                  isActive || isSingleSpeaking
                    ? "bg-indigo-950/60 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-102"
                    : "bg-transparent border-slate-900/40 opacity-90"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-block py-0.5 px-2.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold rounded-full uppercase">
                    {seg.time} | {seg.label}
                  </span>

                  {/* Segment Audio Listen Button */}
                  <button
                    type="button"
                    onClick={() => handlePlaySingleSegment(idx)}
                    className={`inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer border ${
                      isSingleSpeaking
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-bold animate-pulse"
                        : "bg-slate-900 hover:bg-slate-800 text-indigo-300 border-indigo-500/20"
                    }`}
                    title="Listen to this segment voiceover"
                  >
                    {isSingleSpeaking ? (
                      <>
                        <Square className="w-3 h-3 fill-slate-950" />
                        <span>Speaking...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Listen Segment</span>
                      </>
                    )}
                  </button>

                  {/* Copy Segment Line Button */}
                  <button
                    type="button"
                    onClick={() => handleCopySegment(idx, seg.text)}
                    className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer border ${
                      copiedType === `seg_${idx}`
                        ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                    title="Copy this segment line text"
                  >
                    {copiedType === `seg_${idx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Line</span>
                      </>
                    )}
                  </button>

                  {isActive && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      <Mic className="w-3 h-3" /> AI Speaking
                    </span>
                  )}
                </div>

                <p
                  style={{ fontSize: `${fontSize}px` }}
                  className={`font-bold tracking-tight ${isActive || isSingleSpeaking ? "text-white" : "text-slate-100"}`}
                >
                  {formatCue(seg.text)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Teleprompter panel controls */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 px-6">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-5 py-3 md:py-2.5 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer flex-1 md:flex-none ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 text-slate-100"
                  : "bg-indigo-600 hover:bg-indigo-500 text-slate-100"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-slate-100" />
                  Pause Speech & Scroller
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-100" />
                  Start Speech & Voiceover
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-3 min-h-[44px] min-w-[44px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center"
              title="Reset Teleprompter & Audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Live Countdown Badge in control bar */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-500 tracking-wider">Countdown</span>
                <span className={`text-xs font-mono font-bold ${
                  remainingSeconds === 0
                    ? "text-rose-400 font-extrabold"
                    : remainingSeconds <= 10 && isPlaying
                    ? "text-amber-400 animate-pulse"
                    : isPlaying
                    ? "text-emerald-400"
                    : "text-slate-200"
                }`}>
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
            {/* Speed scroll adjuster */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Speed:</span>
              <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="w-full sm:w-32 h-2.5 sm:h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 min-h-[36px]"
                />
                <span className="text-xs text-slate-300 font-mono w-4 font-bold text-center">{scrollSpeed}</span>
              </div>
            </div>

            {/* Font size adjuster */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Text Size:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="w-11 h-11 md:w-8 md:h-8 bg-slate-800 text-slate-300 hover:text-slate-100 rounded-md flex items-center justify-center border border-slate-700 font-mono text-xs cursor-pointer font-bold"
                  title="Zoom Out"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                  className="w-11 h-11 md:w-8 md:h-8 bg-slate-800 text-slate-300 hover:text-slate-100 rounded-md flex items-center justify-center border border-slate-700 font-mono text-xs cursor-pointer font-bold"
                  title="Zoom In"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
