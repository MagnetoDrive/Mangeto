import React from "react";
import { Shield, ArrowLeft, Mail, Scale, Lock } from "lucide-react";

interface PrivacyProps {
  onBack: () => void;
}

export default function PrivacyPage({ onBack }: PrivacyProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased pb-24" id="privacy_page_container">
      {/* Small Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-400 transition cursor-pointer"
            id="btn_privacy_back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to App</span>
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Privacy Center</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 flex-grow">
        {/* Document Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last updated: June 24, 2026
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-2xl flex items-start gap-3.5">
          <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-indigo-300">
            <span className="font-extrabold block uppercase tracking-wider text-[10px] font-mono">Our Privacy Commitment</span>
            <p className="leading-relaxed">
              We respect your data and process it under strict compliance models. We do not sell, rent, or trade your personal data. All core storage, generation parameters, and authentication states are fully isolated and secured under Google Firebase architecture.
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">01.</span>
              Data Controller
            </h2>
            <p>
              The data controller responsible for processing your personal information is:
            </p>
            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl text-xs space-y-1">
              <p className="font-extrabold text-slate-200">Tsepo Motsatse</p>
              <p className="text-slate-450">Johannesburg, South Africa</p>
              <p className="text-slate-400 flex items-center gap-1.5 mt-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <a href="mailto:tsepomotsatse@gmail.com" className="hover:underline hover:text-indigo-400">tsepomotsatse@gmail.com</a>
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">02.</span>
              Merchant of Record (MoR)
            </h2>
            <p>
              All online transactions, payments, global VAT, sales tax management, and subscription cancellations on Magneto are handled and processed securely by <strong>Dodo Payments</strong> as our exclusive Merchant of Record.
            </p>
            <p>
              Dodo Payments is the legal seller of Magneto services and processes billing parameters under its own privacy frameworks. No full payment card data is processed, seen, or stored on our servers.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">03.</span>
              Data Collected & Purpose
            </h2>
            <p>
              We collect the minimum amount of data required to deliver reliable AI generation services:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>
                <strong>Authentication Identifier:</strong> Anonymous and authenticated unique user identifiers (UID) from Firebase to store, reload, and sync your campaigns.
              </li>
              <li>
                <strong>Email Address:</strong> Used solely to link accounts, provide alerts, sync cloud-level data, or resolve customer success queries.
              </li>
              <li>
                <strong>Project Content:</strong> Campaign details (concept, target audience, hooks, storyboard scenes, teleprompter scripts) designed to build and organize your social media hooks.
              </li>
              <li>
                <strong>Usage Analytics:</strong> Basic metadata logs to measure app performance, processing speed, and optimize generation prompts.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">04.</span>
              Storage, Databases & Infrastructure
            </h2>
            <p>
              We utilize <strong>Google Firebase (Firestore)</strong> for highly available database persistence and user credentials protection. Firestore maintains fully encrypted, scalable vaults to prevent third-party exposure of your active marketing assets.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">05.</span>
              GDPR & POPIA Compliance
            </h2>
            <p>
              Depending on your location, you have the following data rights under frameworks such as the General Data Protection Regulation (<strong>GDPR</strong>) and the Protection of Personal Information Act (<strong>POPIA</strong>, South Africa):
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Right of Access:</strong> Review all personal metrics and campaigns saved in your profile.</li>
              <li><strong>Right to Rectification:</strong> Edit or correct any user settings or contact details.</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request full deletion of your profile, feedback reports, and pitch data at any time.</li>
            </ul>
            <p>
              To exercise these rights, submit your written request directly to <a href="mailto:tsepomotsatse@gmail.com" className="text-indigo-400 underline font-semibold">tsepomotsatse@gmail.com</a>.
            </p>
          </section>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="pt-8 border-t border-slate-850 flex items-center gap-3">
          <Scale className="w-5 h-5 text-slate-500 shrink-0" />
          <p className="text-[11px] text-slate-550 leading-normal">
            Your use of Magneto indicates consent to our continuous data storage practices. If you disagree with any segment, please terminate use of the app and delete your cached projects in Saved Projects.
          </p>
        </div>
      </div>
    </div>
  );
}
