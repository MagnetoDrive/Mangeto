import { Tv, Sparkles, Image as ImageIcon, Volume2, Video, RefreshCw, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { StoryboardScene } from "../types";

interface StoryboardViewProps {
  scenes: StoryboardScene[];
  platform: '9:16' | '1:1' | '16:9';
  isLoading: boolean;
  onUpdateSceneImage: (sceneId: string, imageUrl: string) => void;
}

export default function StoryboardView({
  scenes,
  platform,
  isLoading,
  onUpdateSceneImage,
}: StoryboardViewProps) {
  const [sketchingId, setSketchingId] = useState<string | null>(null);
  const [sketchError, setSketchError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [retryCounts, setRetryCounts] = useState<Record<string, number>>({});

  // Map platform ratios to beautiful UI visual configurations
  const getPlatformLabel = () => {
    switch (platform) {
      case "9:16":
        return "9:16 Portrait (Shorts, TikTok, IG Reels)";
      case "1:1":
        return "1:1 Square (LinkedIn, Twitter Feeds)";
      case "16:9":
        return "16:9 Landscape (YouTube, Slide Decks, Investor Pitches)";
    }
  };

  const getPlatformStyles = () => {
    switch (platform) {
      case "9:16":
        return "aspect-[9/16] w-[140px] sm:w-[160px] mx-auto";
      case "1:1":
        return "aspect-square w-full max-w-[280px] lg:max-w-full";
      case "16:9":
        return "aspect-video w-full max-w-[320px] lg:max-w-full";
    }
  };

  const generateSketch = async (scene: StoryboardScene) => {
    setSketchingId(scene.id);
    setSketchError(null);
    setFailedImages((prev) => ({ ...prev, [scene.id]: false }));

    try {
      // Pass a fresh random seed on every call to trigger a new image generation
      const seed = Date.now() + Math.floor(Math.random() * 1000000);
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: `${scene.visualPrompt}. Style: cinematic storyboard, high resolution shot.`,
          seed: seed
        }),
      });
      const data = await response.json();
      if (response.ok && data.imageUrl) {
        onUpdateSceneImage(scene.id, data.imageUrl);
      } else {
        throw new Error(data.error || "Failed to generate thumbnail.");
      }
    } catch (err: any) {
      console.error(err);
      setSketchError(`Image generation failed: ${err.message || "Is connection secure?"}`);
      setFailedImages((prev) => ({ ...prev, [scene.id]: true }));
    } finally {
      setSketchingId(null);
    }
  };

  const handleImageError = (scene: StoryboardScene) => {
    const currentRetries = retryCounts[scene.id] || 0;
    if (currentRetries < 1) {
      // Automatically attempt 1 retry fetch with fresh seed
      setRetryCounts((prev) => ({ ...prev, [scene.id]: currentRetries + 1 }));
      generateSketch(scene);
    } else {
      // Display Refresh button directly on broken placeholder
      setFailedImages((prev) => ({ ...prev, [scene.id]: true }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-slate-900 border border-slate-800 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col lg:flex-row h-44 overflow-hidden">
              <div className="w-full lg:w-72 bg-slate-950 p-5 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0">
                <div className="w-32 h-32 bg-slate-900 rounded-lg" />
              </div>
              <div className="flex-grow p-5 space-y-4">
                <div className="h-4 bg-slate-800 rounded w-1/4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-slate-800 rounded" />
                  <div className="h-10 bg-slate-800 rounded" />
                </div>
                <div className="h-8 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
        <Tv className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-sm text-slate-400 font-medium">No storyboard scenes compiled.</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select or generate a hook from the "Magnetic Hooks" tab to unlock your teleprompter script and visual layouts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Specification Segment */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">Format Recommendation</h4>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">{getPlatformLabel()}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-950 text-indigo-400 text-xs font-mono font-semibold rounded-full border border-slate-800">
          CAPTIONS PROVIDED BY DEFAULT
        </div>
      </div>

      {sketchError && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-lg flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{sketchError}</span>
        </div>
      )}

      {/* Grid of Scenes */}
      <div className="space-y-4">
        {scenes.map((scene, idx) => {
          // Check if scene has generated thumbnail or fallback placeholder
          const hasImage = (scene as any).imageUrl;

          return (
            <div
              key={scene.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition hover:border-slate-700 flex flex-col lg:flex-row"
            >
              {/* Scene Frame Render Box */}
              <div className="w-full lg:w-72 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-5 flex flex-col items-center justify-center relative group shrink-0">
                <span className="absolute top-4 left-4 z-10 py-1 px-2.5 bg-slate-900 text-slate-300 text-[10px] font-mono font-extrabold rounded-full border border-slate-800">
                  SCENE {idx + 1}
                </span>

                <div className={`${getPlatformStyles()} relative bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center shadow-inner mt-4 lg:mt-0`}>
                  {failedImages[scene.id] ? (
                    <div className="p-4 space-y-2 text-center flex flex-col items-center justify-center w-full h-full bg-slate-950/95">
                      <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
                      <p className="text-[10px] text-rose-300 font-mono font-bold">Image Failed to Load</p>
                      <button
                        onClick={() => generateSketch(scene)}
                        disabled={sketchingId !== null}
                        className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                        title="Click to retry image generation"
                      >
                        <RefreshCw className={`w-3 h-3 ${sketchingId === scene.id ? "animate-spin" : ""}`} />
                        <span>Refresh Image</span>
                      </button>
                    </div>
                  ) : hasImage ? (
                    <img
                      src={(scene as any).imageUrl}
                      alt={`Scene ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError(scene)}
                    />
                  ) : (
                    <div className="p-4 space-y-2">
                      <ImageIcon className="w-8 h-8 text-slate-700 mx-auto" />
                      <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold">Storyboard Frame</div>
                    </div>
                  )}

                  {/* On screen text watermark rendering */}
                  {scene.onScreenText && (
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 p-1.5 rounded text-center border border-slate-800 pointer-events-none select-none">
                      <p className="text-[9px] font-black tracking-wider text-slate-100 font-mono truncate">
                        Overlay: "{scene.onScreenText}"
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => generateSketch(scene)}
                  disabled={sketchingId !== null}
                  className="mt-4 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-mono text-xs font-semibold tracking-wider rounded-lg border border-slate-800 hover:border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  id={`btn_generate_sketch_${scene.id}`}
                >
                  {sketchingId === scene.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {hasImage ? "Regenerate Image" : "Generate Image"}
                </button>
              </div>

              {/* Scene Instructions list */}
              <div className="flex-1 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100 font-mono">{scene.timestamp}</span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-widest font-mono">Short-form sequence</span>
                  </div>

                  {/* Regenerate Button in Header */}
                  <button
                    onClick={() => generateSketch(scene)}
                    disabled={sketchingId !== null}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-mono text-xs font-semibold rounded-lg border border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    title="Generate a fresh new AI image for this scene"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sketchingId === scene.id ? "animate-spin text-amber-300" : ""}`} />
                    <span>{sketchingId === scene.id ? "Generating..." : hasImage ? "Regenerate Image" : "Generate Image"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visual Instructions */}
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Tv className="w-3.5 h-3.5 text-slate-500" /> Visual shot list details
                    </h5>
                    <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-950 leading-relaxed font-mono">
                      {scene.visualPrompt}
                    </p>
                  </div>

                  {/* Character/Avatar actions and gestures */}
                  <div className="space-y-1.5">
                    <h5 className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-slate-500" /> Physical/Avatar Direction
                    </h5>
                    <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-950 leading-relaxed">
                      {scene.avatarDirection}
                    </p>
                  </div>
                </div>

                {/* Subtitle Voiceover and Sound Effects */}
                <div className="space-y-2 border-t border-slate-800/40 pt-3">
                  <div className="flex items-start gap-3 bg-indigo-500/[0.03] border border-indigo-500/10 p-3 rounded-lg">
                    <div className="p-1 px-1.5 bg-indigo-500/10 text-indigo-400 font-mono font-extrabold text-[9px] rounded mt-0.5" title="Script Voice">
                      VO
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
                      "{scene.audioDescription}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
