import { Play, Pause, RotateCcw, RefreshCw, Volume2, VolumeX, Mic, Info, Gauge, Settings2, Sparkles, Square, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [scrollSpeed, setScrollSpeed] = useState(6); // scale from 1 (slow) to 20 (fast)
  const [fontSize, setFontSize] = useState(24); // clear text size
  
  // AI Voiceover state
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [isSpeakingSegment, setIsSpeakingSegment] = useState<number | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  // References to prevent Chrome V8 Garbage Collection mid-speech
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Safely stop and reset speech synthesis queue
  const safeCancelSpeech = () => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn("Speech synthesis cancel error:", err);
      }
    }
    currentUtteranceRef.current = null;
  };

  // Load available Speech Synthesis Voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        try {
          const availableVoices = window.speechSynthesis.getVoices();
          if (availableVoices && availableVoices.length > 0) {
            setVoices(availableVoices);
            // Prefer English voices or realistic natural voices
            const preferredIdx = availableVoices.findIndex(
              (v) => (v.lang.includes("en") || v.lang.includes("US") || v.name.includes("Natural")) && !v.name.includes("eSpeak")
            );
            if (preferredIdx !== -1) {
              setSelectedVoiceIndex(preferredIdx);
            }
          }
        } catch (e) {
          console.warn("Error fetching voices:", e);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      safeCancelSpeech();
    };
  }, []);

  // Cleanup speech on unmount or script change
  useEffect(() => {
    return () => {
      safeCancelSpeech();
    };
  }, [script]);

  // Chromium Keep-Alive Heartbeat: Chrome pauses speech after ~15s unless resumed
  useEffect(() => {
    if (isPlaying && isVoiceoverEnabled) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }
      }, 5000);
    } else {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [isPlaying, isVoiceoverEnabled]);

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

  // Speak full script or next segments in sequence
  const speakSegmentSequence = (startIndex: number = 0) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !script?.structuredSegments?.length) return;

    safeCancelSpeech();
    let currentIndex = startIndex;

    const speakNext = () => {
      if (currentIndex >= script.structuredSegments.length) {
        setIsPlaying(false);
        setActiveSegmentIndex(null);
        safeCancelSpeech();
        return;
      }

      setActiveSegmentIndex(currentIndex);

      // Auto scroll to active segment
      const segElement = document.getElementById(`teleprompter-seg-${currentIndex}`);
      if (segElement && scrollerRef.current) {
        segElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      const rawText = script.structuredSegments[currentIndex].text;
      const cleanText = getCleanSpeechText(rawText);

      if (!cleanText) {
        currentIndex++;
        speakNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtteranceRef.current = utterance; // Keep persistent ref to prevent V8 GC mid-speech!

      const currentVoices = window.speechSynthesis.getVoices();
      if (currentVoices && currentVoices[selectedVoiceIndex]) {
        utterance.voice = currentVoices[selectedVoiceIndex];
      }
      utterance.rate = speechRate;
      utterance.volume = isMuted ? 0 : speechVolume;

      // Watchdog safety timeout: if utterance gets stuck for any reason, force next
      const wordCount = cleanText.split(/\s+/).length;
      const estTimeMs = Math.max(3500, (wordCount / (150 * (speechRate || 1) / 60)) * 1000 + 4000);

      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = setTimeout(() => {
        console.warn(`[Speech Watchdog] Segment ${currentIndex} timed out after ${estTimeMs}ms. Moving to next segment.`);
        currentIndex++;
        speakNext();
      }, estTimeMs);

      utterance.onend = () => {
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
        currentIndex++;
        speakNext();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error on segment:", e);
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
        currentIndex++;
        speakNext();
      };

      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Failed to speak utterance:", err);
        currentIndex++;
        speakNext();
      }
    };

    speakNext();
  };

  // Play single segment audio preview
  const handlePlaySingleSegment = (index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !script?.structuredSegments[index]) return;

    if (isSpeakingSegment === index) {
      safeCancelSpeech();
      setIsSpeakingSegment(null);
      return;
    }

    safeCancelSpeech();
    setIsSpeakingSegment(index);

    const rawText = script.structuredSegments[index].text;
    const cleanText = getCleanSpeechText(rawText);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtteranceRef.current = utterance;

    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices && currentVoices[selectedVoiceIndex]) {
      utterance.voice = currentVoices[selectedVoiceIndex];
    }
    utterance.rate = speechRate;
    utterance.volume = isMuted ? 0 : speechVolume;

    utterance.onend = () => {
      setIsSpeakingSegment(null);
    };
    utterance.onerror = () => {
      setIsSpeakingSegment(null);
    };

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Single segment speak error:", err);
      setIsSpeakingSegment(null);
    }
  };

  // Read emphasis cues easily
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

  useEffect(() => {
    if (isPlaying) {
      // If voiceover is enabled, trigger sequential AI speech synthesis
      if (isVoiceoverEnabled) {
        speakSegmentSequence(activeSegmentIndex || 0);
      }

      const scroll = () => {
        if (scrollerRef.current) {
          const container = scrollerRef.current;
          scrollPositionRef.current += scrollSpeed * 0.12;

          if (scrollPositionRef.current >= container.scrollHeight - container.clientHeight + 100) {
            setIsPlaying(false);
            safeCancelSpeech();
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
      }
      safeCancelSpeech();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, scrollSpeed, isVoiceoverEnabled, selectedVoiceIndex, speechRate]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      safeCancelSpeech();
      setActiveSegmentIndex(null);
    } else {
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    safeCancelSpeech();
    setActiveSegmentIndex(null);
    setIsSpeakingSegment(null);
    scrollPositionRef.current = 0;
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Dynamic Real-time Progress Indicator */}
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

        {/* Live Streaming Text Block */}
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

        {/* Pulsing skeleton row below */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!script) {
    if (errorMessage) {
      return (
        <div className="py-14 px-6 text-center border border-rose-500/30 bg-rose-500/5 rounded-2xl space-y-4 max-w-xl mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-100">Script Generation Interrupted</h4>
            <p className="text-xs text-rose-300 font-mono leading-relaxed">{errorMessage}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-semibold text-xs rounded-xl shadow-lg border border-indigo-500 transition cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Script Generation
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
        <Info className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-sm text-slate-400 font-medium">No script generated yet.</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select or generate a hook from the "Magnetic Hooks" tab to unlock your teleprompter script and visual layouts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Teleprompter Analytics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Word Count</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{script.wordCount} words</div>
          <div className="text-xs text-slate-400 mt-1">Spoken pace estimated</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Target Duration</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">~{script.spokenSeconds} seconds</div>
          <div className="text-xs text-slate-400 mt-1">Ideal for short-form video</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Tone & Pace Score</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">6th Grade</div>
          <div className="text-xs text-slate-400 mt-1">Proven for spoken clarity</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Focus Delivery</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">Engaging</div>
          <div className="text-xs text-slate-400 mt-1">Direct-response CTA flow</div>
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
              </div>
              <p className="text-xs text-slate-400">
                Synchronized text-to-speech auto-scroller with line tracking & custom voices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsVoiceoverEnabled(!isVoiceoverEnabled)}
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
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {voices.length > 0 ? (
                    voices.map((v, i) => (
                      <option key={i} value={i}>
                        {v.name} ({v.lang})
                      </option>
                    ))
                  ) : (
                    <option value={0}>Default AI Voice Engine</option>
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
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
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
                    onClick={() => setIsMuted(!isMuted)}
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
                      setIsMuted(false);
                      setSpeechVolume(Number(e.target.value));
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
                  safeCancelSpeech();
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    const newVoices = window.speechSynthesis.getVoices();
                    if (newVoices.length > 0) setVoices(newVoices);
                  }
                  if (isPlaying) {
                    speakSegmentSequence(activeSegmentIndex || 0);
                  }
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Unstick browser audio context"
              >
                <RefreshCw className="w-3 h-3" />
                Unstick / Reset Voice Engine
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Teleprompter Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col h-[480px]">
        
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
                    {seg.time} — {seg.label}
                  </span>

                  {/* Segment Audio Listen Button */}
                  <button
                    onClick={() => handlePlaySingleSegment(idx)}
                    className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer border ${
                      isSingleSpeaking
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-bold animate-pulse"
                        : "bg-slate-900 hover:bg-slate-800 text-indigo-300 border-indigo-500/20"
                    }`}
                    title="Listen to this segment audio"
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
              onClick={handleReset}
              className="p-3 min-h-[44px] min-w-[44px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-xl border border-slate-700 transition cursor-pointer flex items-center justify-center"
              title="Reset Teleprompter & Audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
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
