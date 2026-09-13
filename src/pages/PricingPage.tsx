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
  onNavigateTo?: (page: 'main' | 'admin' | 'privacy' | 'terms' | 'pricing' | 'refund' | 'billing') => void;
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanForEmbed, setSelectedPlanForEmbed] = useState<'Starter' | 'Pro' | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [checkoutCompleteReceipt, setCheckoutCompleteReceipt] = useState<string | null>(null);
  const [isStartingFree, setIsStartingFree] = useState(false);

  // Whop plan IDs from environment or defaults requested by user
  const starterPlanMonthly = import.meta.env.VITE_WHOP_PLAN_STARTER_MONTHLY || "plan_starter_monthly";
  const starterPlanYearly = import.meta.env.VITE_WHOP_PLAN_STARTER_YEARLY || "plan_starter_yearly";
  const proPlanMonthly = import.meta.env.VITE_WHOP_PLAN_PRO_MONTHLY || "plan_pro_monthly";
  const proPlanYearly = import.meta.env.VITE_WHOP_PLAN_PRO_YEARLY || "plan_pro_yearly";

  const activeStarterPlanId = billingCycle === 'monthly' ? starterPlanMonthly : starterPlanYearly;
  const activeProPlanId = billingCycle === 'monthly' ? proPlanMonthly : proPlanYearly;
  const currentEmbedPlanId = selectedPlanForEmbed === 'Starter' ? activeStarterPlanId : activeProPlanId;

  const starterPrice = billingCycle === 'monthly' ? '$19' : '$15';
  const proPrice = billingCycle === 'monthly' ? '$49' : '$39';

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

  const faqs = [
    {
      q: "How does billing with Whop work?",
      a: "Whop is our official subscription checkout and customer management system. When you subscribe, Whop processes your payment with bank-grade encryption and instantly activates your Mangeto account. You can manage invoices, upgrade, or cancel in your Whop Customer Hub anytime with one click."
    },
    {
      q: "What happens when I subscribe without leaving the app?",
      a: "Our embedded Whop checkout runs directly within Mangeto. You enter your payment method right here, and your license is provisioned in real-time. There are no external redirects required."
    },
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes. Simply click 'Billing' in Mangeto or visit https://whop.com/hub. You can cancel with a single click. Your access and credits remain active until the end of your current prepaid billing cycle."
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 14-day refund window on software subscriptions if your monthly generation quota has not been consumed. You can reach out to tsepomotsatse@gmail.com for instant assistance."
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
              <span>Whop Verified Merchant</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent Self-Service Software Pricing</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Automated Pitch Deck to Video Plans
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Select the plan that matches your production volume. Subscribe securely with Whop embedded checkout directly in this app.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-white font-bold' : 'text-slate-400'}`}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              billingCycle === 'yearly' ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
            aria-label="Toggle billing cycle"
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${billingCycle === 'yearly' ? 'text-white font-bold' : 'text-slate-400'}`}>
              Annual
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid (3 Plans: Free, Starter, Pro) */}
      <section className="max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* PLAN 1: Free ($0) */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-xl transition duration-200">
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-slate-400">Curious Creators & Founders</span>
                <h2 className="text-2xl font-black text-white">Free</h2>
                <p className="text-xs text-slate-400">Test the viral pitch generator with no credit card required.</p>
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
                    <span>15 ranked hooks per request</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>30s/60s/90s teleprompter script builder</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>4-scene video storyboard with b-roll</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>5-channel marketing kit</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Standard export formats</span>
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
                    <span>Start free</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PLAN 2: Starter ($19/mo or $15/mo) */}
          <div className={`bg-slate-900/90 border-2 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-xl transition duration-200 ${
            selectedPlanForEmbed === 'Starter' 
              ? 'border-indigo-400 ring-2 ring-indigo-400/50' 
              : 'border-slate-800 hover:border-slate-700'
          }`}>
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-indigo-400">Solo Founders & Creators</span>
                <h2 className="text-2xl font-black text-white">Starter</h2>
                <p className="text-xs text-slate-400">Consistent video publishing with reliable viral copywriting frameworks.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{starterPrice}</span>
                <span className="text-xs text-slate-400">
                  / month {billingCycle === 'yearly' && '(billed annually)'}
                </span>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <div className="space-y-3">
                <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider font-semibold">Included features:</span>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>50 projects / month</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Basic viral pitch templates</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>10 to 20 hooks ranked top 3</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>30s/60s/90s teleprompter script builder</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Interactive browser teleprompter with cues</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Standard export formats</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Solo founder license</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setSelectedPlanForEmbed(selectedPlanForEmbed === 'Starter' ? null : 'Starter')}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                  selectedPlanForEmbed === 'Starter'
                    ? 'bg-slate-800 text-slate-200 border border-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                }`}
                id="btn_pricing_starter"
              >
                <CreditCard className="w-4 h-4" />
                <span>{selectedPlanForEmbed === 'Starter' ? "Close Whop Checkout" : "Start Starter"}</span>
              </button>
            </div>
          </div>

          {/* PLAN 3: Pro ($49/mo or $39/mo) */}
          <div className={`bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-2 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl transition duration-200 ${
            selectedPlanForEmbed === 'Pro' 
              ? 'border-indigo-400 ring-2 ring-indigo-400/50' 
              : 'border-indigo-500/80 hover:border-indigo-400'
          }`}>
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-mono uppercase text-[10px] font-bold px-3 py-1 rounded-full shadow-md tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              Most Popular
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold text-indigo-400">Small Teams & Agencies</span>
                <h2 className="text-2xl font-black text-white">Pro</h2>
                <p className="text-xs text-slate-400">High-volume production, collaborative team seats, extra aspect ratios, and priority support.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{proPrice}</span>
                <span className="text-xs text-slate-400">
                  / month {billingCycle === 'yearly' && '(billed annually)'}
                </span>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <div className="space-y-3">
                <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider font-semibold">Everything in Starter, plus:</span>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>250 projects / month</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Team seats and shared workspaces</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Extra formats: 9:16 vertical, 1:1 square, 16:9 widescreen 4K</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Automated pitch deck-to-video parser</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Full 5-channel marketing launch kit</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Priority 24/7 support with fast processing</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setSelectedPlanForEmbed(selectedPlanForEmbed === 'Pro' ? null : 'Pro')}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                  selectedPlanForEmbed === 'Pro'
                    ? 'bg-slate-800 text-slate-200 border border-slate-700'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30'
                }`}
                id="btn_pricing_pro"
              >
                <Sparkles className="w-4 h-4" />
                <span>{selectedPlanForEmbed === 'Pro' ? "Close Whop Checkout" : "Start Pro"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* EMBEDDED WHOP CHECKOUT SECTION */}
        {selectedPlanForEmbed && (
          <div className="mt-12 bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300" id="whop-checkout-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Complete Subscription: {selectedPlanForEmbed} Plan ({billingCycle})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Embedded Whop Checkout &bull; Plan ID: <code className="font-mono text-indigo-300">{currentEmbedPlanId}</code>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlanForEmbed(null)}
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
                  <h4 className="text-2xl font-bold text-white">Subscription Active!</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Your Whop payment has been verified. Receipt ID: <span className="font-mono text-indigo-400">{checkoutCompleteReceipt}</span>
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
                  planId={currentEmbedPlanId}
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
                    console.log("[Whop Checkout Successful]:", { plan_id, receipt_id, result });
                    setCheckoutCompleteReceipt(receipt_id || `rec_${Date.now()}`);
                  }}
                  fallback={
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-400">Connecting to Whop Secure Checkout for plan: {currentEmbedPlanId}...</p>
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
            <h4 className="text-sm font-bold text-white">Whop Buyer Protection</h4>
            <p className="text-xs text-slate-400">Enterprise SSL encryption and PCI DSS compliant payment handling.</p>
          </div>
          <div className="space-y-2 p-4 bg-slate-900/40 rounded-xl border border-slate-850">
            <Zap className="w-6 h-6 text-indigo-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Instant Software Access</h4>
            <p className="text-xs text-slate-400">Account entitlement and generation credits are activated automatically via webhooks.</p>
          </div>
          <div className="space-y-2 p-4 bg-slate-900/40 rounded-xl border border-slate-850">
            <Lock className="w-6 h-6 text-purple-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Cancel in 1-Click</h4>
            <p className="text-xs text-slate-400">Zero phone calls or emails required. Cancel immediately in your Whop Customer Hub.</p>
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
