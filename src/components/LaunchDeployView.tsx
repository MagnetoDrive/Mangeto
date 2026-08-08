import { useState, useEffect } from "react";
import { 
  Github, 
  Globe, 
  ExternalLink, 
  Code, 
  Settings, 
  Copy, 
  Check, 
  Sparkles, 
  Cloud, 
  ArrowUpRight, 
  Eye, 
  Info, 
  RefreshCw 
} from "lucide-react";
import { Project } from "../types";

interface LaunchDeployViewProps {
  project: Project;
  onUpdateProject?: (updated: Project) => void;
}

type ThemeType = "saas-dark" | "minimal-light" | "editorial-warm" | "bold-gradient";

interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  colors: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "saas-dark",
    name: "SaaS Dark Mode",
    description: "Futuristic workspace layout with glowing indigo, violet cards, and neon details.",
    colors: "bg-slate-950 border-slate-800 text-slate-200"
  },
  {
    id: "minimal-light",
    name: "Swiss Minimalist",
    description: "Stark off-white clean borders, precise Swiss sans-serif typography, and generous empty space.",
    colors: "bg-stone-50 border-stone-200 text-stone-800"
  },
  {
    id: "editorial-warm",
    name: "Warm Editorial",
    description: "Premium cream-tinted cards, high-contrast serif headers, and sophisticated emerald accents.",
    colors: "bg-amber-50/30 border-orange-100 text-stone-800"
  },
  {
    id: "bold-gradient",
    name: "Startup Bold",
    description: "Mesh background, high-intensity color buttons, and dynamic product showcase cards.",
    colors: "bg-zinc-950 border-zinc-800 text-zinc-100"
  }
];

export default function LaunchDeployView({ project, onUpdateProject }: LaunchDeployViewProps) {
  // Credentials State
  const [githubToken, setGithubToken] = useState("");
  const [vercelToken, setVercelToken] = useState("");
  const [showTokens, setShowTokens] = useState(false);
  
  // Customization State
  const [theme, setTheme] = useState<ThemeType>("saas-dark");
  const [repoName, setRepoName] = useState("");
  const [projectName, setProjectName] = useState("");
  
  // Custom Landing Page copywriting override overrides
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [cta, setCta] = useState("");

  // Generated state
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [htmlTab, setHtmlTab] = useState<"preview" | "code">("preview");
  const [isCopied, setIsCopied] = useState(false);

  // Deployment logs
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [githubResult, setGithubResult] = useState<{ repoUrl: string; owner: string } | null>(null);
  const [vercelResult, setVercelResult] = useState<{ url: string } | null>(null);
  const [deployError, setDeployError] = useState("");

  // Initialize overrides and titles from active campaign
  useEffect(() => {
    if (project) {
      setRepoName(`magneto-${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/g, "")}`);
      setProjectName(project.name);
      
      const lp = project.marketing?.landingPageHero;
      setHeading(lp?.heading || "The ultimate solution for your workflow.");
      setSubheading(lp?.subheading || "Save hours of effort, scale your conversions, and delight your customers instantly.");
      setCta(lp?.cta || "Get Started Free");
    }
  }, [project]);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const savedGh = localStorage.getItem("magneto_gh_token");
    const savedVercel = localStorage.getItem("magneto_vercel_token");
    if (savedGh) setGithubToken(savedGh);
    if (savedVercel) setVercelToken(savedVercel);
  }, []);

  const saveCredentials = () => {
    localStorage.setItem("magneto_gh_token", githubToken);
    localStorage.setItem("magneto_vercel_token", vercelToken);
    alert("Tokens saved securely in your browser's LocalStorage!");
  };

  const clearCredentials = () => {
    localStorage.removeItem("magneto_gh_token");
    localStorage.removeItem("magneto_vercel_token");
    setGithubToken("");
    setVercelToken("");
    alert("Credentials cleared!");
  };

  // Generate dynamic Landing Page HTML Code using backend Gemini API
  const handleGenerateLandingPage = async () => {
    setIsGenerating(true);
    setHtmlTab("preview");
    try {
      const response = await fetch("/api/generate-landing-page-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: project.concept,
          audience: project.audience,
          outcome: project.outcome,
          theme,
          heading,
          subheading,
          cta
        })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      setGeneratedHtml(data.html || "");
    } catch (err: any) {
      console.error(err);
      alert("Failed to build landing page code: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedHtml);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Perform full real-world push to GitHub and deploy to Vercel
  const handleLaunchDeploy = async () => {
    if (!githubToken && !vercelToken) {
      alert("Please provide at least a GitHub Personal Access Token or a Vercel Token to deploy!");
      return;
    }
    
    let htmlToDeploy = generatedHtml;
    if (!htmlToDeploy) {
      alert("Please generate your landing page HTML code first!");
      return;
    }

    setIsDeploying(true);
    setDeployStep(1);
    setDeployLogs([]);
    setGithubResult(null);
    setVercelResult(null);
    setDeployError("");

    try {
      // Step 1: Initialize launch pipeline
      addLog("🚀 Initializing Magneto Launch Engine...");
      await delay(1000);

      // Deploy to GitHub if token provided
      let currentOwner = "";
      let currentRepo = "";
      if (githubToken) {
        setDeployStep(2);
        addLog("🔑 Authenticating with GitHub API...");
        
        const ghRes = await fetch("/api/deploy-github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: githubToken,
            repoName,
            html: htmlToDeploy,
            projectName
          })
        });

        if (!ghRes.ok) {
          const errMsg = await ghRes.json();
          throw new Error(`GitHub Deployment failed: ${errMsg.error || ghRes.statusText}`);
        }

        const ghData = await ghRes.json();
        setGithubResult({ repoUrl: ghData.repoUrl, owner: ghData.owner });
        addLog(`✅ GitHub Repository created & updated successfully: github.com/${ghData.owner}/${repoName}`);
        currentOwner = ghData.owner;
        currentRepo = repoName;
      } else {
        addLog("ℹ️ Skipping GitHub (no Personal Access Token supplied).");
      }

      await delay(1000);

      // Deploy to Vercel if token provided
      if (vercelToken) {
        setDeployStep(3);
        addLog("🌩️ Dispatching static assets to Vercel Serverless Gateway...");
        
        const vercelRes = await fetch("/api/deploy-vercel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: vercelToken,
            projectName,
            html: htmlToDeploy
          })
        });

        if (!vercelRes.ok) {
          const errMsg = await vercelRes.json();
          throw new Error(`Vercel Deployment failed: ${errMsg.error || vercelRes.statusText}`);
        }

        const vercelData = await vercelRes.json();
        setVercelResult({ url: vercelData.url });
        addLog(`✅ Vercel project live! Assigned URL: ${vercelData.url}`);
      } else {
        addLog("ℹ️ Skipping Vercel deployment (no Vercel Personal Access Token supplied).");
      }

      setDeployStep(4);
      addLog("✨ Deployment pipeline finished successfully!");

    } catch (err: any) {
      console.error(err);
      setDeployError(err.message || "An unexpected deployment error occurred.");
      addLog(`❌ Deployment error: ${err.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const addLog = (message: string) => {
    setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="space-y-6">
      
      {/* Upper informational banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" /> GitHub & Vercel Integrations
          </h3>
          <p className="text-xs text-slate-400">
            Convert your campaign's narrative and value proposition into a live, high-converting static webpage hosted on Vercel and versioned in GitHub.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
            Node.js API Active
          </span>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
            Fully Automated
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Setup & Customization Parameters */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Credentials Setup */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" /> API Connections
              </h4>
              <button 
                onClick={() => setShowTokens(!showTokens)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline cursor-pointer"
              >
                {showTokens ? "Hide tokens" : "Show tokens"}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* GitHub Token */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-400" /> GitHub Classic PAT
                  </label>
                  <a 
                    href="https://github.com/settings/tokens/new?scopes=repo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-500 hover:text-indigo-400 underline flex items-center gap-0.5"
                  >
                    Get Token <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input 
                  type={showTokens ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 px-3 py-2 rounded text-slate-300 font-mono text-[11px] focus:outline-none transition"
                />
              </div>

              {/* Vercel Token */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-slate-400" /> Vercel User Token
                  </label>
                  <a 
                    href="https://vercel.com/account/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-500 hover:text-indigo-400 underline flex items-center gap-0.5"
                  >
                    Get Token <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input 
                  type={showTokens ? "text" : "password"}
                  placeholder="ver_xxxxxxxxxxxx"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 px-3 py-2 rounded text-slate-300 font-mono text-[11px] focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={saveCredentials}
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-medium rounded border border-indigo-700 shadow-sm text-center transition cursor-pointer"
                >
                  Save Tokens
                </button>
                <button
                  onClick={clearCredentials}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition cursor-pointer"
                  title="Clear saved tokens"
                >
                  Reset
                </button>
              </div>

              <div className="bg-slate-950/60 p-2.5 border border-slate-800/40 rounded text-[10px] text-slate-500 leading-relaxed flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Your personal tokens are stored fully locally inside your current browser session. We only proxy them server-side to make real-time secure API deployments.
                </span>
              </div>

            </div>
          </div>

          {/* Card 2: Customize Deployment Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Branding overrides
            </h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Heading Text</label>
                <input 
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="Main campaign title heading"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 px-3 py-2 rounded text-slate-300 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Subheading Text</label>
                <textarea 
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  placeholder="Supporting pitch narrative description"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 px-3 py-2 rounded text-slate-300 focus:outline-none transition resize-none text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">CTA Button Text</label>
                <input 
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Action-oriented button label"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 px-3 py-2 rounded text-slate-300 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px]">GitHub Repository</label>
                  <input 
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-2 py-1.5 rounded text-slate-400 font-mono text-[10px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono text-[10px]">Vercel Subdomain</label>
                  <input 
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-2 py-1.5 rounded text-slate-400 font-mono text-[10px] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Template layout selection & Live Preview Code builder */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Select Landing Page Style Template */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase border-b border-slate-800 pb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" /> Choose Website Design Theme
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((themeOpt) => {
                const isActive = theme === themeOpt.id;
                return (
                  <button
                    key={themeOpt.id}
                    onClick={() => setTheme(themeOpt.id)}
                    className={`text-left p-3.5 rounded-lg border transition cursor-pointer flex flex-col gap-1.5 ${
                      isActive 
                        ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/30" 
                        : "border-slate-800 bg-slate-950 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-200">{themeOpt.name}</span>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{themeOpt.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-slate-400 italic">
                Selected design layout style: <span className="font-semibold text-slate-200 font-mono">{theme}</span>
              </p>
              <button
                onClick={handleGenerateLandingPage}
                disabled={isGenerating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-500/40 text-slate-100 font-semibold rounded shadow-lg text-xs cursor-pointer flex items-center gap-1.5 transition"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Generating Landing Page...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Generate Landing Page HTML Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card: Live Code & Live Deployment Action */}
          {generatedHtml && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setHtmlTab("preview")}
                    className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer ${htmlTab === "preview" ? "bg-indigo-600 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    Webpage Sandbox
                  </button>
                  <button 
                    onClick={() => setHtmlTab("code")}
                    className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer ${htmlTab === "code" ? "bg-indigo-600 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    HTML Code
                  </button>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 rounded border border-slate-700 transition cursor-pointer"
                  title="Copy Landing Page HTML"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {htmlTab === "preview" ? (
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-white h-[380px] relative">
                  {/* Mock browser framing */}
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 text-stone-500 text-[10px] font-mono select-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-4 bg-white border border-stone-200 rounded px-2 py-0.5 w-64 inline-block overflow-hidden whitespace-nowrap">
                      magneto-draft.vercel.app
                    </span>
                  </div>
                  <iframe 
                    title="Live Webpage Mock"
                    srcDoc={generatedHtml}
                    className="w-full h-[calc(100%-30px)] bg-slate-50"
                  />
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 overflow-y-auto h-[380px] leading-relaxed">
                  <pre>{generatedHtml}</pre>
                </div>
              )}

              {/* Live Ship Actions */}
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Ready to publish?</span>
                    <h5 className="text-sm font-semibold text-slate-100">Deploy live to GitHub and Vercel simultaneously</h5>
                  </div>
                  <button
                    onClick={handleLaunchDeploy}
                    disabled={isDeploying}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-slate-50 font-bold rounded-lg shadow-lg text-xs cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    {isDeploying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Deploying Live...
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" />
                        Deploy to GitHub & Vercel
                      </>
                    )}
                  </button>
                </div>

                {/* Live Step Progress / Logs */}
                {deployLogs.length > 0 && (
                  <div className="space-y-2 border-t border-slate-800/80 pt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Pipeline Output Logs</span>
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-900 font-mono text-[10px] text-indigo-300 max-h-36 overflow-y-auto space-y-1">
                      {deployLogs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed">{log}</div>
                      ))}
                    </div>

                    {/* Step Visualizer */}
                    <div className="flex items-center justify-between gap-4 text-center font-mono text-[9px] pt-2">
                      <div className={`flex-1 pb-1 border-b-2 ${deployStep >= 1 ? "border-indigo-500 text-indigo-400 font-semibold" : "border-slate-800 text-slate-500"}`}>
                        1. INITIATED
                      </div>
                      <div className={`flex-1 pb-1 border-b-2 ${deployStep >= 2 ? "border-indigo-500 text-indigo-400 font-semibold" : "border-slate-800 text-slate-500"}`}>
                        2. GITHUB REPO
                      </div>
                      <div className={`flex-1 pb-1 border-b-2 ${deployStep >= 3 ? "border-indigo-500 text-indigo-400 font-semibold" : "border-slate-800 text-slate-500"}`}>
                        3. VERCEL HOST
                      </div>
                      <div className={`flex-1 pb-1 border-b-2 ${deployStep >= 4 ? "border-emerald-500 text-emerald-400 font-semibold" : "border-slate-800 text-slate-500"}`}>
                        4. COMPLETED
                      </div>
                    </div>
                  </div>
                )}

                {/* Successful Results Cards */}
                {(githubResult || vercelResult) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
                    {githubResult && (
                      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg flex items-start gap-3">
                        <Github className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-100 truncate">GitHub Repository</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{githubResult.owner}/{repoName}</p>
                          <a 
                            href={githubResult.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline font-mono"
                          >
                            View Repository <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {vercelResult && (
                      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg flex items-start gap-3">
                        <Globe className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-100 truncate">Vercel Deployment</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{vercelResult.url}</p>
                          <a 
                            href={vercelResult.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline font-mono font-semibold"
                          >
                            Open Live Website <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
