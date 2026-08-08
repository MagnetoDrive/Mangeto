import React, { useState } from "react";
import { X, Mail, Phone, Linkedin, Clipboard, Check, ExternalLink } from "lucide-react";

interface HireDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HireDeveloperModal({ isOpen, onClose }: HireDeveloperModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const email = "tsepomothibeditimothymotsatse@gmail.com";
  const whatsapp = "+27 61 448 2092";

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in" id="hire_developer_modal_overlay">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl overflow-hidden"
        id="hire_developer_modal_content"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-450 hover:text-slate-200 transition p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
          aria-label="Close modal"
          id="btn_close_hire_modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-6 mb-6">
          <p className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
            Professional Signature – Architect of Intelligence
          </p>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight leading-snug">
            Tsepo Motsatse
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Seasoned Vibe Developer & Founder
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800 w-full mb-6" />

        {/* Body Copy */}
        <div className="space-y-4 mb-8 text-slate-300 text-xs leading-relaxed">
          <p>
            I don't just build apps; I engineer precision instruments. As the architect behind Magneto, ShiftSense AI and DeepResearch AI, I specialize in bridging the gap between raw market data and actionable consumer intelligence using Gemini 1.5 Pro orchestration.
          </p>
          <p>
            My mission is to eliminate information asymmetry through high-performance, objective digital consultants.
          </p>
        </div>

        {/* Contact Block */}
        <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-3.5">
          <h3 className="text-[10px] font-mono tracking-wider text-slate-450 uppercase font-bold">
            Connect & Collaborate
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
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-xl tracking-wide transition cursor-pointer"
            id="btn_hire_done"
          >
            Let's build something elite
          </button>
        </div>
      </div>
    </div>
  );
}
