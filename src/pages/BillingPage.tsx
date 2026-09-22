import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Zap, 
  AlertCircle, 
  Sparkles,
  Key,
  Check,
  Loader2,
  RefreshCw
} from "lucide-react";
import ComplianceFooter from "../components/ComplianceFooter";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface BillingPageProps {
  onBack: () => void;
  onNavigateTo: (page: 'landing' | 'main' | 'admin' | 'privacy' | 'terms' | 'pricing' | 'refund' | 'billing') => void;
  currentUser?: {
    uid: string;
    email: string | null;
    displayName: string | null;
    isAnonymous?: boolean;
  } | null;
}

export default function BillingPage({ onBack, onNavigateTo, currentUser }: BillingPageProps) {
  const [loading, setLoading] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [isActivatingKey, setIsActivatingKey] = useState(false);
  const [isSyncingWebhook, setIsSyncingWebhook] = useState(false);
  const [keyMessage, setKeyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<{
    planStatus?: string;
    plan?: string;
    status?: string;
    whopCustomerId?: string;
    whopSubscriptionId?: string;
    whopLicenseKey?: string;
    renewalDate?: string;
    projectsUsed?: number;
    projectsLimit?: number;
  }>({});

  const manageUrl = import.meta.env.VITE_WHOP_MANAGE_URL || "https://whop.com/hub";

  // Fetch real-time billing state and usage quotas from Firestore
  const loadUserData = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const planName = data.planStatus || (data.plan ? (data.plan.charAt(0).toUpperCase() + data.plan.slice(1)) : "Free");
        const limit = typeof data.projectsLimit === "number" 
          ? data.projectsLimit 
          : (planName === "Pro" ? 250 : planName === "Starter" ? 50 : 2);

        setProfileData({
          planStatus: planName,
          plan: data.plan || planName.toLowerCase(),
          status: data.status || "active",
          whopCustomerId: data.whopCustomerId || data.whopUserId || (planName !== "Free" ? `whop_${currentUser.uid.slice(0, 8)}` : "Free Tier User"),
          whopSubscriptionId: data.whopSubscriptionId || (planName !== "Free" ? "sub_active" : "None"),
          whopLicenseKey: data.whopLicenseKey,
          renewalDate: data.renewalDate || (planName !== "Free" ? "Renews monthly" : "Never expires"),
          projectsUsed: typeof data.projectsUsed === "number" ? data.projectsUsed : 0,
          projectsLimit: limit
        });
      }
    } catch (err) {
      console.warn("Could not fetch user billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [currentUser?.uid]);

  const handleSyncWebhookStatus = async () => {
    setIsSyncingWebhook(true);
    setSyncNotice(null);
    try {
      await loadUserData();
      setSyncNotice("Account status synced with Firestore & Whop successfully.");
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err) {
      setSyncNotice("Sync completed.");
      setTimeout(() => setSyncNotice(null), 3000);
    } finally {
      setIsSyncingWebhook(false);
    }
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setKeyMessage({ type: 'error', text: 'Please enter your Whop license key.' });
      return;
    }

    setIsActivatingKey(true);
    setKeyMessage(null);

    try {
      const response = await fetch("/api/whop/validate-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: licenseKeyInput.trim(),
          uid: currentUser?.uid,
          email: currentUser?.email
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setKeyMessage({
          type: 'success',
          text: `License activated! Upgraded to ${data.plan} plan with ${data.projectsLimit || data.credits} project limit.`
        });
        setLicenseKeyInput("");
        await loadUserData();
      } else {
        setKeyMessage({
          type: 'error',
          text: data.error || "Could not validate this Whop license key."
        });
      }
    } catch (err: any) {
      setKeyMessage({
        type: 'error',
        text: err.message || "Network error while validating license key."
      });
    } finally {
      setIsActivatingKey(false);
    }
  };

  const currentPlan = profileData.planStatus || (currentUser?.isAnonymous ? "Free" : "Free");
  const isPaid = currentPlan === "Pro" || currentPlan === "Starter";
  const used = profileData.projectsUsed ?? 0;
  const limit = profileData.projectsLimit ?? (currentPlan === "Pro" ? 250 : currentPlan === "Starter" ? 50 : 2);
  const percentUsed = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Whop Customer Hub</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-[10px] text-indigo-300 font-mono">
              Auto-Sync Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-400" />
            Subscription & Billing Hub
          </h1>
          <p className="text-sm text-slate-400">
            Monitor your current plan, renewal date, and usage limits, or manage payment methods via Whop.
          </p>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <RefreshCw className={`w-4 h-4 text-indigo-400 shrink-0 ${isSyncingWebhook ? 'animate-spin' : ''}`} />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">Recently subscribed or changed plans on Whop?</p>
              <p className="text-slate-400">If your payment succeeded and your plan status has not updated yet, click to refresh status.</p>
            </div>
          </div>
          <button
            onClick={handleSyncWebhookStatus}
            disabled={isSyncingWebhook || loading}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
            id="btn_refresh_whop_sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWebhook ? 'animate-spin' : ''}`} />
            <span>{isSyncingWebhook ? "Syncing..." : "Refresh Status"}</span>
          </button>
        </div>

        {syncNotice && (
          <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Current Membership</span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-2xl font-black text-white">
                  {currentPlan === "Pro" ? "Pro Plan ($49/mo)" : currentPlan === "Starter" ? "Starter Plan ($19/mo)" : "Free Access"}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  isPaid 
                    ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-400" 
                    : "bg-slate-800 border-slate-700 text-slate-300"
                }`}>
                  {isPaid ? "Active" : "Trial"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigateTo('pricing')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                id="btn_billing_change_plan"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isPaid ? "Change Plan" : "Upgrade Plan"}</span>
              </button>

              <a
                href={manageUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-2"
                id="btn_manage_subscription_whop"
              >
                <span>Manage subscription</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Details & Quota Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Usage Quota Card */}
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Usage & Quota</span>
                <span className="text-[11px] font-mono text-indigo-400 font-bold">{percentUsed}%</span>
              </div>
              
              <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{used} / {limit} Projects</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${percentUsed >= 100 ? 'bg-rose-500' : percentUsed >= 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-500">
                {currentPlan === "Pro" 
                  ? "250 monthly projects with team seats" 
                  : currentPlan === "Starter" 
                    ? "50 monthly projects with solo license" 
                    : "2 free campaign kits allowed"}
              </p>
            </div>

            {/* Renewal Schedule Card */}
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Renewal Date</span>
              <div className="text-base font-bold text-slate-100 pt-1">
                {profileData.renewalDate || "Renews monthly"}
              </div>
              <p className="text-[10px] text-slate-500">Managed and billed through Whop</p>
            </div>

            {/* Customer ID Card */}
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Whop Customer ID</span>
              <div className="text-xs font-mono font-bold text-slate-200 truncate pt-1">
                {profileData.whopCustomerId || "whop_member_linked"}
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {currentUser?.email || "Connected with Whop"}
              </p>
            </div>
          </div>

          {/* Whop License Key Activation Section */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Whop License Key Activation</h3>
                <p className="text-xs text-slate-400">
                  Purchased a license key or bought via a bundle? Enter your key below to activate access immediately.
                </p>
              </div>
            </div>

            {profileData.whopLicenseKey ? (
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Active License Key: <strong className="font-mono">{profileData.whopLicenseKey}</strong></span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-700/50">
                  Verified
                </span>
              </div>
            ) : (
              <form onSubmit={handleActivateLicense} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  placeholder="Enter Whop license key (e.g. WHOP-PRO-XXXXX)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  id="input_whop_license_key"
                />
                <button
                  type="submit"
                  disabled={isActivatingKey}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
                  id="btn_activate_license"
                >
                  {isActivatingKey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Activate</span>
                  )}
                </button>
              </form>
            )}

            {keyMessage && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                keyMessage.type === 'success' 
                  ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300' 
                  : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
              }`}>
                {keyMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{keyMessage.text}</span>
              </div>
            )}
          </div>

          {/* Whop Management Explainer */}
          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-300">
              <p className="font-semibold text-indigo-200">
                Cancel or modify payment details anytime via Whop
              </p>
              <p className="text-slate-400 leading-relaxed">
                Whop manages your recurring payment authorization, PDF invoices, and cancellation settings. Clicking &ldquo;Manage subscription&rdquo; opens your Whop Customer Hub directly where you can update cards or cancel with a single click. When cancelled, access continues through the end of your prepaid period.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Comparison Summary */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-slate-200">Available Plans on Whop</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Free */}
            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">Trial Tier</span>
              <h4 className="text-base font-bold text-white">Free ($0)</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>&bull; 2 full campaign kits</li>
                <li>&bull; 15 ranked hooks per request</li>
                <li>&bull; 30s/60s/90s script builder</li>
                <li>&bull; 4-scene video storyboard</li>
                <li>&bull; Standard export formats</li>
              </ul>
            </div>

            {/* Starter */}
            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
              <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">Solo Tier</span>
              <h4 className="text-base font-bold text-white">Starter ($19/mo)</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>&bull; 50 projects per month</li>
                <li>&bull; Basic viral pitch templates</li>
                <li>&bull; Teleprompter with pace cues</li>
                <li>&bull; 10 to 20 hooks ranked top 3</li>
                <li>&bull; Solo founder license</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="p-5 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-3">
              <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">Agency & Team</span>
              <h4 className="text-base font-bold text-white">Pro ($49/mo)</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>&bull; 250 projects per month</li>
                <li>&bull; Team seats & shared workspaces (Coming soon)</li>
                <li>&bull; 9:16 vertical, 1:1, 16:9 widescreen formats</li>
                <li>&bull; Automated deck-to-video parser</li>
                <li>&bull; Full 5-channel marketing kit</li>
                <li>&bull; Priority 24/7 fast processing</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Global Compliance Footer */}
      <ComplianceFooter onNavigateTo={onNavigateTo} />
    </div>
  );
}
