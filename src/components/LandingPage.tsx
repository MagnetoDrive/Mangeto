import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Video,
  Layers,
  FileText,
  Share2,
  Play,
  Copy,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Menu,
  X,
  Target,
  Clock,
  Send,
  Eye,
  Sliders,
  Users,
  Briefcase,
  Laptop,
  Flame,
  ExternalLink,
  MessageSquare,
  Award
} from "lucide-react";
import ComplianceFooter from "./ComplianceFooter";

interface LandingPageProps {
  onStartFree: () => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
  onNavigateTo: (page: 'main' | 'admin' | 'privacy' | 'terms' | 'pricing' | 'refund' | 'billing') => void;
  currentUser?: {
    uid: string;
    email: string | null;
    displayName: string | null;
    isAnonymous?: boolean;
  } | null;
}

export default function LandingPage({
  onStartFree,
  onOpenPricing,
  onOpenAuth,
  onNavigateTo,
  currentUser
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [heroPreviewTab, setHeroPreviewTab] = useState<'hooks' | 'script' | 'storyboard' | 'marketing'>('hooks');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeMarketingChannel, setActiveMarketingChannel] = useState<'linkedin' | 'twitter' | 'coldEmail' | 'landingPage' | 'youtube'>('linkedin');

  const isAuthenticated = currentUser && !currentUser.isAnonymous;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqItems = [
    {
      q: "What is Mangeto?",
      a: "Mangeto is an AI-powered SaaS platform designed to transform raw pitch decks, sales presentations, and product concepts into high-converting short-form video kits and multi-channel marketing campaigns in under 60 seconds."
    },
    {
      q: "What can I create with Mangeto?",
      a: "From a single idea or sales deck, Mangeto generates 10–20 ranked scroll-stopping hooks, a 30s/60s/90s teleprompter-ready video script, a 4-scene visual storyboard with shot lists and b-roll directions, and a complete 5-channel marketing kit (LinkedIn post, X/Twitter thread, cold email, landing page hero, and YouTube description)."
    },
    {
      q: "Can I upload a sales deck?",
      a: "Yes. You can paste slide copy, bullet points, or raw notes from any PDF, PPT, or pitch document directly into the Deck-to-Video Synthesizer. Mangeto automatically extracts the core value proposition, key proof points, and transforms each slide into video scenes."
    },
    {
      q: "Does Mangeto create finished videos?",
      a: "Mangeto provides the complete creative and strategic production blueprint: the high-impact hooks, spoken scripts with timing cues, teleprompter workflows, shot lists, b-roll instructions, and on-screen text overlays. You can record using Mangeto's interactive browser teleprompter or export the storyboard to CapCut, Premiere, or your preferred video editor. We do not generate deepfake video avatars or AI renders."
    },
    {
      q: "What is included in a campaign kit?",
      a: "Every campaign kit delivers: 10–20 hooks labeled by angle with the top 3 ranked by scroll-stop power, a full script with [PAUSE] and [EMPHASIS] cues, a 4-scene video storyboard with visual directions, an interactive teleprompter mode, and ready-to-use copy for LinkedIn, X/Twitter, cold outbound email, landing page hero, and YouTube."
    },
    {
      q: "Who is Mangeto for?",
      a: "Mangeto is built for startup founders, B2B sales teams, solo creators, marketers, and creative agencies who need to produce consistent, high-converting video and social content from their existing sales decks and product ideas."
    },
    {
      q: "What is the difference between Starter and Pro?",
      a: "The Starter plan ($19/mo or $15/mo billed annually) includes 50 project generations per month with standard templates and script tools. The Pro plan ($49/mo or $39/mo billed annually) gives you 250 projects per month, multi-aspect ratio storyboard planning (9:16 vertical, 1:1 square, 16:9 widescreen), automated deck parsing, full marketing kits, and priority processing."
    },
    {
      q: "Do I need video editing experience?",
      a: "Zero video experience is required. Mangeto gives you exact word-for-word scripts, spoken delivery guidance, shot-by-shot visual directions, and teleprompter scrolling so you can record directly from your webcam or phone in minutes."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-2.5 cursor-pointer text-left group"
              id="landing_nav_logo"
            >
              <img src="/logo.svg" alt="Mangeto" className="h-8 w-auto group-hover:scale-105 transition" />
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-100 flex items-center gap-1.5">
                  Mangeto
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
                  AI Video Pitch & Hook Generator
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-350">
            <button
              onClick={() => scrollToSection('workflow')}
              className="hover:text-slate-100 transition cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-slate-100 transition cursor-pointer"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-slate-100 transition cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-slate-100 transition cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-slate-100 transition cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onStartFree}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/50 cursor-pointer"
                id="btn_landing_open_studio"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Open Studio</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                  id="btn_landing_login"
                >
                  Log in
                </button>
                <button
                  onClick={onStartFree}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-950/50 cursor-pointer"
                  id="btn_landing_start_free_nav"
                >
                  <span>Start creating free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onStartFree}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg"
            >
              Start Free
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-5 space-y-4">
            <div className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
              <button
                onClick={() => scrollToSection('workflow')}
                className="text-left py-1.5 hover:text-white"
              >
                Product Workflow
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-1.5 hover:text-white"
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-1.5 hover:text-white"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left py-1.5 hover:text-white"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left py-1.5 hover:text-white"
              >
                FAQ
              </button>
            </div>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              {!isAuthenticated && (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-300 bg-slate-800 rounded-xl"
                >
                  Log In
                </button>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); onStartFree(); }}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-indigo-600 rounded-xl flex items-center justify-center gap-2"
              >
                <span>Start creating free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/15 via-purple-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Announcement Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-semibold">Mangeto Engine v2.0:</span>
            <span className="text-slate-400">Deck-to-Video & 5-Channel Marketing Kits</span>
          </div>

          {/* Headline & Supporting Copy */}
          <div className="max-w-4xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-[1.1]">
              Turn your pitch into a <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">content campaign</span>.
            </h1>
            <p className="text-base sm:text-lg text-slate-350 max-w-2xl mx-auto leading-relaxed">
              Mangeto turns sales decks, product ideas, and raw pitches into scroll-stopping hooks, short-form video scripts, visual storyboards, and ready-to-use marketing content in minutes.
            </p>
          </div>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-950/60 cursor-pointer group"
              id="btn_hero_start_free"
            >
              <span>Start creating free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-sm font-semibold border border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
              id="btn_hero_see_how_it_works"
            >
              <Play className="w-3.5 h-3.5 fill-slate-400" />
              <span>See how it works</span>
            </button>
          </div>

          {/* Micro Guarantee */}
          <p className="text-xs text-slate-500 font-medium">
            2 free campaign kits. No credit card required.
          </p>

          {/* Interactive Transformation Dashboard Mockup */}
          <div className="pt-8 max-w-5xl mx-auto text-left">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Mockup Header Bar */}
              <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400 ml-2">
                    Mangeto Studio — Active Pitch Transformation
                  </span>
                </div>

                {/* Tab Switchers for Hero Demonstration */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setHeroPreviewTab('hooks')}
                    className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${heroPreviewTab === 'hooks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    AI Hooks (Ranked)
                  </button>
                  <button
                    onClick={() => setHeroPreviewTab('script')}
                    className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${heroPreviewTab === 'script' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Video Script
                  </button>
                  <button
                    onClick={() => setHeroPreviewTab('storyboard')}
                    className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${heroPreviewTab === 'storyboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    4-Scene Storyboard
                  </button>
                  <button
                    onClick={() => setHeroPreviewTab('marketing')}
                    className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${heroPreviewTab === 'marketing' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Marketing Kit
                  </button>
                </div>
              </div>

              {/* Mockup Body Content */}
              <div className="p-6">
                {heroPreviewTab === 'hooks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">15 Formulated Hooks Ranked by Scroll-Stop Power</h4>
                        <p className="text-xs text-slate-400">Target: Founders & Sales Teams • Angle Diversity: 7 Psychological Triggers</p>
                      </div>
                      <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono font-semibold">
                        Top 3 Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {/* Hook 1 */}
                      <div className="bg-slate-950/70 border border-indigo-500/40 p-4 rounded-xl space-y-3 relative shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-black tracking-widest text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/50">
                            #1 SCROLL-STOPPER
                          </span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">98% Power</span>
                        </div>
                        <p className="text-sm font-bold text-slate-100 leading-snug">
                          "Your sales deck isn't closing deals because nobody reads 30 slides."
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">Contrarian Angle</span>
                          <span className="font-mono">11 words</span>
                        </div>
                      </div>

                      {/* Hook 2 */}
                      <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-black tracking-widest text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            #2 SCROLL-STOPPER
                          </span>
                          <span className="text-xs font-bold text-indigo-400 font-mono">95% Power</span>
                        </div>
                        <p className="text-sm font-bold text-slate-100 leading-snug">
                          "We turned our 20-slide investor deck into 4 scroll-stopping TikToks."
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">Proof / Story</span>
                          <span className="font-mono">9 words</span>
                        </div>
                      </div>

                      {/* Hook 3 */}
                      <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-black tracking-widest text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            #3 SCROLL-STOPPER
                          </span>
                          <span className="text-xs font-bold text-indigo-400 font-mono">92% Power</span>
                        </div>
                        <p className="text-sm font-bold text-slate-100 leading-snug">
                          "Why 80% of sales outreach gets ignored in 3 seconds."
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">Problem Angle</span>
                          <span className="font-mono">8 words</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {heroPreviewTab === 'script' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">60-Second Teleprompter Script (Problem → Solution → Proof → CTA)</h4>
                        <p className="text-xs text-slate-400">Pacing: 130 WPM • Built-in [PAUSE] & [EMPHASIS] cues for natural cadence</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] bg-slate-800 text-indigo-300 px-2 py-1 rounded font-mono font-semibold">
                          Speed: 1.0x
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-3 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
                      <p>
                        <span className="text-indigo-400 font-mono text-xs font-bold mr-1.5">[0s - 10s HOOK]</span>
                        Your sales deck isn't closing deals <span className="bg-purple-900/40 text-purple-300 px-1 py-0.5 rounded font-mono text-xs">[PAUSE]</span> because nobody has time to read 30 slides.
                      </p>
                      <p>
                        <span className="text-indigo-400 font-mono text-xs font-bold mr-1.5">[10s - 25s PROBLEM]</span>
                        You spent weeks refining the copy, but prospects drop off before slide four. That means wasted meetings and missed pipeline.
                      </p>
                      <p>
                        <span className="text-indigo-400 font-mono text-xs font-bold mr-1.5">[25s - 45s SOLUTION & PROOF]</span>
                        Mangeto transforms your raw slides into a <span className="text-emerald-400 font-semibold">[EMPHASIS: scroll-stopping 60-second video kit]</span>. Founders who switched to video pitches raised demo booking rates by 40%.
                      </p>
                      <p>
                        <span className="text-indigo-400 font-mono text-xs font-bold mr-1.5">[45s - 60s CTA]</span>
                        Stop sending boring decks. Turn your next pitch into a video campaign for free today with Mangeto.
                      </p>
                    </div>
                  </div>
                )}

                {heroPreviewTab === 'storyboard' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">4-Scene Visual Storyboard & Shot Lists</h4>
                        <p className="text-xs text-slate-400">9:16 Vertical Video Ready • B-roll suggestions & on-screen text overlays</p>
                      </div>
                      <span className="text-[11px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full border border-indigo-500/20 font-mono">
                        4 Scenes Planned
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>SCENE 01</span>
                          <span className="text-indigo-400 font-bold">0s - 10s</span>
                        </div>
                        <p className="font-bold text-slate-200">The Scroll Stopper</p>
                        <p className="text-slate-400 text-[11px]">Close-up shot. Founder looking directly into camera with high urgency.</p>
                        <div className="bg-slate-900 p-1.5 rounded text-[10px] font-mono text-indigo-300">
                          TEXT: "STOP WASTING SLIDES"
                        </div>
                      </div>

                      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>SCENE 02</span>
                          <span className="text-indigo-400 font-bold">10s - 25s</span>
                        </div>
                        <p className="font-bold text-slate-200">The Drop-off Problem</p>
                        <p className="text-slate-400 text-[11px]">B-roll: Fast scroll through endless boring slides on a laptop screen.</p>
                        <div className="bg-slate-900 p-1.5 rounded text-[10px] font-mono text-indigo-300">
                          TEXT: "NOBODY READS 30 SLIDES"
                        </div>
                      </div>

                      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>SCENE 03</span>
                          <span className="text-indigo-400 font-bold">25s - 45s</span>
                        </div>
                        <p className="font-bold text-slate-200">The 60s Video Solution</p>
                        <p className="text-slate-400 text-[11px]">Split-screen showing Mangeto teleprompter & analytics uptick.</p>
                        <div className="bg-slate-900 p-1.5 rounded text-[10px] font-mono text-emerald-400">
                          TEXT: "+40% DEMO CONVERSIONS"
                        </div>
                      </div>

                      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>SCENE 04</span>
                          <span className="text-indigo-400 font-bold">45s - 60s</span>
                        </div>
                        <p className="font-bold text-slate-200">The Direct Action CTA</p>
                        <p className="text-slate-400 text-[11px]">Presenter smiling, pointing down towards profile link or website.</p>
                        <div className="bg-slate-900 p-1.5 rounded text-[10px] font-mono text-indigo-300">
                          TEXT: "START CREATING FREE"
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {heroPreviewTab === 'marketing' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">5-Channel Multi-Platform Marketing Kit</h4>
                        <p className="text-xs text-slate-400">Consistent messaging synchronized from one pitch across all channels</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(['linkedin', 'twitter', 'coldEmail', 'landingPage', 'youtube'] as const).map((channel) => (
                          <button
                            key={channel}
                            onClick={() => setActiveMarketingChannel(channel)}
                            className={`px-2 py-1 text-[11px] rounded font-medium transition cursor-pointer ${activeMarketingChannel === channel ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                          >
                            {channel === 'linkedin' && 'LinkedIn'}
                            {channel === 'twitter' && 'X / Twitter'}
                            {channel === 'coldEmail' && 'Cold Email'}
                            {channel === 'landingPage' && 'Landing Page'}
                            {channel === 'youtube' && 'YouTube'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed font-mono">
                      {activeMarketingChannel === 'linkedin' && (
                        <div className="space-y-2 whitespace-pre-line">
                          <p className="text-slate-100 font-bold font-sans">🚀 Why 30-slide pitch decks are dead (and what top founders use instead):</p>
                          <p>Most prospects drop off before slide 4. But converting your core proposition into a 60-second video pitch stops the scroll and doubles demo booking rates.</p>
                          <p>Here is the exact 4-step framework we use:
                          1. The 3-second contrarian hook
                          2. Identifying the bottleneck
                          3. Real outcome proof
                          4. Direct response CTA</p>
                          <p className="text-indigo-400 font-sans font-semibold">Try Mangeto free today to automate your campaign kit!</p>
                        </div>
                      )}
                      {activeMarketingChannel === 'twitter' && (
                        <div className="space-y-2">
                          <p className="text-slate-100 font-bold font-sans">1/ Nobody has time to read your 30-slide sales deck. 🧵</p>
                          <p>2/ We analyzed pitch drop-offs: 80% of readers quit before slide 5. Short-form video scripts solve this by condensing the value prop into 60 seconds.</p>
                          <p className="text-indigo-400 font-sans font-semibold">3/ Ready to convert your deck into video campaign kits? Check out Mangeto!</p>
                        </div>
                      )}
                      {activeMarketingChannel === 'coldEmail' && (
                        <div className="space-y-2">
                          <p className="text-slate-100 font-bold font-sans">Subject: Quick question regarding your sales deck conversion</p>
                          <p>Hi {"{{FirstName}}"},</p>
                          <p>Noticed you're leading growth at {"{{Company}}"}. We noticed most B2B sales decks experience high drop-off on static slides.</p>
                          <p>We built Mangeto to turn sales decks into 60s video pitch kits and social distribution assets in under a minute.</p>
                          <p>Open to taking a 2-minute look?</p>
                          <p className="text-slate-400 font-sans">Best,<br />Mangeto Team</p>
                        </div>
                      )}
                      {activeMarketingChannel === 'landingPage' && (
                        <div className="space-y-2 font-sans">
                          <p className="text-slate-400 text-xs uppercase font-mono">HERO HEADLINE:</p>
                          <p className="text-sm font-bold text-slate-100">"Turn Your Sales Deck Into A Viral Video Campaign."</p>
                          <p className="text-slate-400 text-xs uppercase font-mono pt-2">SUBHEADING:</p>
                          <p className="text-xs text-slate-300">"Transform slides into ranked scroll-stopping hooks, teleprompter scripts, and 4-scene video storyboards in minutes."</p>
                          <p className="text-slate-400 text-xs uppercase font-mono pt-2">CALL TO ACTION BUTTON:</p>
                          <span className="inline-block px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold">Start Creating Free</span>
                        </div>
                      )}
                      {activeMarketingChannel === 'youtube' && (
                        <div className="space-y-2 whitespace-pre-line">
                          <p className="text-slate-100 font-bold font-sans">How to Turn Any Pitch Deck into a Viral Short-Form Video (Full Walkthrough)</p>
                          <p>In this video, discover how Mangeto turns static sales decks and product ideas into high-converting video pitch kits, teleprompter scripts, and multi-channel campaigns.</p>
                          <p className="text-indigo-400 font-sans font-semibold">🔗 Start creating your free campaign kits: https://mangeto-v1.vercel.app</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section id="workflow" className="py-20 bg-slate-900/50 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              The Production Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              From pitch to campaign in minutes.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Five straightforward steps to turn raw ideas into an unstoppable multi-channel content engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Step 01 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 relative group hover:border-indigo-500/40 transition">
              <span className="text-2xl font-mono font-black text-indigo-400">01</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-100">Upload your pitch</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload a sales deck, product idea, or raw marketing concept.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 relative group hover:border-indigo-500/40 transition">
              <span className="text-2xl font-mono font-black text-indigo-400">02</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-100">Generate scroll-stopping hooks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get 10–20 hooks across Problem, Curiosity, Contrarian, Proof, FOMO, Benefit, and Story angles.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 relative group hover:border-indigo-500/40 transition">
              <span className="text-2xl font-mono font-black text-indigo-400">03</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-100">Build the video</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Turn the strongest hook into a 30s, 60s, or 90s teleprompter-ready script and 4-scene storyboard.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 relative group hover:border-indigo-500/40 transition">
              <span className="text-2xl font-mono font-black text-indigo-400">04</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-100">Plan the visuals</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get shot lists, b-roll suggestions, on-screen text, captions, and avatar direction.
                </p>
              </div>
            </div>

            {/* Step 05 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 relative group hover:border-indigo-500/40 transition">
              <span className="text-2xl font-mono font-black text-indigo-400">05</span>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-100">Launch everywhere</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate LinkedIn, X/Twitter, cold email, landing-page hero, and YouTube copy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (VISUAL WALKTHROUGH) */}
      <section id="how-it-works" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              Architecture & Data Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              One Input. Ten Strategic Outputs.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              See exactly how Mangeto takes raw concept data and transforms it into a multi-channel campaign kit.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Input Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase">
                <Layers className="w-4 h-4" />
                <span>INPUT: Single Source Concept</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-sm font-mono text-slate-300">
                Sales deck / product idea / offer
              </div>
            </div>

            {/* Processing Arrow */}
            <div className="flex flex-col items-center justify-center py-2 space-y-1 text-slate-500">
              <div className="h-6 w-px bg-indigo-500/50" />
              <div className="px-4 py-1 bg-indigo-950/80 text-indigo-300 rounded-full border border-indigo-800/60 font-mono text-xs font-bold flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 fill-indigo-400" />
                <span>MANGETO AI SYNTHESIS</span>
              </div>
              <div className="h-6 w-px bg-indigo-500/50" />
            </div>

            {/* Output Grid */}
            <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>OUTPUT: Complete Campaign Kit</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">10 Deliverables Synchronized</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>15 ranked hooks</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>60-second video script</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>4-scene storyboard</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Teleprompter version</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>LinkedIn post</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>X/Twitter thread</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Cold email</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Landing-page hero</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-medium text-slate-200 sm:col-span-2 md:col-span-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>YouTube description</span>
                </div>
              </div>

              {/* Quick Action Button inside Walkthrough */}
              <div className="pt-4 text-center">
                <button
                  onClick={onStartFree}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-2 shadow-lg shadow-indigo-950/50 cursor-pointer"
                >
                  <span>Turn my pitch into content</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Engineered for conversion, not generic fluff.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Every tool in Mangeto serves one objective: converting passive viewers into active customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">AI Hook Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate 10–20 hooks per idea, label them by angle, and rank the strongest hooks by scroll-stop potential.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Teleprompter Script Builder</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn the best hook into 30s, 60s, or 90s scripts with natural spoken delivery and [PAUSE] and [EMPHASIS] cues.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">4-Scene Video Storyboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transform the script into a practical shot list with b-roll ideas, on-screen text, visual direction, and captions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Deck-to-Video Planning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload a PDF or presentation and turn the core ideas into a structured video pitch.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">5-Channel Marketing Kit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn one pitch into LinkedIn, X/Twitter, cold email, landing-page hero, and YouTube content.
              </p>
            </div>

            {/* Feature 6 - Teleprompter Mode */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Live Browser Teleprompter</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Record your pitch directly with adjustable scrolling speeds, mirror mode for webcams, and font-size controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IT IS FOR SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              Target Audience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Built for people who need more content from every pitch.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Never let valuable pitch presentations sit idle inside slide folders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Founders */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-mono uppercase font-black text-slate-200 tracking-wider">FOUNDERS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn fundraising decks, product launches, and ideas into compelling content.
              </p>
            </div>

            {/* Sales Teams */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-mono uppercase font-black text-slate-200 tracking-wider">SALES TEAMS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn sales decks and product presentations into demo and social video concepts.
              </p>
            </div>

            {/* Creators */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-mono uppercase font-black text-slate-200 tracking-wider">CREATORS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn ideas and offers into short-form content without starting from a blank page.
              </p>
            </div>

            {/* Agencies */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-mono uppercase font-black text-slate-200 tracking-wider">AGENCIES</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn one client brief or pitch into a complete multi-channel campaign.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              Transparent Investment
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Simple plans. Start free.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Evaluate Mangeto with zero credit card required. Upgrade when you need continuous production volume.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-slate-100' : 'text-slate-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6 rounded-full bg-slate-800 p-1 flex items-center border border-slate-700 transition cursor-pointer"
                aria-label="Toggle billing frequency"
              >
                <div className={`w-4 h-4 rounded-full bg-indigo-500 transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold ${billingCycle === 'yearly' ? 'text-slate-100' : 'text-slate-400'}`}>
                  Yearly
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </div>
            </div>
          </div>

          {/* Pricing 3-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* PLAN 1: Free Trial */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-100">Free Trial</h3>
                  <p className="text-xs text-slate-400">Try Mangeto with no credit card required.</p>
                </div>

                <div className="pt-2">
                  <span className="text-4xl font-black text-slate-100">$0</span>
                  <span className="text-xs text-slate-400 ml-1">/ forever</span>
                </div>

                <div className="h-px bg-slate-800 w-full" />

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2 full campaign kits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>15 ranked hooks per kit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Teleprompter script</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>4-scene storyboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>5-channel marketing kit</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartFree}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                id="btn_pricing_free"
              >
                <span>Start free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PLAN 2: Starter */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-100">Starter</h3>
                  <p className="text-xs text-slate-400">For solo founders and independent creators.</p>
                </div>

                <div className="pt-2">
                  <span className="text-4xl font-black text-slate-100">
                    {billingCycle === 'monthly' ? '$19' : '$15'}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    {billingCycle === 'monthly' ? '/ month' : '/ month billed annually'}
                  </span>
                </div>

                <div className="h-px bg-slate-800 w-full" />

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>50 projects per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Proven pitch & hook copywriting frameworks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>10–20 hooks per idea</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Top 3 hooks ranked by scroll-stop potential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>30s / 60s / 90s teleprompter script builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Standard export formats</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenPricing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/40"
                id="btn_pricing_starter"
              >
                <span>Start Starter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PLAN 3: Pro */}
            <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-2xl p-7 space-y-6 flex flex-col justify-between relative shadow-xl shadow-indigo-950/20">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                POPULAR CHOICE
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-100">Pro</h3>
                  <p className="text-xs text-slate-400">For marketing teams, agencies, and high-volume creators.</p>
                </div>

                <div className="pt-2">
                  <span className="text-4xl font-black text-slate-100">
                    {billingCycle === 'monthly' ? '$49' : '$39'}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">
                    {billingCycle === 'monthly' ? '/ month' : '/ month billed annually'}
                  </span>
                </div>

                <div className="h-px bg-slate-800 w-full" />

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>250 projects per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Team seats <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.2 rounded font-mono font-medium ml-1">Coming soon</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Shared workspaces <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.2 rounded font-mono font-medium ml-1">Coming soon</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>9:16 vertical, 1:1 square, 16:9 widescreen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Multi-aspect storyboard export (9:16, 1:1, 16:9)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Automated pitch deck-to-video parser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full 5-channel marketing launch kit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Priority support & fast processing</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenPricing}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/50"
                id="btn_pricing_pro"
              >
                <span>Start Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Clear answers. No ambiguity.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Everything you need to know about Mangeto's capabilities and workflows.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/50 transition"
                  aria-expanded={activeFaq === idx}
                >
                  <span className="text-sm font-bold text-slate-200">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-900 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Your next pitch could become your next content campaign.
          </h2>

          <p className="text-sm sm:text-base text-slate-350 max-w-xl mx-auto leading-relaxed">
            Turn one idea into hooks, scripts, storyboards, and marketing content in minutes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-950/60 cursor-pointer"
              id="btn_final_cta_start_free"
            >
              <span>Start creating free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            2 campaign kits. No credit card required.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <ComplianceFooter onNavigateTo={onNavigateTo} />
    </div>
  );
}
