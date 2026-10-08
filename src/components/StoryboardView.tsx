import { useState } from "react";
import { 
  Tv, 
  Copy, 
  Check, 
  Sparkles, 
  Video, 
  Download, 
  Sliders, 
  Layers, 
  Film, 
  Camera, 
  FileText,
  Clock,
  Type
} from "lucide-react";
import { StoryboardScene } from "../types";

export type AIModelPreset = "midjourney" | "flux" | "stablediffusion" | "runway";

interface StoryboardViewProps {
  scenes: StoryboardScene[];
  platform: '9:16' | '1:1' | '16:9';
  isLoading: boolean;
  onUpdateSceneImage?: (sceneId: string, imageUrl: string) => void;
}

const AVAILABLE_STYLES = [
  "Photorealistic",
  "Cinematic 4K",
  "Studio Lighting",
  "Hyper-detailed",
  "Dramatic Shadow",
  "Macro Lens",
  "Golden Hour",
  "Minimalist Modern",
  "Cyberpunk Neon",
  "Commercial Editorial"
];

export default function StoryboardView({
  scenes,
  platform,
  isLoading,
}: StoryboardViewProps) {
  const [selectedModel, setSelectedModel] = useState<AIModelPreset>("midjourney");
  const [copiedSceneId, setCopiedSceneId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeStyles, setActiveStyles] = useState<Record<string, string[]>>({});
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});

  const getPlatformLabel = () => {
    switch (platform) {
      case "9:16":
        return "9:16 Portrait (TikTok, Shorts, IG Reels)";
      case "1:1":
        return "1:1 Square (Feed, LinkedIn, Carousel)";
      case "16:9":
        return "16:9 Landscape (YouTube, Slide Pitch)";
    }
  };

  const getAspectRatioFlag = () => {
    switch (platform) {
      case "9:16":
        return "--ar 9:16";
      case "1:1":
        return "--ar 1:1";
      case "16:9":
        return "--ar 16:9";
    }
  };

  const toggleStyleTag = (sceneId: string, style: string) => {
    setActiveStyles((prev) => {
      const current = prev[sceneId] || ["Photorealistic", "Cinematic 4K"];
      const updated = current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style];
      return { ...prev, [sceneId]: updated };
    });
  };

  const getSceneSelectedStyles = (sceneId: string): string[] => {
    return activeStyles[sceneId] ?? ["Photorealistic", "Cinematic 4K"];
  };

  const formatPromptForModel = (
    scene: StoryboardScene,
    model: AIModelPreset,
    sceneIdx: number
  ): string => {
    const rawVisual = customPrompts[scene.id] ?? scene.visualPrompt;
    const styles = getSceneSelectedStyles(scene.id);
    const styleString = styles.length > 0 ? styles.join(", ") : "Cinematic";

    switch (model) {
      case "midjourney": {
        const ar = getAspectRatioFlag();
        return `${rawVisual}, shot in style of high-end advertising, ${styleString}, 8k photography, octane render ${ar} --v 6.1 --style raw`;
      }
      case "flux": {
        return `A cinematic high-fidelity photo of ${rawVisual}. ${styleString}, shot on Hasselblad 80mm lens, natural film grain, clean color science, authentic skin tones and studio composition, ${platform} ratio.`;
      }
      case "stablediffusion": {
        return `masterpiece, ultra-detailed 8k photography, (${rawVisual}:1.2), ${styleString}, sharp focus, subsurface scattering, trending on ArtStation, global illumination`;
      }
      case "runway": {
        const motion = scene.avatarDirection ? `Motion action: ${scene.avatarDirection}. ` : "Slow cinematic camera push-in. ";
        return `Cinematic 4K video clip, ${motion}${rawVisual}. Professional color grading, dynamic fluid motion, 24fps filmic shutter, ${styleString}.`;
      }
    }
  };

  const handleCopyPrompt = async (sceneId: string, promptText: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedSceneId(sceneId);
      setTimeout(() => setCopiedSceneId(null), 2500);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const handleCopyAllPrompts = async () => {
    try {
      const fullBatch = scenes
        .map((scene, idx) => {
          const formatted = formatPromptForModel(scene, selectedModel, idx);
          return `// SCENE ${idx + 1} (${scene.timestamp}) [${selectedModel.toUpperCase()}]\n${formatted}\n`;
        })
        .join("\n");

      await navigator.clipboard.writeText(fullBatch);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error("Batch copy failed", err);
    }
  };

  const handleDownloadPromptsTxt = () => {
    const content = scenes
      .map((scene, idx) => {
        const mjPrompt = formatPromptForModel(scene, "midjourney", idx);
        const fluxPrompt = formatPromptForModel(scene, "flux", idx);
        const sdPrompt = formatPromptForModel(scene, "stablediffusion", idx);
        const runwayPrompt = formatPromptForModel(scene, "runway", idx);

        return `========================================
SCENE ${idx + 1} (${scene.timestamp})
========================================
Overlay Text: ${scene.onScreenText || "N/A"}
Camera/Avatar: ${scene.avatarDirection || "N/A"}
Voiceover Script: ${scene.audioDescription || "N/A"}

[Midjourney Preset]:
${mjPrompt}

[Flux.1 Preset]:
${fluxPrompt}

[Stable Diffusion Preset]:
${sdPrompt}

[Runway Gen-3 Video Preset]:
${runwayPrompt}
`;
      })
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Storyboard_AI_Prompts_${platform.replace(":", "x")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-slate-900 border border-slate-800 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="h-5 bg-slate-800 rounded w-1/4" />
              <div className="h-24 bg-slate-800 rounded" />
              <div className="h-10 bg-slate-800 rounded" />
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
          Please select or generate a hook from the "Magnetic Hooks" tab to unlock your teleprompter script and visual prompt studio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prompt Studio Controls & Format Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Visual Prompt Studio
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {scenes.length} Scenes Ready
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Generate production-grade visuals for external AI image & video generators (Midjourney, Flux, SD, Runway).
          </p>
        </div>

        {/* Global Model Presets Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedModel("midjourney")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                selectedModel === "midjourney"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Midjourney
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("flux")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                selectedModel === "flux"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Flux.1
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("stablediffusion")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                selectedModel === "stablediffusion"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Stable Diff.
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("runway")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                selectedModel === "runway"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Runway Gen-3
            </button>
          </div>

          {/* Batch Actions */}
          <button
            type="button"
            onClick={handleCopyAllPrompts}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold font-mono border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Copy all scene prompts to clipboard formatted for current model"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">All Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All Prompts</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPromptsTxt}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-xl border border-slate-700 transition cursor-pointer"
            title="Download formatted prompts (.txt file with all models)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Aspect Ratio Callout */}
      <div className="bg-slate-900/50 border border-slate-800/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Target Aspect Ratio: <strong className="text-slate-200">{getPlatformLabel()}</strong>
        </div>
        <span className="text-[11px] font-mono text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
          Preset: {selectedModel.toUpperCase()}
        </span>
      </div>

      {/* Storyboard Prompt Cards */}
      <div className="space-y-5">
        {scenes.map((scene, idx) => {
          const formattedPrompt = formatPromptForModel(scene, selectedModel, idx);
          const currentStyles = getSceneSelectedStyles(scene.id);
          const isCopied = copiedSceneId === scene.id;

          return (
            <div
              key={scene.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm transition"
            >
              {/* Scene Card Header */}
              <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="py-1 px-3 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold rounded-lg">
                    SCENE {idx + 1}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{scene.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(scene.id, formattedPrompt)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition border cursor-pointer ${
                      isCopied
                        ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                        : "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-sm"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Prompt!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Formatted Prompt Display Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Optimized {selectedModel.toUpperCase()} Generation Prompt
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      Click to edit or adjust
                    </span>
                  </div>

                  <div className="relative group">
                    <textarea
                      value={customPrompts[scene.id] ?? formattedPrompt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomPrompts((prev) => ({ ...prev, [scene.id]: val }));
                      }}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 group-hover:border-slate-700 focus:border-indigo-500 focus:outline-none rounded-xl p-3.5 text-xs font-mono text-slate-200 leading-relaxed transition resize-y"
                    />
                  </div>
                </div>

                {/* Style Tags Selector */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 font-semibold">
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Quick Style Enhancers (Toggle to add tags):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_STYLES.map((style) => {
                      const isSelected = currentStyles.includes(style);
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => toggleStyleTag(scene.id, style)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition border cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-200 font-semibold"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                          }`}
                        >
                          {isSelected ? `✓ ${style}` : `+ ${style}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scene Script & Directorial Context Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  {/* On Screen Text Cue */}
                  <div className="bg-slate-950/70 border border-slate-800/70 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Type className="w-3 h-3 text-indigo-400" /> On-Screen Overlay Text
                    </span>
                    <p className="text-xs text-slate-200 font-semibold">
                      {scene.onScreenText || "None (B-roll focus)"}
                    </p>
                  </div>

                  {/* Physical / Avatar Motion */}
                  <div className="bg-slate-950/70 border border-slate-800/70 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Video className="w-3 h-3 text-indigo-400" /> Camera & Action Direction
                    </span>
                    <p className="text-xs text-slate-300">
                      {scene.avatarDirection || "Static presenter / focal shot"}
                    </p>
                  </div>

                  {/* Spoken Voiceover Cue */}
                  <div className="bg-slate-950/70 border border-slate-800/70 p-3 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3 text-indigo-400" /> Voiceover Script Cue
                    </span>
                    <p className="text-xs text-slate-300 italic">
                      "{scene.audioDescription || "..."}"
                    </p>
                  </div>
                </div>

                {/* Special Helper for Stable Diffusion: Negative Prompt Snippet */}
                {selectedModel === "stablediffusion" && (
                  <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="truncate pr-2">
                      <strong className="text-slate-300">Negative Prompt:</strong> blurry, low quality, distorted anatomy, text, watermark, cropped
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("blurry, low quality, distorted anatomy, extra limbs, bad proportions, text, watermark, cropped, deformed");
                        setCopiedSceneId(`neg_${scene.id}`);
                        setTimeout(() => setCopiedSceneId(null), 2000);
                      }}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[10px] shrink-0 cursor-pointer"
                    >
                      {copiedSceneId === `neg_${scene.id}` ? "Copied Neg" : "Copy Neg"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
