import React, { useState } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { X, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";

interface WhopCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  planPrice: string;
  currentUser?: {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null;
  onSuccess?: (planId: string, receiptId?: string) => void;
}

export default function WhopCheckoutModal({
  isOpen,
  onClose,
  planId,
  planName,
  planPrice,
  currentUser,
  onSuccess
}: WhopCheckoutModalProps) {
  const [completedReceipt, setCompletedReceipt] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPlaceholderPlan = planId === "plan_Starter_ID" || planId === "plan_Pro_ID" || planId.includes("Starter_ID") || planId.includes("Pro_ID");

  const handleComplete = (completedPlanId: string, receiptId: string | undefined, result: any) => {
    console.log("[Whop Checkout Completed]:", { completedPlanId, receiptId, result });
    const receipt = receiptId || `rec_${Date.now()}`;
    setCompletedReceipt(receipt);
    if (onSuccess) {
      onSuccess(completedPlanId, receipt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        id="whop_embedded_checkout_modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Subscribe to {planName}</span>
                <span className="text-xs font-mono text-indigo-300 font-semibold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                  {planPrice}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Whop Embedded Checkout &bull; Instant Software Access</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {completedReceipt ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-white">Payment Successful!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your Whop subscription for <strong className="text-slate-200">{planName}</strong> has been activated. Receipt: <span className="font-mono text-indigo-400">{completedReceipt}</span>
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Continue to App
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* If using placeholder plan ID, show helpful notice to developer/user */}
              {isPlaceholderPlan && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 space-y-2 text-xs text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Using Whop Placeholder Plan ID: &ldquo;{planId}&rdquo;</span>
                  </div>
                  <p className="text-amber-200/80 leading-relaxed text-[11px]">
                    To connect live billing, create your product and pricing plans in your{" "}
                    <a
                      href="https://whop.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold text-amber-100 hover:text-white inline-flex items-center gap-1"
                    >
                      Whop Dashboard <ExternalLink className="w-3 h-3" />
                    </a>{" "}
                    and replace <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">VITE_WHOP_PLAN_{planName.toUpperCase()}_ID</code> with your real Whop Plan ID (e.g., <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">plan_XXXXXXXXX</code>).
                  </p>
                </div>
              )}

              {embedError && (
                <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{embedError}</span>
                </div>
              )}

              {/* Embedded Whop Checkout component */}
              <div className="min-h-[420px] w-full rounded-xl bg-slate-950/60 border border-slate-800/80 p-2 overflow-hidden">
                <WhopCheckoutEmbed
                  planId={planId}
                  theme="dark"
                  prefill={{
                    email: currentUser?.email || undefined
                  }}
                  themeOptions={{
                    accentColor: "indigo",
                    backgroundColor: "#020617",
                    borderRadius: 12
                  }}
                  onComplete={handleComplete}
                  onPaymentError={(err) => {
                    console.error("[Whop Checkout Payment Error]:", err);
                    setEmbedError(err?.message || "Payment authorization failed. Please try again.");
                  }}
                  fallback={
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-400 font-medium">Loading Whop Checkout...</p>
                    </div>
                  }
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 256-bit SSL encrypted via Whop Payments</span>
          </div>
          <span>Cancel anytime in 1-click</span>
        </div>
      </div>
    </div>
  );
}
