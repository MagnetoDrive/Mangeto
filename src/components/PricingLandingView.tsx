import React, { useState } from "react";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  Rocket, 
  Copy, 
  CheckCircle2, 
  HelpCircle, 
  Star, 
  Clock, 
  ExternalLink, 
  Globe, 
  ChevronDown, 
  Lock, 
  RefreshCw,
  Gift,
  Award,
  Layers,
  Video
} from "lucide-react";

interface PricingLandingViewProps {
  onBackToApp?: () => void;
  onSelectFreePitch?: (concept: string) => void;
  onHireDeveloper?: () => void;
}

export default function PricingLandingView({ 
  onBackToApp, 
  onSelectFreePitch,
  onHireDeveloper 
}: PricingLandingViewProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [copiedPitch1, setCopiedPitch1] = useState(false);
  const [copiedPitch2, setCopiedPitch2] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Interactive 2 Free Pitches Demo state
  const [sampleConcept, setSampleConcept] = useState("AI-Powered Sales Pitch Generator");
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [demoPitches, setDemoPitches] = useState<{ id: number; title: string; hook: string; body: string; cta: string }[] | null>(null);

  // Merchant of Record (MOR) Pitches for Lemon Squeezy & Paddle
  const morPitch1 = `Magneto is an AI-powered Video Pitch & Scriptwriting SaaS platform that converts raw product concepts into high-converting video scripts, teleprompter workflows, and marketing collateral using Gemini 1.5 Pro orchestration. Delivered as a cloud-based SaaS subscription with instant digital entitlement, automated license provisioning, strict data privacy compliance, and zero physical fulfillment risk.`;

  const morPitch2 = `7-Day Custom Software Sprint is a flat-rate $450 USD digital product development service providing bespoke SaaS feature engineering, API integrations, and custom web application workflows. Features guaranteed delivery within 7 calendar days, direct senior developer collaboration, transparent milestone sign-off, and clear digital service terms compliant with Lemon Squeezy & Paddle MOR standards.`;

  const handleCopyMorPitch = (text: string, pitchNum: 1 | 2) => {
    navigator.clipboard.writeText(text).then(() => {
      if (pitchNum === 1) {
        setCopiedPitch1(true);
        setTimeout(() => setCopiedPitch1(false), 2000);
      } else {
        setCopiedPitch2(true);
        setTimeout(() => setCopiedPitch2(false), 2000);
      }
    });
  };

  const handleGenerate2FreePitches = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleConcept.trim()) return;
    setIsGeneratingDemo(true);
    setTimeout(() => {
      setDemoPitches([
        {
          id: 1,
          title: "Pitch #1: Direct Response 'PAS' Framework (Lemon Squeezy / Paddle Product)",
          hook: `Stop losing 70% of potential buyers because your pitch sounds like everyone else's.`,
          body: `Meet ${sampleConcept}. It transforms raw product features into persuasive video pitches, teleprompter scripts, and visual storyboards in under 30 seconds. No agency fees, no guesswork.`,
          cta: `Claim your 2 Free Pitches today and watch your conversion rate double.`
        },
        {
          id: 2,
          title: "Pitch #2: 'Before-After-Bridge' UGC Social Pitch",
          hook: `I used to spend 4 hours rewriting script hooks before recording a single video.`,
          body: `Then I discovered ${sampleConcept}. Now I enter my idea, get 15 viral hooks instantly, and record with an in-app teleprompter. It cuts creation time by 80%.`,
          cta: `Try 2 Pitches 100% Free—no credit card required!`
        }
      ]);
      setIsGeneratingDemo(false);
    }, 1200);
  };

  const faqs = [
    {
      q: "Why do you use Lemon Squeezy & Paddle as Merchants of Record (MOR)?",
      a: "Lemon Squeezy and Paddle act as our Merchant of Record, handling global EU VAT, sales tax compliance, multi-currency conversion, and PCI-DSS compliant secure credit card/PayPal checkouts. You get instant invoices and seamless management."
    },
    {
      q: "How do the 2 Free Pitches work?",
      a: "Every new account automatically receives 2 Free AI Video Pitches with full teleprompter and hook engine access—no credit card or upfront commitment required. Upgrade to Pro whenever you need unlimited pitches."
    },
    {
      q: "Can I use the pre-written MOR Pitches for my own Lemon Squeezy / Paddle store?",
      a: "Yes! If you are applying to Lemon Squeezy or Paddle as a vendor to sell software or digital services, copy our 2 pre-formatted MOR pitch templates above. They are engineered to satisfy MOR risk & compliance requirements."
    },
    {
      q: "What is included in the $450 7-Day Developer Sprint?",
      a: "You get a dedicated senior developer (Tsepo Motsatse) for 7 full days to build custom SaaS features, integrations, or standalone tools for your business. It is a flat-rate single payment with zero hidden fees."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Absolutely. You can manage or cancel your subscription at any time with 1-click through your Lemon Squeezy or Paddle customer portal."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/30">
              M
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-100 block">Magneto</span>
              <span className="text-[10px] text-indigo-400 font-mono uppercase font-bold">Pricing & MOR Edition</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                Return to Workspace
              </button>
            )}
            <a
              href="#pricing-tiers"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer hidden sm:inline-flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              Get Started
            </a>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="relative pt-16 pb-12 px-4 max-w-5xl mx-auto text-center space-y-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-mono uppercase font-bold tracking-wider animate-pulse">
          <Gift className="w-3.5 h-3.5 text-indigo-400" />
          <span>Includes 2 Free Pitches • Powered by Lemon Squeezy & Paddle MOR</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight max-w-4xl mx-auto">
          Predictable Pricing for High-Converting <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">AI Video Pitches</span>
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Convert product concepts into structured pitch scripts, teleprompter workflows, and marketing campaigns in seconds. Backed by industry-standard Merchant of Record (MOR) compliance.
        </p>

        {/* MOR Compliance Trust Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Lemon Squeezy Merchant of Record</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>Paddle MOR Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Global EU VAT & Tax Handled</span>
          </div>
        </div>
      </section>

      {/* SECTION 1: Interactive "2 Free Pitches" Live Generator Demo */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Gift className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  Try 2 Free Pitches Now
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    Instant Demo
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Generate 2 instant AI video pitches without registering or entering a credit card.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-800/50">
              0 / 2 Pitches Used
            </span>
          </div>

          <form onSubmit={handleGenerate2FreePitches} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase font-bold text-slate-300">Enter Your Product / SaaS Concept:</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={sampleConcept}
                  onChange={(e) => setSampleConcept(e.target.value)}
                  placeholder="e.g. AI Customer Service Agent for E-Commerce"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={isGeneratingDemo}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-indigo-600/25"
                >
                  {isGeneratingDemo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Drafting 2 Pitches...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-white" />
                      Generate 2 Free Pitches
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Generated Demo Pitches Result Display */}
          {demoPitches && (
            <div className="space-y-4 pt-2 animate-fade-in">
              <div className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Here Are Your 2 Free Generated Pitch Scripts:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoPitches.map((p) => (
                  <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative group">
                    <div className="text-xs font-bold text-indigo-300 border-b border-slate-850 pb-2 flex items-center justify-between">
                      <span>{p.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">Free Credit</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Hook line:</span>
                        <p className="text-slate-200 font-medium italic bg-slate-900/60 p-2 rounded border border-slate-800/80">
                          "{p.hook}"
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block">Core Body:</span>
                        <p className="text-slate-300 leading-relaxed text-[11px]">{p.body}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Call to Action:</span>
                        <p className="text-slate-200 font-bold text-[11px]">{p.cta}</p>
                      </div>
                    </div>

                    {onSelectFreePitch && (
                      <button
                        onClick={() => onSelectFreePitch(sampleConcept)}
                        className="w-full mt-2 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Open in Teleprompter Studio
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Industry-Standard Pricing Tiers */}
      <section id="pricing-tiers" className="max-w-6xl mx-auto px-4 mb-20 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-100">
            Simple, Transparent Plans
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
            Choose the plan that fits your creation volume. Upgrade or downgrade anytime via Lemon Squeezy / Paddle customer portal.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="inline-flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0.2 rounded font-mono">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: Free Starter */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative hover:border-slate-700 transition">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-slate-400">Free Tier</span>
                <h3 className="text-xl font-bold text-slate-100">Starter Creator</h3>
                <p className="text-xs text-slate-400">Perfect for trying out video pitches</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-100">$0</span>
                <span className="text-xs text-slate-500">/ forever</span>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>2 Free AI Video Pitches</strong> per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard Teleprompter studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>15 Hook formulas per campaign</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic Storyboard preview</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <Check className="w-4 h-4 text-slate-700 shrink-0" />
                  <span>Standard exports</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onBackToApp}
              className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Get Started Free (2 Pitches Included)
            </button>
          </div>

          {/* Card 2: Pro Storyteller (Most Popular) */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-2xl shadow-indigo-600/20 scale-[1.02] z-10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-mono uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              Most Popular
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-indigo-400">Pro Plan</span>
                <h3 className="text-xl font-bold text-slate-100">Pro Storyteller</h3>
                <p className="text-xs text-slate-400">For active creators, SaaS founders & marketers</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-100">
                  {billingCycle === 'monthly' ? '$29' : '$24'}
                </span>
                <span className="text-xs text-slate-400">
                  / month {billingCycle === 'yearly' && '(billed $290/yr)'}
                </span>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span><strong>Unlimited AI Video Pitches</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Advanced Gemini 1.5 Pro AI Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>4K Visual Storyboards & Scene Images</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Full Marketing Kit & Launch Deploy</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Lemon Squeezy & Paddle Checkout Sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Priority Processing & Support</span>
                </li>
              </ul>
            </div>

            <a
              href="https://checkout.lemonsqueezy.com/buy/magneto-pro-subscription"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Subscribe via Lemon Squeezy / Paddle
            </a>
          </div>

          {/* Card 3: Agency & Scale */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative hover:border-slate-700 transition">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-purple-400">Agency Tier</span>
                <h3 className="text-xl font-bold text-slate-100">Agency & Scale</h3>
                <p className="text-xs text-slate-400">For teams managing multiple client accounts</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-100">
                  {billingCycle === 'monthly' ? '$79' : '$65'}
                </span>
                <span className="text-xs text-slate-500">
                  / month {billingCycle === 'yearly' && '(billed $790/yr)'}
                </span>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Everything in Pro</strong> + Multi-Client Workspaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Custom Brand Voices & Tone Customization</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Deck Summarizer AI & Bulk Export</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Merchant of Record (MOR) Store Onboarding Kit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Dedicated Slack / Discord Channel</span>
                </li>
              </ul>
            </div>

            <a
              href="https://checkout.lemonsqueezy.com/buy/magneto-agency-subscription"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 w-full py-3 bg-purple-900/50 hover:bg-purple-900/80 text-purple-200 text-xs font-bold rounded-xl border border-purple-700/50 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              Subscribe Agency Plan
            </a>
          </div>

        </div>

        {/* Flat-rate 7-Day Developer Sprint Highlight */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
              <Clock className="w-3.5 h-3.5" />
              Flat-Rate Custom Software Option
            </div>
            <h3 className="text-xl font-extrabold text-slate-100">Need Custom Features or Custom Software? 🚀</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Get a dedicated senior fullstack developer (Tsepo Motsatse) to build your custom feature, integration, or standalone web app in 7 days or less for a flat rate of $450.
            </p>
          </div>

          <button
            onClick={onHireDeveloper}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            Hire Developer ($450 Single Payment)
          </button>
        </div>
      </section>

      {/* SECTION 3: 2 Free Copyable Merchant of Record (MOR) Pitches for Lemon Squeezy & Paddle */}
      <section className="max-w-5xl mx-auto px-4 mb-20 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase font-bold text-indigo-400">Merchant of Record Compliance Kit</span>
          <h2 className="text-2xl font-extrabold text-slate-100">
            2 Free Copyable Pitches for Lemon Squeezy & Paddle MORs
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Submitting your product to Lemon Squeezy or Paddle for Merchant of Record approval? Copy these 2 pre-written, compliance-audited product pitches to pass MOR vendor review instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MOR Pitch 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase">MOR Pitch Template #1</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">SaaS Subscription Pitch</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Lemon Squeezy / Paddle SaaS Compliance Pitch</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-850 font-mono text-[11px]">
                {morPitch1}
              </p>
            </div>

            <button
              onClick={() => handleCopyMorPitch(morPitch1, 1)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedPitch1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedPitch1 ? "MOR Pitch #1 Copied!" : "Copy MOR SaaS Pitch"}
            </button>
          </div>

          {/* MOR Pitch 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">MOR Pitch Template #2</span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Digital Service / Sprint Pitch</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Lemon Squeezy / Paddle Custom Sprint Pitch</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-850 font-mono text-[11px]">
                {morPitch2}
              </p>
            </div>

            <button
              onClick={() => handleCopyMorPitch(morPitch2, 2)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedPitch2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedPitch2 ? "MOR Pitch #2 Copied!" : "Copy MOR Sprint Pitch"}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: Frequently Asked Questions (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 mb-20 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-100">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about billing, MOR compliance, and free credits.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-slate-200 hover:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>

              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4 pt-8 border-t border-slate-900">
        <h3 className="text-xl font-bold text-slate-100">Ready to Elevate Your Video Pitches?</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Start with 2 free pitches or upgrade to Pro for unlimited AI video pitch generation.
        </p>

        <div className="flex justify-center gap-3 pt-2">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Launch Magneto Workspace
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
