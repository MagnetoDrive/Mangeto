import React from "react";
import { ArrowLeft, RotateCcw, ShieldCheck, Mail, CheckCircle2, Clock, HelpCircle, FileText } from "lucide-react";

interface RefundPageProps {
  onBack: () => void;
  onNavigateTo?: (page: 'main' | 'terms' | 'privacy' | 'pricing') => void;
}

export default function RefundPage({ onBack, onNavigateTo }: RefundPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased pb-20" id="refund_page_container">
      {/* Top Navigation Banner */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-400 transition cursor-pointer"
            id="btn_refund_back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Refund & Cancellation Policy
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 flex-grow">
        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-mono uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Self-Service Software Guarantee</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last updated: September 10, 2026 • Effective immediately
          </p>
        </div>

        {/* Highlight Summary Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-2xl space-y-3 text-xs leading-relaxed text-emerald-200 shadow-xl">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Summary of Our Customer Protection Guarantee</span>
          </div>
          <p className="text-slate-300">
            Magneto is a 100% automated software-as-a-service (SaaS) application providing instant digital entitlement upon purchase. You have total control over your software subscription:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-200 font-medium">
            <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Cancel Anytime:</strong> 1-click self-service cancellation in your customer dashboard.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>14-Day Refund Window:</strong> Full refunds available within 14 days if generation credits are unused.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Instant Digital Access:</strong> Zero manual fulfillment or physical shipping delays.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Dedicated Support:</strong> Contact us anytime at <span className="text-emerald-400">tsepomotsatse@gmail.com</span>.</span>
            </li>
          </ul>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400">01.</span>
              14-Day Refund Eligibility
            </h2>
            <p>
              We want you to evaluate Magneto with complete confidence. We offer a <strong>14-day money-back guarantee</strong> for all initial software subscription purchases under the following straightforward condition:
            </p>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-slate-200">
                • Full Refund Condition:
              </p>
              <p className="text-slate-400">
                You are entitled to a 100% full refund within 14 calendar days of your initial payment if your monthly AI generation credits have not been consumed.
              </p>
              <p className="text-slate-400">
                Because AI generation models consume non-recoverable cloud compute and GPU processing power upon execution, requests where substantial generation credits have been utilized are evaluated on a pro-rata basis or credited towards future billing periods.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400">02.</span>
              Cancellation Policy & Immediate Self-Service
            </h2>
            <p>
              You can cancel your software subscription at any time with zero hassle or penalty:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400">
              <li>
                <strong>Self-Service Cancellation:</strong> Click your account or billing link in the app to access the secure Dodo Payments customer billing portal, where you can cancel recurring payments with 1 click.
              </li>
              <li>
                <strong>Access Retention:</strong> When you cancel an active subscription, your account remains active and retains all plan benefits until the end of your current paid billing cycle. You will never be charged again.
              </li>
              <li>
                <strong>No Long-Term Contracts:</strong> All monthly subscriptions operate on a month-to-month basis with no lock-in periods.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400">03.</span>
              Instant Digital Delivery (No Physical Goods)
            </h2>
            <p>
              Magneto is 100% automated software. Upon successful payment verification via our Merchant of Record (Dodo Payments), your digital software license and monthly generation credits are provisioned to your account immediately.
            </p>
            <p className="text-xs text-slate-400">
              Because all fulfillment is electronic and instantaneous, there are no shipping charges, physical handling delays, or manual intervention needed to start using the software.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400">04.</span>
              How to Request a Refund or Billing Assistance
            </h2>
            <p>
              To request a refund or ask any questions regarding your billing status, please email our support team directly:
            </p>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Mail className="w-4 h-4" />
                <span>Support Email:</span>
              </div>
              <a 
                href="mailto:tsepomotsatse@gmail.com?subject=Magneto%20Refund%20Request" 
                className="text-slate-100 hover:text-indigo-400 font-mono text-sm underline font-bold transition block"
              >
                tsepomotsatse@gmail.com
              </a>
              <p className="text-xs text-slate-400 pt-1">
                Please include your registered email address and transaction reference ID. All refund requests are reviewed and processed within 24–48 business hours.
              </p>
            </div>
          </section>
        </div>

        {/* Bottom Navigation links */}
        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <button 
            onClick={onBack}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Magneto Workspace
          </button>
          <div className="flex items-center gap-4">
            {onNavigateTo && (
              <>
                <button onClick={() => onNavigateTo('terms')} className="hover:text-slate-200 cursor-pointer">Terms of Service</button>
                <button onClick={() => onNavigateTo('privacy')} className="hover:text-slate-200 cursor-pointer">Privacy Policy</button>
                <button onClick={() => onNavigateTo('pricing')} className="hover:text-slate-200 cursor-pointer">Pricing Plans</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
