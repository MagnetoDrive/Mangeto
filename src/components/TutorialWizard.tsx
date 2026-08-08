import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, ChevronRight, ChevronLeft, ArrowRight, X, Play, RefreshCw, Eye, BookOpen, Layers } from "lucide-react";
import { Hook, StoryboardScene, Script } from "../types";
import { safeStorage } from "../lib/storage";

interface TutorialWizardProps {
  isOpen: boolean;
  onClose: () => void;
  concept: string;
  setConcept: (val: string) => void;
  audience: string;
  setAudience: (val: string) => void;
  outcome: string;
  setOutcome: (val: string) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  hooks: Hook[];
  onGenerateHooks: () => Promise<void>;
  script?: Script;
  scenes: StoryboardScene[];
}

export default function TutorialWizard({
  isOpen,
  onClose,
  concept,
  setConcept,
  audience,
  setAudience,
  outcome,
  setOutcome,
  activeTab,
  setActiveTab,
  hooks,
  onGenerateHooks,
  script,
  scenes,
}: TutorialWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  // Total steps:
  // 0: Welcome dialog
  // 1: Step 1 - Enter Campaign Settings (forced example typing)
  // 2: Step 2 - Formulate Hooks (Stop scores explainer)
  // 3: Step 3 - Teleprompter Controls (Voiceover)
  // 4: Step 4 - Storyboard scenes
  // 5: Step 5 - Marketing Kit / Distribution channels
  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Auto-toggle tabs based on the tutorial step to align layout context
      if (nextStep === 2) {
        setActiveTab("hooks");
      } else if (nextStep === 3) {
        setActiveTab("teleprompter");
      } else if (nextStep === 4) {
        setActiveTab("storyboard");
      } else if (nextStep === 5) {
        setActiveTab("marketing");
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Auto-toggle tabs based on the tutorial step to align layout context
      if (prevStep === 2) {
        setActiveTab("hooks");
      } else if (prevStep === 3) {
        setActiveTab("teleprompter");
      } else if (prevStep === 4) {
        setActiveTab("storyboard");
      } else if (prevStep === 5) {
        setActiveTab("marketing");
      }
    }
  };

  const handleSkip = () => {
    safeStorage.setItem("magneto_tutorial_viewed", "true");
    onClose();
  };

  const handleComplete = () => {
    safeStorage.setItem("magneto_tutorial_viewed", "true");
    onClose();
  };

  const fillExample = () => {
    setConcept("AI note taker for founders who hate meetings");
    setAudience("Founders, VC investors, agency directors who attend back-to-back calls");
    setOutcome("Reduces post-call alignment overhead by 8 hours each week and builds instant transcripts.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
      {/* Target area highlighting or spotlight can be conceptually styled around this dialog */}
      
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 mx-4">
        {/* Step markers */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold rounded-md">
              Tutorial {currentStep > 0 ? `${currentStep}/${totalSteps - 1}` : "Intro"}
            </span>
            <h4 className="text-sm font-bold text-slate-100 font-sans">
              {currentStep === 0 && "Welcome to Magneto!"}
              {currentStep === 1 && "Step 1: Set Target Parameters"}
              {currentStep === 2 && "Step 2: Formulate 15 Hooks"}
              {currentStep === 3 && "Step 3: Edit Teleprompter Script"}
              {currentStep === 4 && "Step 4: View B-Roll Storyboard"}
              {currentStep === 5 && "Step 5: Copy Distributed Marketing Kit"}
            </h4>
          </div>
          <button
            onClick={handleSkip}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition cursor-pointer"
            id="tutorial_close_btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic tutorial step graphics & text */}
        <div className="space-y-4">
          {currentStep === 0 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/40">
                <Sparkles className="w-8 h-8 text-white fill-white/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-tight text-slate-100">
                  Magneto turns your idea into a video in under 60 seconds
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                  Never write a boring pitch script again. In 4 clear steps, we generate scroll-stopping presentation hooks, a full teleprompter script, visual B-roll storyboard sketches, and cross-channel distribution posts.
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-350 leading-relaxed">
                Provide basic details about your product idea on the left dashboard pane. To guarantee high resonance, force a specific concept, audience, and core outcome.
              </p>
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3.5">
                <div className="text-[11px] font-mono text-indigo-400/80 font-bold uppercase tracking-wider">
                  👉 Interactive Action: Force typing the example:
                </div>
                <div className="p-3 bg-slate-900 border border-indigo-500/20 text-xs font-mono rounded-lg text-slate-200 flex flex-col gap-1">
                  <div><strong>Idea:</strong> "AI note taker for founders who hate meetings"</div>
                </div>
                <button
                  type="button"
                  onClick={fillExample}
                  className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs rounded-lg border border-indigo-500/30 transition cursor-pointer"
                >
                  🎭 Click to Auto-Fill Example
                </button>
                {concept && (
                  <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 mt-1 animate-pulse">
                    ✔️ Example variables successfully populated! Press next to continue.
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-350 leading-relaxed">
                Press the <strong className="text-slate-100">Formulate 15 Hooks</strong> button to write attention-grabbing lines. High-speed scroll-stop heuristics grade their power out of 100%.
              </p>
              <div className="border border-slate-800 p-4 rounded-xl bg-slate-950/60 space-y-3.5">
                <h5 className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                  Understanding Stop Scores & Categories
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hooks are categorized as <em className="text-amber-400">Curiosity Gap</em>, <em className="text-rose-450">Problem</em>, or <em className="text-emerald-400">Proof</em>. Select any hook card to expand it into a full direct-response marketing video kit.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-indigo-500 h-full w-[80%]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">80% Stop Power</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-350 leading-relaxed">
                We expand the selected hook into a spoken speech sequence matching a plain-language <strong className="text-slate-100">6th Grade reading level</strong>.
              </p>
              <div className="border border-slate-800 p-4 rounded-xl bg-slate-950/60 space-y-3">
                <h5 className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Play className="w-3.5 h-3.5" /> Speech & Teleprompter Controls
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Keep your focus straight at camera level! Toggle the <em className="text-indigo-400">Start Speech</em> button to auto-scroll, adjust reading velocity to match your voice pace, and increase text font sizes as needed.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-350 leading-relaxed">
                Clicking the <strong className="text-slate-100">Sketch Scene (AI)</strong> button transforms descriptive text fields into visual storyboard thumbnails.
              </p>
              <div className="border border-slate-800 p-4 rounded-xl bg-slate-950/60 space-y-3 font-mono text-xs">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black text-indigo-400/80">Visual Storyboard Framing Model</div>
                <div className="p-2.5 bg-slate-900 border border-slate-850 rounded text-slate-300 space-y-1.5 leading-relaxed text-[11px]">
                  <div>🎬 <span className="text-slate-100">Scene 1 Visual Prompt:</span> "founder frustrated at laptop, close-up, dark background"</div>
                  <div>🎬 <span className="text-slate-100">Scene 2 Visual Prompt:</span> "app dashboard appearing, over-the-shoulder camera"</div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-350 leading-relaxed">
                The Marketing Kit generates attention-seeking, copy-ready copy variations perfectly adapted to social networks.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-bold uppercase">
                <div className="p-2 border border-slate-800 bg-slate-900 rounded text-slate-300">LinkedIn Post</div>
                <div className="p-2 border border-indigo-500/30 bg-indigo-500/10 rounded text-indigo-400">Twitter / X Tab</div>
                <div className="p-2 border border-slate-800 bg-slate-900 rounded text-slate-300">Cold Email</div>
              </div>
              <p className="text-xs text-slate-400 text-center leading-relaxed italic">
                Simply click to copy and syndicate to your preferred distribution channels!
              </p>
            </div>
          )}
        </div>

        {/* Tutorial wizard bottom navigation bar */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition cursor-pointer py-2 px-3"
            id="tutorial_skip_bottom"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1 transition cursor-pointer"
                id="tutorial_prev_btn"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-lg flex items-center gap-1 transition cursor-pointer shadow-md"
              id="tutorial_next_btn"
            >
              {currentStep === totalSteps - 1 ? "Finish and Play" : "Next Segment"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
