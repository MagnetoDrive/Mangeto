import { Trophy, Copy, Check, Sparkles, AlertCircle, ChevronRight, RefreshCw, Eye } from "lucide-react";
import { useState } from "react";
import { Hook, HookType } from "../types";

interface HookEngineViewProps {
  hooks: Hook[];
  selectedHookId?: string;
  onSelectHook: (hook: Hook) => void;
  onViewScript?: () => void;
  isLoading: boolean;
  isGeneratingScript?: boolean;
  hasScript?: boolean;
}

export default function HookEngineView({
  hooks,
  selectedHookId,
  onSelectHook,
  onViewScript,
  isLoading,
  isGeneratingScript = false,
  hasScript = false,
}: HookEngineViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(hooks.map((h) => h.type)))];

  // Filter and sort hooks so the top scored ones are highlighted
  const filteredHooks = hooks.filter((h) => filterType === "All" || h.type === filterType);
  const sortedHooks = [...filteredHooks].sort((a, b) => b.score - a.score);

  // Top 3 ranked across the entire generated output
  const overallTop3 = [...hooks]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((h) => h.id);

  const getCategoryColor = (type: HookType) => {
    switch (type) {
      case "Problem":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Curiosity Gap":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Contrarian":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Proof":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "FOMO":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Benefit":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "Story":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro and Info Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-40 h-40 text-indigo-400" />
        </div>
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              The Hook Generator Engine
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Top modern direct-response strategies mapped into 8-12 word high-impact attention grabbers. Select the hook that best matches your target visual tone, and we will instantly formulate a custom spoken video script and dynamic B-roll storyboard.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="flex gap-2 overflow-x-auto pb-1.5 border-b border-slate-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 w-16 bg-slate-900 rounded-full shrink-0" />
            ))}
          </div>
          <div className="space-y-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-slate-800 bg-slate-900/40 rounded-xl h-32 p-4 flex gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/4" />
                  <div className="h-5 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : hooks.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">Magneto — Pull attention. Keep it.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-mono">
            Input your concept profile on the left control panel, then press "Formulate 15 Hooks" or brainstorm with Magneto Copilot.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filtering Sub-nav */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar border-b border-slate-800">
            <span className="text-xs text-slate-500 font-medium font-mono uppercase mr-2 py-1">Filter Type:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-3 py-1 text-xs rounded-full border transition whitespace-nowrap cursor-pointer ${
                  filterType === cat
                    ? "bg-slate-200 text-slate-900 border-slate-200 font-semibold"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-250"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List of hooks */}
          <div className="grid grid-cols-1 gap-3.5">
            {sortedHooks.map((hook, idx) => {
              const isTop3 = overallTop3.includes(hook.id);
              const rankIndex = overallTop3.indexOf(hook.id) + 1;
              const isSelected = selectedHookId === hook.id;

              return (
                <div
                  key={hook.id}
                  className={`border rounded-xl transition duration-200 relative overflow-hidden group ${
                    isSelected
                      ? "bg-slate-900/60 border-indigo-500 text-slate-200 ring-1 ring-indigo-500/20"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40"
                  }`}
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Rank Metric or Category badge */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-center">
                        <div className="text-xl font-black font-mono text-indigo-400 tracking-tight">
                          {hook.score}%
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold">
                          Stop Score
                        </div>
                      </div>

                      {isTop3 && (
                        <span className="inline-flex py-1 px-1.5 bg-indigo-600/20 text-indigo-400 text-[10px] font-extrabold uppercase rounded border border-indigo-500/30 text-center select-none shadow shadow-indigo-950">
                          ⭐ Rank {rankIndex}
                        </span>
                      )}
                    </div>

                    {/* Meta info & content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded border uppercase ${getCategoryColor(hook.type)}`}>
                          {hook.type}
                        </span>
                      </div>

                      <blockquote className="text-base font-bold text-slate-100 tracking-tight leading-snug">
                        "{hook.text}"
                      </blockquote>
                      
                      <div className="text-xs text-slate-400 italic">
                        {hook.explanation}
                      </div>
                    </div>

                    {/* Copy/Use actions */}
                    <div className="flex flex-col gap-2 shrink-0 items-end">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(hook.text, hook.id)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 transition cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === hook.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {isSelected && isGeneratingScript ? (
                        <button
                          disabled
                          className="text-xs font-semibold px-3 py-2 rounded-lg border border-indigo-500/50 bg-indigo-600/30 text-indigo-300 flex items-center gap-1.5 cursor-wait"
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Formulating Script...
                        </button>
                      ) : isSelected && hasScript ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onViewScript && onViewScript()}
                            className="text-xs font-bold px-3 py-2 rounded-lg border border-emerald-500/80 bg-emerald-600 hover:bg-emerald-500 text-slate-100 flex items-center gap-1.5 shadow transition cursor-pointer"
                            title="View your generated script in Teleprompter view"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Script
                          </button>
                          <button
                            onClick={() => onSelectHook(hook)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="Regenerate script from this hook"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectHook(hook)}
                          className={`text-xs font-semibold px-3.5 py-2 rounded-lg border transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 hover:bg-indigo-500 text-slate-100 border-indigo-500 shadow"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                          }`}
                        >
                          {isSelected ? "Retry Script" : "Generate Script"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
