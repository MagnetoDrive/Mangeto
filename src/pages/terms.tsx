import React from "react";
import { BookOpen, ArrowLeft, Scale, Mail, Info, FileText } from "lucide-react";

interface TermsProps {
  onBack: () => void;
}

export default function TermsPage({ onBack }: TermsProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased pb-24" id="terms_page_container">
      {/* Small Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-400 transition cursor-pointer"
            id="btn_terms_back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">User Agreement</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 flex-grow">
        {/* Document Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Terms of Service & Agreement
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last updated: June 24, 2026
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-2xl flex items-start gap-3.5">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-indigo-300">
            <span className="font-extrabold block uppercase tracking-wider text-[10px] font-mono">Software Subscription Service</span>
            <p className="leading-relaxed">
              Magneto is a 100% self-service, cloud-based software subscription service (SaaS) providing automated pitch deck analysis, video script synthesis, and browser teleprompter execution. By accessing our software platform, you agree to the terms herein. All features are delivered via instant digital entitlement upon payment.
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">01.</span>
              Automated AI Software Platform
            </h2>
            <p>
              Magneto is an automated software application that leverages artificial intelligence models to formulate video hooks, scripts, storyboards, and distribution items from pitch deck inputs.
            </p>
            <p className="font-semibold text-slate-200">
              The software application and algorithms are provided on an "As-Is" and "As-Available" subscription basis.
            </p>
            <p>
              AI generation models execute algorithmically based on user prompts. Users maintain full control over reviewing, selecting, and editing generated scripts and storyboard scenes prior to export.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">02.</span>
              Software Subscriptions & Instant Digital Entitlement
            </h2>
            <p>
              Magneto subscriptions provide monthly software generation credits and interactive teleprompter access. Subscriptions renew automatically on a recurring monthly or annual basis until canceled.
            </p>
            <p>
              All purchases, billing cycles, sales tax, EU VAT, and payment processing are handled securely by our Merchant of Record – <strong>Dodo Payments</strong>.
            </p>
            <p>
              You can cancel your recurring software subscription at any time with 1 click directly in your customer dashboard or via the Dodo Payments customer portal. Cancellation takes effect at the conclusion of the active paid billing period.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">03.</span>
              Refund & Cancellation Policy
            </h2>
            <p>
              We offer a <strong>14-day refund window</strong> for all software subscription purchases. If you have not utilized your monthly AI generation credits, you are eligible for a 100% full refund within 14 calendar days of payment.
            </p>
            <p>
              To request a refund or cancel your subscription, manage your plan directly in your customer portal or contact our support team at <a href="mailto:tsepomotsatse@gmail.com" className="text-indigo-400 underline font-semibold">tsepomotsatse@gmail.com</a>.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">04.</span>
              Acceptable Use Boundaries
            </h2>
            <p>
              By utilizing our platform, you agree to refrain from:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>Generating fraudulent, malicious, illegal, highly offensive, or hateful content.</li>
              <li>Setting up automated script runners to abuse raw generation servers or bypass core security checks.</li>
              <li>Generating high volumes of mass unsolicited email (spam), false reviews, or misleading consumer campaigns.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">05.</span>
              Intellectual Property Rights
            </h2>
            <p>
              <strong>You own your outputs.</strong> Any hooks, scripts, storyboard arrangements, or distribution copy generated using our platform belong fully to you. Magneto and its developers retain no ownership, licensing, or commercial distribution rights to your produced concepts or campaigns.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">06.</span>
              Limitation of Liability
            </h2>
            <p>
              To the absolute extent permitted by law, Tsepo Motsatse shall not be held liable for any indirect, consequential, special, or incidental damages, including but not limited to lost revenue, marketing failures, or platform interruptions resulting from your usage of AI-generated content.
            </p>
          </section>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="pt-8 border-t border-slate-850 flex items-center gap-3">
          <Scale className="w-5 h-5 text-slate-500 shrink-0" />
          <p className="text-[11px] text-slate-400 leading-normal">
            For operational inquiries or formal issues regarding these software subscription terms, contact <a href="mailto:tsepomotsatse@gmail.com" className="hover:underline text-indigo-400 font-semibold">tsepomotsatse@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
