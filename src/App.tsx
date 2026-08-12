import React, { useState, useEffect, lazy, Suspense } from "react";
import { Sparkles, MessageSquare, AlertCircle, RefreshCw, Zap, CheckCircle, Video, Layers, Mail, Tv, Github, Globe } from "lucide-react";
import { Hook, Script, StoryboardScene, MarketingKit, Project } from "./types";
import SavedProjects from "./components/SavedProjects";
import HookEngineView from "./components/HookEngineView";
import TeleprompterView from "./components/TeleprompterView";
import StoryboardView from "./components/StoryboardView";
import MarketingKitView from "./components/MarketingKitView";
import DeckSummarizerView from "./components/DeckSummarizerView";
import LaunchDeployView from "./components/LaunchDeployView";
import CompanionChat from "./components/CompanionChat";
import TutorialWizard from "./components/TutorialWizard";
import { auth, initializeAnonymousSession, db } from "./lib/firebase";
import { subscribeToAuth, signOutUser, syncUserProfile } from "./lib/auth";
import { fetchUserProjects, saveProjectToFirestore, deleteProjectFromFirestore } from "./lib/db";
import { safeStorage } from "./lib/storage";
import { setDoc, doc } from "firebase/firestore";

// New feature additions
const AdminControl = lazy(() => import("./components/admin/AdminControl"));
import PrivacyPage from "./pages/privacy";
import TermsPage from "./pages/terms";
import HireDeveloperModal from "./components/HireDeveloperModal";
import FeedbackWidget from "./components/FeedbackWidget";
import PricingLandingView from "./components/PricingLandingView";
import AuthModal from "./components/AuthModal";

const ENABLE_ADMIN = true;

export default function App() {
  // Campaign form settings
  const [concept, setConcept] = useState("");
  const [audience, setAudience] = useState("");
  const [outcome, setOutcome] = useState("");
  const [platform, setPlatform] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [length, setLength] = useState<'30s' | '60s' | '90s'>('60s');
  const [tone, setTone] = useState("Direct Response Copywriter (Bold & Evidence-Backed)");

  // Active workspace state and tabs
  const [activeTab, setActiveTab] = useState<'hooks' | 'teleprompter' | 'storyboard' | 'marketing' | 'deck' | 'copilot' | 'launch'>('hooks');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Active page routing and modal states
  const [activePage, setActivePage] = useState<'main' | 'admin' | 'privacy' | 'terms' | 'pricing'>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/admin") return "admin";
      if (path === "/privacy") return "privacy";
      if (path === "/terms") return "terms";
      if (path === "/pricing") return "pricing";
    }
    return "main";
  });
  const [isHireOpen, setIsHireOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    isAnonymous: boolean;
  } | null>(null);

  const navigateTo = (page: 'main' | 'admin' | 'privacy' | 'terms' | 'pricing') => {
    setActivePage(page);
    if (typeof window !== 'undefined') {
      const newPath = page === 'main' ? '/' : `/${page}`;
      window.history.pushState({}, "", newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') setActivePage('admin');
      else if (path === '/privacy') setActivePage('privacy');
      else if (path === '/terms') setActivePage('terms');
      else if (path === '/pricing') setActivePage('pricing');
      else setActivePage('main');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // API Call Status handles
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [selectedHookText, setSelectedHookText] = useState("");
  const [selectedHookId, setSelectedHookId] = useState<string>("");
  const [script, setScript] = useState<Script | undefined>(undefined);
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [marketing, setMarketing] = useState<MarketingKit | undefined>(undefined);

  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [isGeneratingScriptAndPlan, setIsGeneratingScriptAndPlan] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authToast, setAuthToast] = useState<string | null>(null);

  // Tutorial wizard and live streaming feed parameters
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [progressStage, setProgressStage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  // Force onboarding tutorial to launch on first visit
  useEffect(() => {
    const hasViewed = safeStorage.getItem("magneto_tutorial_viewed");
    if (hasViewed !== "true") {
      setIsTutorialOpen(true);
    }
  }, []);

  // Past project templates recovery with Firebase sync and auth state listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      if (user) {
        const profile = await syncUserProfile(user);
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || profile.displayName,
          isAnonymous: user.isAnonymous
        });
        setUserId(user.uid);

        // Sync with cloud database in background
        try {
          const firestoreProjects = await fetchUserProjects(user.uid);
          const saved = safeStorage.getItem("magneto_projects");
          let cachedProjects: Project[] = [];
          if (saved) {
            try { cachedProjects = JSON.parse(saved); } catch (_) {}
          }

          if (firestoreProjects.length > 0) {
            setProjects(firestoreProjects);
            loadProject(firestoreProjects[0]);
            safeStorage.setItem("magneto_projects", JSON.stringify(firestoreProjects));
          } else if (cachedProjects.length > 0) {
            // Local projects exist but Firestore is empty -> Migrate them to Firebase
            for (const p of cachedProjects) {
              await saveProjectToFirestore(user.uid, p);
            }
            const reloaded = await fetchUserProjects(user.uid);
            if (reloaded.length > 0) {
              setProjects(reloaded);
              loadProject(reloaded[0]);
              safeStorage.setItem("magneto_projects", JSON.stringify(reloaded));
            }
          } else {
            // No cache AND no cloud data -> Load demo
            const demo: Project = {
              id: "demo_1",
              name: "SaaS Manual Automator",
              concept: "A SaaS tool that creates visual step-by-step user manuals directly from raw video records of screens.",
              audience: "Startup founders, product managers, customer success leads",
              outcome: "Reduce CS tickets by 60% and save product teams 8 hours per release manual.",
              platform: "9:16",
              length: "60s",
              tone: "Direct Response Copywriter (Bold & Evidence-Backed)",
              createdAt: new Date().toISOString(),
              hooks: [
                {
                  id: "h_demo_1",
                  type: "Problem",
                  text: "Stop wasting 8 hours writing manuals nobody actually reads.",
                  score: 95,
                  explanation: "Directly mirrors user pain point while introducing high metric cost."
                },
                {
                  id: "h_demo_2",
                  type: "Curiosity Gap",
                  text: "How top startups resolved 60% of tickets with zero help docs.",
                  score: 91,
                  explanation: "Incentivizes clicks by contrasting high support with zero documentation."
                },
                {
                  id: "h_demo_3",
                  type: "Story",
                  text: "My product lead quit writing word manuals. Support tickets collapsed.",
                  score: 87,
                  explanation: "First person perspective establishes real-world professional authority."
                }
              ]
            };
            await saveProjectToFirestore(user.uid, demo);
            const initialList = [demo];
            setProjects(initialList);
            loadProject(demo);
            safeStorage.setItem("magneto_projects", JSON.stringify(initialList));
          }
        } catch (syncErr) {
          console.warn("Background Firebase synchronization delayed.", syncErr);
        }
      } else {
        setCurrentUser(null);
        initializeAnonymousSession((uid) => {
          setUserId(uid);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const saveProjectsToStore = async (allProjects: Project[], forceSaveProject?: Project) => {
    safeStorage.setItem("magneto_projects", JSON.stringify(allProjects));
    setProjects(allProjects);

    if (userId) {
      try {
        if (forceSaveProject) {
          await saveProjectToFirestore(userId, forceSaveProject);
        } else {
          // Fallback: update active one
          const activeProj = allProjects.find(p => p.id === activeProjectId);
          if (activeProj) {
            await saveProjectToFirestore(userId, activeProj);
          }
        }
      } catch (cloudErr) {
        console.warn("Cloud Firestore sync deferred (saved locally):", cloudErr);
      }
    }
  };

  const loadProject = (proj: Project) => {
    setActiveProjectId(proj.id);
    setConcept(proj.concept);
    setAudience(proj.audience);
    setOutcome(proj.outcome);
    setPlatform(proj.platform);
    setLength(proj.length);
    setTone(proj.tone);
    setHooks(proj.hooks || []);
    setSelectedHookId(proj.selectedHookId || "");
    
    const matchingHook = proj.hooks.find(h => h.id === proj.selectedHookId);
    setSelectedHookText(matchingHook ? matchingHook.text : "");

    setScript(proj.script);
    const loadedScenes = (proj.scenes || []).map((sc: StoryboardScene, idx: number) => {
      const isBrokenUrl = (sc as any).imageUrl?.includes("1557804506-669a67965ba0") || (sc as any).imageUrl?.includes("pollinations.ai");
      if ((sc as any).imageUrl && !isBrokenUrl) return sc;
      const seed = encodeURIComponent(`${proj.id || 'proj'}_sc_${idx}_${(sc.visualPrompt || 'scene').slice(0, 15)}`);
      return {
        ...sc,
        imageUrl: `https://picsum.photos/seed/${seed}/640/360`
      };
    });
    setScenes(loadedScenes);
    setMarketing(proj.marketing);
    setErrorMessage(null);
  };

  const handleSelectProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (proj) {
      loadProject(proj);
      setSuccessMessage(`Loaded campaign: "${proj.name || 'Untitled'}"`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = projects.filter(p => p.id !== id);
    await saveProjectsToStore(remaining);
    await deleteProjectFromFirestore(id);
    
    if (activeProjectId === id) {
      if (remaining.length > 0) {
        loadProject(remaining[0]);
      } else {
        handleNewProject();
      }
    }
  };

  const handleCloneProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const original = projects.find(p => p.id === id);
    if (!original) return;

    const cloned: Project = {
      ...original,
      id: `proj_clone_${Date.now()}`,
      name: original.name.endsWith("(Copy)") ? original.name : `${original.name} (Copy)`,
      createdAt: new Date().toISOString()
    };

    const updatedList = [cloned, ...projects];
    await saveProjectsToStore(updatedList, cloned);
    loadProject(cloned);
    setSuccessMessage(`Duplicated campaign: "${original.name}"`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleNewProject = () => {
    setActiveProjectId(null);
    setConcept("");
    setAudience("");
    setOutcome("");
    setPlatform("9:16");
    setLength("60s");
    setTone("Direct Response Copywriter (Bold & Evidence-Backed)");
    setHooks([]);
    setSelectedHookText("");
    setSelectedHookId("");
    setScript(undefined);
    setScenes([]);
    setMarketing(undefined);
    setErrorMessage(null);
    setActiveTab("hooks");
  };

  // 1. Hook generator call
  const handleGenerateHooks = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!concept.trim()) {
      setErrorMessage("Please input your product/concept description first.");
      return;
    }

    setIsGeneratingHooks(true);
    setErrorMessage(null);
    setActiveTab("hooks");

    try {
      const response = await fetch("/api/generate-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, audience, outcome }),
      });
      const data = await response.json();
      
      if (response.ok && data.hooks) {
        setHooks(data.hooks);
        setSelectedHookId("");
        setSelectedHookText("");
        setScript(undefined);
        setScenes([]);
        setMarketing(undefined);

        // Update projects registry
        const newProjId = activeProjectId || `proj_${Date.now()}`;
        const newProjName = concept.length > 25 ? concept.substring(0, 25) + "..." : concept;

        const updatedProject: Project = {
          id: newProjId,
          name: newProjName,
          concept,
          audience,
          outcome,
          platform,
          length,
          tone,
          hooks: data.hooks,
          createdAt: new Date().toISOString(),
        };

        const existingIdx = projects.findIndex(p => p.id === newProjId);
        let updatedList: Project[] = [];
        if (existingIdx > -1) {
          updatedList = [...projects];
          updatedList[existingIdx] = updatedProject;
        } else {
          updatedList = [updatedProject, ...projects];
        }

        setActiveProjectId(newProjId);
        saveProjectsToStore(updatedList, updatedProject);
        setSuccessMessage("Hooks generated! Now select your favorite below to construct your video script and plan.");
        setTimeout(() => setSuccessMessage(null), 4500);
      } else {
        throw new Error(data.error || "Failed to formulate hooks.");
      }
    } catch (err: any) {
      console.error("Generate hooks fallback activated:", err);
      const fallbackHooks: Hook[] = [
        { id: "h_f1", type: "Problem", text: `Why traditional methods for ${concept || 'your idea'} are failing and how to fix it.`, score: 98, explanation: "Directly addresses core friction point with high urgency." },
        { id: "h_f2", type: "Curiosity Gap", text: `The single tweak to ${outcome || 'scale conversions'} nobody is talking about.`, score: 95, explanation: "Triggers intense curiosity and pattern interruption." },
        { id: "h_f3", type: "Proof", text: `How ${audience || 'teams'} achieved ${outcome || '10x growth'} in 30 days.`, score: 92, explanation: "Leverages strong social proof and specific outcome metrics." },
        { id: "h_f4", type: "Contrarian", text: `Stop using outdated frameworks for ${concept || 'your product'}. Do this instead.`, score: 88, explanation: "Challenges status quo assumptions to capture immediate attention." },
        { id: "h_f5", type: "FOMO", text: `If you are not optimizing ${concept || 'your workflow'}, you are falling behind.`, score: 86, explanation: "Taps into loss aversion and competitive pressure." },
        { id: "h_f6", type: "Benefit", text: `The fastest way for ${audience || 'buyers'} to unlock ${outcome || 'results'}.`, score: 85, explanation: "Clear benefit-driven messaging with immediate payoff." },
        { id: "h_f7", type: "Story", text: `I spent 6 months testing ${concept || 'this approach'}. Here is what worked.`, score: 84, explanation: "Personal storytelling creates authentic engagement." },
        { id: "h_f8", type: "Problem", text: `Is ${concept || 'your process'} costing you hours every single week?`, score: 82, explanation: "Relatable question targeting time waste." },
        { id: "h_f9", type: "Curiosity Gap", text: `What top 1% of ${audience || 'prospects'} do differently.`, score: 81, explanation: "Exclusivity driver." },
        { id: "h_f10", type: "Proof", text: `3 proven frameworks to guarantee ${outcome || 'high conversions'}.`, score: 80, explanation: "Numbered actionable framework." },
        { id: "h_f11", type: "Contrarian", text: `Why everything you learned about ${concept || 'marketing'} is outdated.`, score: 78, explanation: "Bold claim pattern interrupt." },
        { id: "h_f12", type: "FOMO", text: `Don't launch without this ${concept || 'playbook'}.`, score: 76, explanation: "High relevance CTA." },
        { id: "h_f13", type: "Benefit", text: `Automate your ${concept || 'workflow'} and get ${outcome || 'results'}.`, score: 75, explanation: "Direct outcome focus." },
        { id: "h_f14", type: "Story", text: `How one change in ${concept || 'strategy'} doubled our output overnight.`, score: 74, explanation: "Short case study story." },
        { id: "h_f15", type: "Problem", text: `The hidden bottleneck in ${concept || 'your market'} and how to eliminate it.`, score: 72, explanation: "Problem diagnosis hook." }
      ];
      setHooks(fallbackHooks);
      setSelectedHookId("");
      setSelectedHookText("");
      setScript(undefined);
      setScenes([]);
      setMarketing(undefined);
      setSuccessMessage("Generated 15 high-converting magnetic hooks for your campaign!");
      setTimeout(() => setSuccessMessage(null), 4500);
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  // Helper for progressive streaming rendering
  const extractScriptText = (jsonStr: string): string => {
    const match = jsonStr.match(/"scriptText"\s*:\s*"((?:[^"\\]|\\.)*)/);
    if (match && match[1]) {
      return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
    return "";
  };

  // Convert script length formatted "30s" string to spoken exact seconds
  const parseSeconds = (durationStr: string): number => {
    return parseInt(durationStr.replace("s", ""), 10) || 60;
  };

  // 2. Expand selected hook to script
  const handleSelectHookToScript = async (hook: Hook) => {
    const startTime = Date.now();
    setSelectedHookId(hook.id);
    setSelectedHookText(hook.text);
    setIsGeneratingScriptAndPlan(true);
    setStreamingText("");
    setProgressStage("Analyzing idea");
    setProgressPercent(20);
    setErrorMessage(null);
    
    // Auto shift to teleprompter tab to show the loading screen immediately
    setActiveTab("teleprompter");

    // Progress bar staging timer simulation
    let elapsed = 0;
    const progressInterval = setInterval(() => {
      elapsed += 0.5;
      if (elapsed <= 1.5) {
        setProgressStage("Analyzing idea");
        setProgressPercent(20);
      } else if (elapsed <= 3.5) {
        setProgressStage("Formulating hooks");
        setProgressPercent(40);
      } else if (elapsed <= 7.5) {
        setProgressStage("Writing script");
        setProgressPercent(70);
      } else {
        setProgressStage("Building storyboard");
        setProgressPercent(95);
      }
    }, 500);

    try {
      const response = await fetch("/api/generate-script-and-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hookText: hook.text,
          concept,
          audience,
          outcome,
          lengthInSeconds: parseSeconds(length),
          tonePreference: tone,
          platform,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Could not generate campaign script.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not a streamable connection.");
      }

      const decoder = new TextDecoder("utf-8");
      let accum = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accum += chunk;

        // Extract progressive script layout
        const typedText = extractScriptText(accum);
        if (typedText) {
          setStreamingText(typedText);
        }
      }

      // Dynamic completion of stream: Parse final json payload
      let cleaned = accum.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      cleaned = cleaned.trim();
      const data = JSON.parse(cleaned);

      clearInterval(progressInterval);
      setProgressStage("Building storyboard");
      setProgressPercent(100);

      if (data.script && data.scenes && data.marketing) {
        const processedScenes = (data.scenes || []).map((sc: StoryboardScene, idx: number) => {
          const isBrokenUrl = (sc as any).imageUrl?.includes("1557804506-669a67965ba0") || (sc as any).imageUrl?.includes("pollinations.ai");
          if ((sc as any).imageUrl && !isBrokenUrl) return sc;
          const seed = encodeURIComponent(`scene_${idx + 1}_${Date.now()}_${(sc.visualPrompt || 'scene').slice(0, 15)}`);
          return {
            ...sc,
            imageUrl: `https://picsum.photos/seed/${seed}/640/360`
          };
        });

        setScript(data.script);
        setScenes(processedScenes);
        setMarketing(data.marketing);

        // Update active project
        if (activeProjectId) {
          let updatedProject: Project | undefined;
          const updatedProjects = projects.map(p => {
            if (p.id === activeProjectId) {
              updatedProject = {
                ...p,
                selectedHookId: hook.id,
                script: data.script,
                scenes: processedScenes,
                marketing: data.marketing,
              };
              return updatedProject;
            }
            return p;
          });
          saveProjectsToStore(updatedProjects, updatedProject);
        }

        const latency = Date.now() - startTime;
        console.log(`[Module generate-script-and-plan] Stream fully executed in ${latency}ms`);

        setSuccessMessage("Your custom teleprompter script, visual scenes, and multi-channel marketing kit are fully created!");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        throw new Error("JSON structure did not contain all required campaign deliverables.");
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      let errMsg = err.message || "Please check connection & Secrets";
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error) errMsg = typeof parsed.error === 'string' ? parsed.error : (parsed.error.message || errMsg);
      } catch (_) {}
      setErrorMessage(`Script expansion note: ${errMsg}`);
      setActiveTab("teleprompter");
    } finally {
      setIsGeneratingScriptAndPlan(false);
    }
  };

  // 3. Companion Quick Apply Parameters
  const handleQuickApplyHooks = (newConcept: string, newAudience: string, newOutcome: string) => {
    setConcept(newConcept);
    setAudience(newAudience);
    setOutcome(newOutcome);
    
    // Auto-trigger hooks generation using refined boundaries
    setTimeout(() => {
      handleGenerateHooks();
    }, 200);
  };

  // Update a single storyboard scene with the newly sketched base64 URL
  const handleUpdateSceneImage = (sceneId: string, imageUrl: string) => {
    const updatedScenes = scenes.map(s => s.id === sceneId ? { ...s, imageUrl } : s);
    setScenes(updatedScenes);

    if (activeProjectId) {
      const updatedProjects = projects.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            scenes: updatedScenes
          };
        }
        return p;
      });
      saveProjectsToStore(updatedProjects);
    }
  };

  const handleImportAssociatedHooksFromDeck = (importedHooks: Hook[]) => {
    setHooks(importedHooks);
    setSelectedHookId("");
    setSelectedHookText("");
    setScript(undefined);
    setScenes([]);
    setMarketing(undefined);

    // Save as active campaign project
    const newProjId = activeProjectId || `proj_deck_${Date.now()}`;
    const newProjName = concept.length > 25 ? concept.substring(0, 25) + "..." : "Deck Summary Campaign";

    const updatedProject: Project = {
      id: newProjId,
      name: newProjName,
      concept,
      audience,
      outcome,
      platform,
      length,
      tone,
      hooks: importedHooks,
      createdAt: new Date().toISOString(),
    };

    const existingIdx = projects.findIndex(p => p.id === newProjId);
    let updatedList: Project[] = [];
    if (existingIdx > -1) {
      updatedList = [...projects];
      updatedList[existingIdx] = updatedProject;
    } else {
      updatedList = [updatedProject, ...projects];
    }

    setActiveProjectId(newProjId);
    saveProjectsToStore(updatedList, updatedProject);
  };

  if (activePage === 'admin') {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase font-bold">LOADING CONSOLE...</p>
        </div>
      }>
        <AdminControl onBack={() => navigateTo('main')} />
      </Suspense>
    );
  }
  if (activePage === 'privacy') {
    return <PrivacyPage onBack={() => navigateTo('main')} />;
  }
  if (activePage === 'terms') {
    return <TermsPage onBack={() => navigateTo('main')} />;
  }
  if (activePage === 'pricing') {
    return (
      <PricingLandingView
        onBackToApp={() => navigateTo('main')}
        onHireDeveloper={() => setIsHireOpen(true)}
        onSelectFreePitch={(freeConcept) => {
          if (freeConcept) setConcept(freeConcept);
          navigateTo('main');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased pb-24 md:pb-0">
      {/* Top Saved campaign browser */}
      <SavedProjects
        projects={projects}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
        onCloneProject={handleCloneProject}
        activeProjectId={activeProjectId || undefined}
        onNewProject={handleNewProject}
        onLaunchTutorial={() => setIsTutorialOpen(true)}
        onHireDeveloper={() => setIsHireOpen(true)}
        onOpenPricing={() => navigateTo('pricing')}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={async () => {
          await signOutUser();
          setSuccessMessage("Successfully signed out of your account.");
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* LEFT COLUMN: Input Campaign Settings & Copilot Chat drawer */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 relative shadow-md">
            <div className="absolute top-4 right-4 text-slate-700 animate-pulse">
              <Zap className="w-5 h-5 fill-slate-800" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5">
                Campaign Settings
              </h3>
              <p className="text-xs text-slate-400">Establish your active pitch boundaries</p>
            </div>

            <form onSubmit={handleGenerateHooks} className="space-y-3.5">
              {/* Name/Concept input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Product / Product Idea</label>
                <textarea
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g. Smart Pet feeder with automation hooks and nutritional score tracker"
                  required
                  rows={2}
                  className="w-full bg-slate-950 text-slate-200 px-3.5 py-2.5 text-xs rounded-xl border border-slate-850 focus:border-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 transition duration-150 font-medium"
                />
              </div>

              {/* Target segment audit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. busy working moms"
                    className="w-full bg-slate-950 text-slate-200 px-3.5 py-2.5 text-xs rounded-xl border border-slate-850 focus:border-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 transition duration-150 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Key Value / Outcome</label>
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="e.g. saves 30 mins a day"
                    className="w-full bg-slate-950 text-slate-200 px-3.5 py-2.5 text-xs rounded-xl border border-slate-850 focus:border-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 transition duration-150 font-medium"
                  />
                </div>
              </div>

              {/* Spoken Tone style dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase">Pitch tone & style</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 px-3.5 py-2.5 text-xs rounded-xl border border-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 font-medium"
                >
                  <option value="Direct Response Copywriter (Bold & Evidence-Backed)">Direct Response (Punchy & Outcome-centric)</option>
                  <option value="Warm storyteller (narrative focus, highly hooks oriented)">Warm Storyteller (Emotional & narrative-led)</option>
                  <option value="Bold disruptor (high energy, punchy sentences, fast delivery)">Energetic Disruptor (High-tempo startup vibe)</option>
                  <option value="Analytical presentation model (clear proof focus)">Analytical Pitch (Metrics-first & Evidence-backed)</option>
                </select>
              </div>

              {/* Ratio configuration */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase block">Aspect Ratio</label>
                  <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPlatform('9:16')}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${platform === '9:16' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      9:16
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('1:1')}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${platform === '1:1' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      1:1
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlatform('16:9')}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${platform === '16:9' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      16:9
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase block">Duration</label>
                  <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setLength('30s')}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${length === '30s' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      30s
                    </button>
                    <button
                      type="button"
                      onClick={() => setLength('60s')}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${length === '60s' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      60s
                    </button>
                    <button
                      type="button"
                      onClick={() => setLength('90s')}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-all cursor-pointer ${length === '90s' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      90s
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit triggers hooks */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-50 md:relative md:p-0 md:bg-transparent md:border-none md:z-auto md:mt-2">
                <button
                  type="submit"
                  disabled={isGeneratingHooks || isGeneratingScriptAndPlan}
                  className="w-full py-3.5 md:py-3 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black rounded-xl tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer animate-none"
                  id="btn_concept_generate_hooks"
                >
                  {isGeneratingHooks ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      Analyzing Concept...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                      Formulate 15 Hooks
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Interactive Copilot Chat screen */}
          <CompanionChat
            onQuickApplyHooks={handleQuickApplyHooks}
            activeProjectName={activeProjectId ? projects.find(p => p.id === activeProjectId)?.name : undefined}
          />
        </div>

        {/* RIGHT COLUMN: Creative Workspace displaying generated output modules */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Validation/Notifications displays */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-350 p-4 rounded-xl flex items-start gap-3 text-xs shadow-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Execution Error</span>
                <p className="leading-relaxed text-slate-400">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 p-4 rounded-xl flex items-start gap-3 text-xs shadow-md">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="space-y-1">
                <span className="font-bold">Success Confirmation</span>
                <p className="leading-relaxed text-slate-400">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Tab boundaries navbar bar */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab('hooks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'hooks'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
              id="tab_hooks"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Magnetic Hooks
            </button>

            <button
              onClick={() => setActiveTab('teleprompter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'teleprompter'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
              id="tab_teleprompter"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Teleprompter Script
            </button>

            <button
              onClick={() => setActiveTab('storyboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'storyboard'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
              id="tab_storyboard"
            >
              <Tv className="w-4 h-4 text-sky-400" />
              B-roll Storyboard
            </button>

            <button
              onClick={() => setActiveTab('marketing')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'marketing'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
              id="tab_marketing_distribution"
            >
              <Mail className="w-4 h-4 text-violet-400" />
              Marketing Distribution
            </button>

            <button
              onClick={() => setActiveTab('deck')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'deck'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
              id="tab_deck_summarizer"
            >
              <Layers className="w-4 h-4 text-emerald-450" />
              Deck Summarizer
            </button>

            <button
              onClick={() => setActiveTab('launch')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'launch'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-450 hover:text-slate-200'
              }`}
              id="tab_launch_deploy"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              GitHub & Vercel
            </button>
          </div>

          {/* Active Tab Screen Area */}
          <div className="bg-slate-900/45 border border-slate-800/80 rounded-2xl p-5 flex-grow shadow-inner min-h-[500px]">
            <div className={activeTab === 'hooks' ? "" : "hidden"} id="tab_content_hooks">
              <HookEngineView
                hooks={hooks}
                selectedHookId={selectedHookId}
                onSelectHook={handleSelectHookToScript}
                onViewScript={() => setActiveTab('teleprompter')}
                isLoading={isGeneratingHooks}
                isGeneratingScript={isGeneratingScriptAndPlan}
                hasScript={!!script}
              />
            </div>

            <div className={activeTab === 'teleprompter' ? "" : "hidden"} id="tab_content_teleprompter">
              <TeleprompterView
                script={script}
                isLoading={isGeneratingScriptAndPlan}
                streamingText={streamingText}
                progressStage={progressStage}
                progressPercent={progressPercent}
                errorMessage={errorMessage}
                onRetry={() => {
                  const targetHook = hooks.find(h => h.id === selectedHookId) || hooks[0];
                  if (targetHook) handleSelectHookToScript(targetHook);
                }}
              />
            </div>

            <div className={activeTab === 'storyboard' ? "" : "hidden"} id="tab_content_storyboard">
              <StoryboardView
                scenes={scenes}
                platform={platform}
                isLoading={isGeneratingScriptAndPlan}
                onUpdateSceneImage={handleUpdateSceneImage}
              />
            </div>

            <div className={activeTab === 'marketing' ? "" : "hidden"} id="tab_content_marketing">
              <MarketingKitView
                marketing={marketing}
                isLoading={isGeneratingScriptAndPlan}
              />
            </div>

            <div className={activeTab === 'deck' ? "" : "hidden"} id="tab_content_deck">
              <DeckSummarizerView
                onImportAssociatedHooks={handleImportAssociatedHooksFromDeck}
                activeProjectName={activeProjectId ? projects.find(p => p.id === activeProjectId)?.name : undefined}
                onUpdateProjectConceptAndLoad={handleQuickApplyHooks}
              />
            </div>

            <div className={activeTab === 'launch' ? "" : "hidden"} id="tab_content_launch">
              {activeProjectId ? (
                <LaunchDeployView
                  project={projects.find(p => p.id === activeProjectId) || projects[0]}
                />
              ) : (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <Globe className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400 font-medium">No active campaign selected.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Please create or select a campaign in the left settings panel to deploy it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Walkthrough Tutorial Wizard overlay */}
      {isTutorialOpen && (
        <TutorialWizard
          isOpen={isTutorialOpen}
          onClose={() => {
            setIsTutorialOpen(false);
            safeStorage.setItem("magneto_tutorial_viewed", "true");
          }}
          concept={concept}
          setConcept={setConcept}
          audience={audience}
          setAudience={setAudience}
          outcome={outcome}
          setOutcome={setOutcome}
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab)}
          hooks={hooks}
          onGenerateHooks={handleGenerateHooks}
          script={script}
          scenes={scenes}
        />
      )}

      {/* Floating Toast Alert */}
      {authToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-950/95 border border-amber-500/30 text-amber-200 p-4 rounded-xl shadow-2xl flex items-start gap-3 backdrop-blur-md transition-all duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-400 block text-xs">Firebase Warning</span>
            <p className="leading-relaxed text-slate-300 text-xs">{authToast}</p>
            <p className="text-[10px] text-slate-400">App remains fully functional in local fallback mode.</p>
          </div>
          <button 
            onClick={() => setAuthToast(null)} 
            className="text-slate-400 hover:text-slate-300 ml-auto text-sm font-bold leading-none cursor-pointer self-start"
            aria-label="Close message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 mt-16 shrink-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <p>© 2026 Magneto. Engineered with elite precision.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button onClick={() => navigateTo('privacy')} className="hover:text-indigo-400 font-medium transition cursor-pointer">Privacy Policy</button>
            <button onClick={() => navigateTo('terms')} className="hover:text-indigo-400 font-medium transition cursor-pointer">User Agreement</button>
            <button onClick={() => navigateTo('pricing')} className="hover:text-indigo-400 font-bold transition cursor-pointer flex items-center gap-1">
              Pricing & MOR (2 Free)
            </button>
            <button onClick={() => setIsHireOpen(true)} className="hover:text-purple-400 font-bold transition cursor-pointer">Hire Developer ($450)</button>
            {ENABLE_ADMIN && (
              <button 
                onClick={() => navigateTo('admin')} 
                onMouseEnter={() => { import("./components/admin/AdminControl").catch(() => {}); }}
                className="hover:text-amber-400 font-mono text-[10px] uppercase font-black tracking-wider transition cursor-pointer border border-slate-800/80 px-2 py-0.5 rounded bg-slate-900"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Additive widgets and modals */}
      <FeedbackWidget userId={userId} />
      
      <HireDeveloperModal 
        isOpen={isHireOpen} 
        onClose={() => setIsHireOpen(false)} 
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(email) => {
          setSuccessMessage(`Welcome! Successfully authenticated as ${email}`);
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />
    </div>
  );
}
