import React, { useState } from "react";
import { 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  Star, 
  ChevronDown, 
  Lock, 
  Info,
  Gift,
  Loader2
} from "lucide-react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import ComplianceFooter from "../components/ComplianceFooter";
import { doc, setDoc } from "firebase/firestore";
import { db, initializeAnonymousSession } from "../lib/firebase";

interface PricingPageProps {
  onBackToApp?: () => void;
  onNavigateTo?: (page: 'landing' | 'main' | 'admin' | 'privacy' | 'terms' | 'pricing' | 'refund' | 'billing') => void;
  currentUser?: {
    uid: string;
    email: string | null;
    displayName: string | null;
    isAnonymous?: boolean;
  } | null;
}

export default function PricingPage({
  onBackToApp,
  onNavigateTo,
  currentUser
}: PricingPageProps) {
  const [isLTDCheckoutOpen, setIsLTDCheckoutOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [checkoutCompleteReceipt, setCheckoutCompleteReceipt] = useState<string | null>(null);
  const [isStartingFree, setIsStartingFree] = useState(false);
  const [isActivatingLTD, setIsActivatingLTD] = useState(false);

  // Lifetime Deal Plan ID from environment or default
  const ltdPlanId = import.meta.env.VITE_WHOP_PLAN_LTD_ID || "plan_magneto_ltd_79";

  const handleStartFree = async () => {
    setIsStartingFree(true);
    try {
      if (currentUser?.uid) {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
          plan: "free",
          planStatus: "Free",
          projectsLimit: 2,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await new Promise<void>((resolve) => {
          initializeAnonymousSession(async (uid) => {
            try {
              const userRef = doc(db, "users", uid);
              await setDoc(userRef, {
                uid,
                plan: "free",
                planStatus: "Free",
                projectsLimit: 2,
                projectsUsed: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }, { merge: true });
            } catch (_) {}
            resolve();
          });
        });
      }
      if (onBackToApp) onBackToApp();
    } catch (err) {
      console.warn("Start free tier exception:", err);
      if (onBackToApp) onBackToApp();
    } finally {
      setIsStartingFree(false);
    }
  };

  const handleLTDSuccess = async (receiptId: string) => {
    setIsActivatingLTD(true);
    setCheckoutCompleteReceipt(receiptId);
    try {
      if (currentUser?.uid) {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
          plan: "lifetime",
          planStatus: "Lifetime Deal",
          projectsLimit: 250,
          projectsUsed: 0,
          receiptId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn("LTD activation exception:", err);
    } finally {
      setIsActivatingLTD(false);
    }
  };

  const faqs = [
    {
      q: "How does the Lifetime Deal (LTD) work?",
      a: "You make a single, one-time payment of $79 and receive permanent access to Magneto Pro. You will never be charged a monthly, annual, or recurring renewal fee. Your account includes 250 high-impact video pitch projects every month and all future software features."
    },
    {
      q: "What happens right after I complete checkout?",
      a: "Our embedded checkout runs directly within Magneto Pro. Your one-time license is provisioned in real time, unlocking full access immediately without waiting, redirecting, or manual approval."
    },
    {
      q: "Are future feature updates included in this Lifetime Deal?",
      a: "Yes! All future platform upgrades, new prompt engine presets (including Leonardo.ai, Flux, SD, Runway), teleprompter enhancements, and marketing kit updates are included for lifetime license holders at no additional cost."
    },
    {
      q: "What is your refund policy?",
      a: "We want you to evaluate Magneto Pro with complete confidence. We offer a 14-day money-back guarantee. If Magneto Pro does not fit your video production workflow, contact us at tsepomotsatse@gmail.com for a swift, full refund."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top sticky bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToApp}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </button>

          <div className="flex items-center gap-3">
            {currentUser && onNavigateTo && (
              <button
                onClick={() => onNavigateTo('billing')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                <span>My Billing & Plan</span>
              </button>
            )}
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Secure Merchant</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Early Adopter Founder Pass · Limited Lifetime Deal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Pay Once. Own Magneto Pro Forever.
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Say goodbye to recurring subscription fatigue. Get full lifetime access to our AI pitch deck-to-video studio, teleprompter, and visual storyboard engine with a single one-time payment.
        </p>
      </section>

      {/* Pricing Cards Grid (2 Focused Options: Free Trial vs Lifetime Deal) */}
      <section className="max-w-5xl mx-auto px-6 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* OPTION 1: Free Trial ($0) */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-xl transition duration-200">
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-slate-400">Curious Creators & Founders</span>
                <h2 className="text-2xl font-black text-white">Free Evaluation</h2>
                <p className="text-xs text-slate-400">Test the video pitch & hook generator with zero risk and no credit card required.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <div className="space-y-3">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Included features:</span>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>2 full campaign kits</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No credit card required</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>15 ranked hooks per request</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>30s/60s/90s teleprompter script builder</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>4-scene video storyboard with visual directions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Leonardo.ai free tier prompt preset</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Standard text export formats</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={handleStartFree}
                disabled={isStartingFree}
                className="w-full py-3.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white"
                id="btn_pricing_free"
              >
                {isStartingFree ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span>Setting up Free Access...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 text-emerald-400" />
                    <span>Start Free Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OPTION 2: Magneto Pro Lifetime Deal ($79 One-Time) */}
          <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/50 border-2 border-indigo-500/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl shadow-indigo-950/60 transition duration-200">
            {/* Top Founder Pass Ribbon */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-600 text-white font-mono uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-lg tracking-wider flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-white" />
              <span>Founder Pass · Limited Lifetime Deal</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-indigo-400">Lifetime Entitlement</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Magneto Pro Lifetime Pass</h2>
                <p className="text-xs text-slate-300">Complete AI pitch deck-to-video studio with full creative control. Never pay monthly.</p>
              </div>

              {/* Price Lockup */}
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">$79</span>
                <span className="text-xs font-semibold text-emerald-400 font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  One-time payment
                </span>
                <span className="text-xs text-slate-400 line-through">
                  $299 Value
                </span>
                <span className="text-[11px] text-amber-400 font-mono">
                  (Save 73% during launch)
                </span>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <div className="space-y-3">
                <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                  Everything unlocked forever:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>250 video projects / month</strong></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Full Deck-to-Video Synthesizer</strong> (PDF, PPT, notes)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Visual Prompt Studio</strong> (Leonardo.ai, Flux, SD, Runway)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Interactive Browser Teleprompter</strong> with live scroll</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Multi-Aspect Ratios</strong> (9:16 vertical, 1:1 square, 16:9)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Studio AI Voiceover Audio</strong> & Gemini narration engine</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Full 5-Channel Marketing Kits</strong> (LinkedIn, X, Email, Web, YT)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Batch Prompt & TXT/SRT Export</strong> downloads</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>All Future Feature Updates</strong> included with 0 extra fees</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>14-Day 100% Money-Back Guarantee</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setIsLTDCheckoutOpen(!isLTDCheckoutOpen)}
                className={`w-full py-4 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                  isLTDCheckoutOpen
                    ? 'bg-slate-800 text-slate-200 border border-slate-700'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white shadow-xl shadow-indigo-600/30'
                }`}
                id="btn_pricing_ltd"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLTDCheckoutOpen ? "Close Checkout Form" : "Claim Lifetime Access for $79"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* EMBEDDED CHECKOUT SECTION FOR LTD */}
        {isLTDCheckoutOpen && (
          <div className="mt-12 bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300" id="ltd-checkout-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Complete Lifetime Pass Purchase ($79 One-Time)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instant Digital Entitlement &bull; Plan ID: <code className="font-mono text-indigo-300">{ltdPlanId}</code>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLTDCheckoutOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer self-start sm:self-auto"
              >
                Close Checkout
              </button>
            </div>

            {/* Embedded Component */}
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 p-3 min-h-[480px]">
              {checkoutCompleteReceipt ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Lifetime Access Activated!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Your one-time purchase has been confirmed. You now have lifetime access to Magneto Pro. Receipt ID: <span className="font-mono text-indigo-400">{checkoutCompleteReceipt}</span>
                  </p>
                  <div className="pt-4 flex justify-center gap-4">
                    {onNavigateTo && (
                      <button
                        onClick={() => onNavigateTo('billing')}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Go to Billing Hub
                      </button>
                    )}
                    <button
                      onClick={onBackToApp}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Start Generating Videos
                    </button>
                  </div>
                </div>
              ) : (
                <WhopCheckoutEmbed
                  planId={ltdPlanId}
                  theme="dark"
                  prefill={{
                    email: currentUser?.email || undefined
                  }}
                  themeOptions={{
                    accentColor: "indigo",
                    backgroundColor: "#020617",
                    borderRadius: 12
                  }}
                  onComplete={(plan_id, receipt_id, result) => {
                    console.log("[LTD Checkout Successful]:", { plan_id, receipt_id, result });
                    handleLTDSuccess(receipt_id || `rec_ltd_${Date.now()}`);
                  }}
                  fallback={
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-400">Connecting to Secure Lifetime Checkout ({ltdPlanId})...</p>
                    </div>
                  }
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* Trust & Guarantees */}
      <section className="max-w-5xl mx-auto px-6 py-10 border-t border-slate-900 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-2 p-4 bg-slate-900/40 rounded-xl border border-slate-850">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">14-Day Money-Back Guarantee</h4>
            <p className="text-xs text-slate-400">Evaluate Magneto Pro with complete peace of mind. Full refund available if it doesn't fit your workflow.</p>
          </div>
          <div className="space-y-2 p-4 bg-slate-900/40 rounded-xl border border-slate-850">
            <Zap className="w-6 h-6 text-indigo-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Instant Software Entitlement</h4>
            <p className="text-xs text-slate-400">Pay once, your digital lifetime license unlocks in real time directly within your account.</p>
          </div>
          <div className="space-y-2 p-4 bg-slate-900/40 rounded-xl border border-slate-850">
            <Lock className="w-6 h-6 text-purple-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Zero Recurring Subscriptions</h4>
            <p className="text-xs text-slate-400">One-time payment of $79. Never get billed monthly or annually. Lifetime updates included.</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-6 py-12 w-full space-y-6">
        <h3 className="text-xl font-bold text-white text-center">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-slate-200 hover:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-4 pt-1 text-xs text-slate-400 border-t border-slate-800/60 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Global Compliance Footer */}
      {onNavigateTo && <ComplianceFooter onNavigateTo={onNavigateTo} />}
    </div>
  );
}
