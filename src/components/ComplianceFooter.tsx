import React from "react";
import { ShieldCheck, Mail, RotateCcw, FileText, CheckCircle2, Zap } from "lucide-react";

interface ComplianceFooterProps {
  onNavigateTo: (page: 'main' | 'admin' | 'privacy' | 'terms' | 'pricing' | 'refund') => void;
  enableAdmin?: boolean;
}

export default function ComplianceFooter({ onNavigateTo, enableAdmin = true }: ComplianceFooterProps) {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-10 mt-16 shrink-0 z-40 relative text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        
        {/* Top summary row: SaaS status & refund guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-900 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>100% Automated Self-Service SaaS</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Magneto is a cloud-based software subscription platform delivering instant digital entitlement, automated AI scripts, and teleprompter workflows with zero manual fulfillment delay.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Refund & Cancellation Policy</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Cancel anytime directly in your customer dashboard. Full refunds available within 14 days of purchase if monthly generation credits are unused.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>Customer & Billing Support</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Direct email support for technical, billing, or account inquiries:{" "}
              <a
                href="mailto:tsepomotsatse@gmail.com"
                className="text-indigo-400 hover:text-indigo-300 font-mono font-semibold underline block pt-0.5"
              >
                tsepomotsatse@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Bottom row: Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 Magneto SaaS. Automated AI Pitch Deck to Video Generator. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <button
              onClick={() => onNavigateTo('terms')}
              className="hover:text-indigo-400 font-medium transition cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigateTo('privacy')}
              className="hover:text-indigo-400 font-medium transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigateTo('refund')}
              className="hover:text-emerald-400 font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span>Refund & Cancellation</span>
            </button>
            <button
              onClick={() => onNavigateTo('pricing')}
              className="hover:text-indigo-400 font-medium transition cursor-pointer"
            >
              Pricing & Plans
            </button>
            {enableAdmin && (
              <button
                onClick={() => onNavigateTo('admin')}
                className="hover:text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider transition cursor-pointer border border-slate-850 px-2 py-0.5 rounded bg-slate-900"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
