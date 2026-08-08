import { Layers, Sparkles, HelpCircle, FileText, Check, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Hook } from "../types";

interface SlideAnalysisPoint {
  slideNumber: number;
  slideTitle: string;
  keySummary: string;
  videoSceneMapping: string;
}

interface DeckSummarizerResult {
  valueProp: string;
  proofPoints: string[];
  points: SlideAnalysisPoint[];
  associatedHooks: { id: string; type: string; text: string; score: number }[];
}

interface DeckSummarizerViewProps {
  onImportAssociatedHooks: (importedHooks: Hook[]) => void;
  activeProjectName?: string;
  onUpdateProjectConceptAndLoad: (concept: string, audience: string, outcome: string) => void;
}

export default function DeckSummarizerView({
  onImportAssociatedHooks,
  activeProjectName,
  onUpdateProjectConceptAndLoad,
}: DeckSummarizerViewProps) {
  const [deckText, setDeckText] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [targetOutcome, setTargetOutcome] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DeckSummarizerResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleProcessDeck = async () => {
    if (!deckText.trim()) {
      setErrorMessage("Please input layout copy or slide bullet points.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckText }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        throw new Error(data.error || "Failed to analyze slides.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Something went wrong on the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportAssociatedHooks = () => {
    if (!result) return;
    
    // Transform with essential missing elements for the full framework hook matches
    const mapped: Hook[] = result.associatedHooks.map((h, i) => ({
      id: `imported_${i}_${Date.now()}`,
      type: (h.type as any) || "Benefit",
      text: h.text,
      score: h.score || 85,
      explanation: "Synthesized directly from deck value statement."
    }));

    onImportAssociatedHooks(mapped);
    
    // Auto populate back to active campaign settings if desired
    onUpdateProjectConceptAndLoad(
      result.valueProp, 
      targetAudience || "Deck Audience Segment", 
      result.proofPoints.join(". ")
    );

    setSuccessMessage("Hooks successfully loaded into your main workshop! Toggle over to the 'Magnetic Hooks' tab to start editing your script!");
  };

  const loadExampleDeck = () => {
    setDeckText(
      "Slide 1: Intro\nMagneto - Video script and marketing copywrite robot.\nProblem: founders write boring deck copy and lose demos. Video pitches on LinkedIn/TikTok are too long or have zero focus/call to action.\n\nSlide 2: Value prop\nGenerate 15 hooks in minutes.\nFull teleprompter script under 60 seconds matching grade-6 simplified speech.\n\nSlide 3: Proof\nFounders using video outreach raise 40% faster. Direct response CTAs double the click rate.\n\nSlide 4: Solution\nHooks are ranked by scroll stop power. Teleprompter features adjustable scroll controls.\n\nSlide 5: pricing/cta\nBuild your first custom campaign for free today."
    );
    setTargetAudience("Venture capitalists, business angels, startup founders");
    setTargetOutcome("Accelerate presentation raise rates and multiply LinkedIn lead velocity");
  };

  return (
    <div className="space-y-6">
      {/* Description header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
          <Layers className="w-40 h-40 text-indigo-400" />
        </div>
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-slate-100">
              Deck-To-Video Synthesizer
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Have an existing deck (PDF / PPT / Notes)? Paste the layout copy or bullets below. Magneto will extract the central value proposition, synthesize key proofs, map slides to video storyboard scenes, and align high-converting video hooks automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Copy Paste Input Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-slate-400">Presentation Deck / Slides Notes</label>
              <button
                onClick={loadExampleDeck}
                className="text-[10px] text-indigo-400 hover:text-indigo-350 cursor-pointer font-semibold font-mono"
              >
                Load pitch template
              </button>
            </div>
            
            <textarea
              value={deckText}
              onChange={(e) => setDeckText(e.target.value)}
              placeholder="Paste slides layout draft, ppt logs, or sales bulletins..."
              className="w-full h-64 bg-slate-950 text-slate-300 p-3 rounded-lg border border-slate-850 focus:border-slate-700 focus:outline-none text-xs font-mono leading-relaxed"
            />

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-400">Main Pitch Audience (Optional)</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. angel institutional investors, retail buyers"
                className="w-full bg-slate-950 text-slate-350 px-3 py-2 text-xs rounded-lg border border-slate-850"
              />
            </div>

            <button
              onClick={handleProcessDeck}
              disabled={isProcessing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
              id="btn_deck_convert_convert"
            >
              {isProcessing ? "Extracting Slides & Mapping Scenes..." : "Synthesize Deck & Map Scenes"}
            </button>
          </div>
        </div>

        {/* Processing Result Display Column */}
        <div className="lg:col-span-7">
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl flex items-center gap-3 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-xs mb-4">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isProcessing ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl py-24 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1 max-w-sm">
                <p className="text-sm font-semibold text-slate-200">Processing slide taxonomy structure...</p>
                <p className="text-xs text-slate-500">Evaluating slide content logic into a 5-point value layout...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-5">
              {/* Extract Summary Block */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Core Value Proposition Phrase</span>
                  <p className="text-base font-extrabold text-slate-100 italic leading-snug">
                    "{result.valueProp}"
                  </p>
                </div>

                <div className="h-px bg-slate-800" />

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">Core Outcomes & Slides Proofs</span>
                  <ul className="space-y-1.5 list-disc pl-4">
                    {result.proofPoints.map((proof, idx) => (
                      <li key={idx} className="text-xs text-slate-350 font-mono leading-relaxed">{proof}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action trigger: load hooks */}
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow shadow-indigo-950">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Synthesized Hooks Available ({result.associatedHooks.length})
                  </h4>
                  <p className="text-[11px] text-slate-400">Import slide-mapped campaigns directly into the main hooks builder workspace.</p>
                </div>
                <button
                  onClick={handleImportAssociatedHooks}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer"
                  id="btn_import_associated_hooks"
                >
                  Load Into Workspace
                </button>
              </div>

              {/* Slides lists */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Slide-To-Video mapping schema ({result.points.length})</span>
                
                <div className="space-y-3">
                  {result.points.map((pt) => (
                    <div key={pt.slideNumber} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center font-bold font-mono text-xs text-indigo-400 shrink-0 select-none">
                        #{pt.slideNumber}
                      </div>

                      <div className="space-y-2 flex-1">
                        <h4 className="text-sm font-bold text-slate-200">{pt.slideTitle}</h4>
                        <p className="text-xs text-slate-350 leading-relaxed font-mono">
                          <span className="text-slate-500">Summary:</span> {pt.keySummary}
                        </p>
                        <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-950">
                          <span className="text-indigo-400 font-bold uppercase font-mono text-[9px] tracking-wider block mb-1">Visual scene mapping</span>
                          {pt.videoSceneMapping}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-800 rounded-xl py-24 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-sm text-slate-400 font-medium">Ready for layout analysis.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Paste your slide content into the box on the left, add targets, and press process.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
