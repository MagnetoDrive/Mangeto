import React, { useState } from "react";
import { X, Mail, Phone, Linkedin, Clipboard, Check, ExternalLink, Rocket, Clock, ShieldCheck, Zap, CreditCard, ArrowRight, Sparkles } from "lucide-react";

interface HireDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HireDeveloperModal({ isOpen, onClose }: HireDeveloperModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedPayLink, setCopiedPayLink] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [projectBrief, setProjectBrief] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const email = "tsepomothibeditimothymotsatse@gmail.com";
  const whatsapp = "+27 61 448 2092";
  const paymentLink = "https://checkout.lemonsqueezy.com/buy/7-day-dev-sprint-450";

  const copyToClipboard = (text: string, type: "email" | "phone" | "paylink") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else if (type === "phone") {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedPayLink(true);
        setTimeout(() => setCopiedPayLink(false), 2000);
      }
    });
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in overflow-y-auto" id="hire_developer_modal_overlay">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 md:p-8 relative shadow-2xl overflow-hidden my-8 max-h-[90vh] overflow-y-auto no-scrollbar"
        id="hire_developer_modal_content"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer z-10"
          aria-label="Close modal"
          id="btn_close_hire_modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Developer Header Badge */}
        <div className="space-y-1.5 pr-8 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider">
              Lead Architect & Senior Fullstack Developer
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Available for 7-Day Sprint
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight leading-snug">
            Tsepo Motsatse
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Seasoned Vibe Developer & Founder • Architect of Magneto, ShiftSense AI & DeepResearch AI
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800 w-full mb-6" />

        {/* Main Pitch Banner */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 rounded-2xl p-5 mb-6 relative overflow-hidden space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <h3>Need Custom Features or Custom Software? 🚀</h3>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Love using our app but need something uniquely built for your specific business workflow? Skip the expensive agencies and long wait times. Get a dedicated developer to build your next feature, integration, or custom project in record time.
          </p>
        </div>

        {/* The 7-Day Dev Promise Grid */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              The 7-Day Dev Promise
            </h4>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
              Flat-Rate: $450 / Project
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                Flat-Rate Pricing
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Exactly <strong className="text-slate-200">$450 per project</strong>. No hidden hourly fees or surprise charges.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Rapid Delivery
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Fully completed, tested project delivered in <strong className="text-slate-200">7 days or less</strong>.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                Direct Communication
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Work directly with the developer—no account managers or middle layers.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Tailored Solutions
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Custom SaaS integrations, automated workflows, or standalone business tools.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Diagram */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 space-y-3">
          <h4 className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider text-center">
            How It Works
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-center">
            <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg space-y-1">
              <div className="text-indigo-400 text-xs font-bold font-mono">Step 1: Submit Details</div>
              <p className="text-slate-400 text-[11px]">Tell us what to build.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg space-y-1">
              <div className="text-amber-400 text-xs font-bold font-mono">Step 2: 7-Day Sprint</div>
              <p className="text-slate-400 text-[11px]">We build & test fast.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg space-y-1">
              <div className="text-emerald-400 text-xs font-bold font-mono">Step 3: Launch Ready</div>
              <p className="text-slate-400 text-[11px]">Your custom tool is live.</p>
            </div>
          </div>
        </div>

        {/* Ready to build call to action */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 mb-6 text-center space-y-3">
          <p className="text-slate-200 text-xs font-medium leading-relaxed">
            <strong className="text-slate-100 block text-sm mb-1">Ready to build?</strong>
            Stop waiting for generic product updates. Let’s build the exact solution your business needs today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowCheckout(!showCheckout)}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
              id="btn_hire_now_checkout"
            >
              <CreditCard className="w-4 h-4" />
              Hire Your Developer Now ($450 Single Payment)
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(paymentLink, "paylink")}
              className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              title="Copy Paddle / Lemon Squeezy Single-Payment Link"
              id="btn_copy_paddle_link"
            >
              {copiedPayLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
              {copiedPayLink ? "Link Copied!" : "Copy Checkout Link"}
            </button>
          </div>
        </div>

        {/* Checkout Drawer/Modal (Paddle / Lemon Squeezy single payment checkout integration) */}
        {showCheckout && (
          <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 mb-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">7-Day Dev Sprint Checkout (Paddle / Lemon Squeezy)</h4>
                  <p className="text-[10px] text-slate-400">Single Upfront Payment • $450 USD Flat Rate</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                $450.00 USD
              </span>
            </div>

            {paymentSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl space-y-2 text-center">
                <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="font-bold text-sm text-slate-100">Slot Secured & Payment Confirmed!</h5>
                <p className="text-xs text-slate-300">
                  Thank you! Developer Tsepo Motsatse has received your brief and will contact you directly via email within 2 hours to kick off your 7-day sprint.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setPaymentSuccess(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Your Business Email</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Brief Feature / App Requirements (Step 1)</label>
                  <textarea
                    rows={3}
                    required
                    value={projectBrief}
                    onChange={(e) => setProjectBrief(e.target.value)}
                    placeholder="Describe what custom feature, integration, or SaaS tool you need built..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Payment Gateway:</span>
                    <span className="font-mono font-bold text-indigo-400">Lemon Squeezy / Paddle Hosted Checkout</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Checkout Link:</span>
                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                    >
                      Open Link Directly <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  {isProcessing ? (
                    <span>Securing 7-Day Slot...</span>
                  ) : (
                    <>
                      <LockIcon className="w-3.5 h-3.5" />
                      Pay $450 Upfront & Lock In 7-Day Slot
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Contact Block (Preserved Intact) */}
        <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-3.5 mb-6">
          <h3 className="text-[10px] font-mono tracking-wider text-slate-450 uppercase font-bold">
            Connect & Collaborate Directly
          </h3>

          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center justify-between text-xs group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-slate-450 block text-[10px] font-mono uppercase">Email Address</span>
                  <span className="text-slate-250 font-medium truncate block">{email}</span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(email, "email")}
                className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-450 hover:text-slate-200 transition cursor-pointer shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Copy email to clipboard"
                id="btn_copy_email"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-between text-xs group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-slate-450 block text-[10px] font-mono uppercase">WhatsApp</span>
                  <span className="text-slate-250 font-medium truncate block">{whatsapp}</span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(whatsapp, "phone")}
                className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-450 hover:text-slate-200 transition cursor-pointer shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Copy WhatsApp contact"
                id="btn_copy_phone"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center justify-between text-xs group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                  <Linkedin className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-slate-450 block text-[10px] font-mono uppercase">LinkedIn</span>
                  <span className="text-slate-250 font-medium truncate block">tsepo-motsatse</span>
                </div>
              </div>
              <a
                href="https://www.linkedin.com/in/tsepo-motsatse"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-450 hover:text-slate-200 transition shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Open LinkedIn Profile"
                id="btn_open_linkedin"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Call to action footer */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Powered by Lemon Squeezy / Paddle single payment checkout
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-xl tracking-wide transition cursor-pointer"
            id="btn_hire_done"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

