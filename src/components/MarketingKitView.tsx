import { Copy, Check, Mail, Linkedin, Twitter, Layout, List, Youtube } from "lucide-react";
import { useState } from "react";
import { MarketingKit } from "../types";

interface MarketingKitViewProps {
  marketing?: MarketingKit;
  isLoading: boolean;
}

export default function MarketingKitView({ marketing, isLoading }: MarketingKitViewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-mono animate-pulse">Drafting multi-platform copywriting assets...</p>
      </div>
    );
  }

  if (!marketing) {
    return (
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
        <Mail className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-sm text-slate-400 font-medium">No distribution assets built.</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select or generate a hook from the "Magnetic Hooks" tab to unlock your teleprompter script and visual layouts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid distribution kit */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        
        {/* LinkedIn Segment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-sky-400" /> LinkedIn Outreach Post
            </h4>
            <button
              onClick={() => copyToClipboard(marketing.linkedin, "linkedin")}
              className="p-1.5 bg-slate-800 hover:bg-slate-705 text-slate-400 hover:text-slate-100 rounded border border-slate-700 transition cursor-pointer"
              title="Copy LinkedIn Post"
            >
              {copiedSection === "linkedin" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-950">
            <textarea
              readOnly
              className="w-full h-44 bg-transparent text-xs text-slate-300 font-mono resize-none focus:outline-none leading-relaxed"
              value={marketing.linkedin}
            />
          </div>
        </div>

        {/* Cold Email Outreach Segment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" /> High-Converting Cold Email
            </h4>
            <button
              onClick={() => copyToClipboard(marketing.coldEmail, "email")}
              className="p-1.5 bg-slate-800 hover:bg-slate-705 text-slate-400 hover:text-slate-100 rounded border border-slate-700 transition cursor-pointer"
              title="Copy Email Copy"
            >
              {copiedSection === "email" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-950">
            <textarea
              readOnly
              className="w-full h-44 bg-transparent text-xs text-slate-300 font-mono resize-none focus:outline-none leading-relaxed"
              value={marketing.coldEmail}
            />
          </div>
        </div>

        {/* X/Twitter Thread Segment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
              <Twitter className="w-4 h-4 text-sky-400" /> Viral Thread (X Card)
            </h4>
            <button
              onClick={() => copyToClipboard(marketing.twitterThread.join("\n\n---\n\n"), "twitter")}
              className="p-1.5 bg-slate-800 hover:bg-slate-705 text-slate-400 hover:text-slate-100 rounded border border-slate-700 transition cursor-pointer"
              title="Copy entire X Thread"
            >
              {copiedSection === "twitter" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-950 overflow-y-auto max-h-44 space-y-3 divide-y divide-slate-850">
            {marketing.twitterThread.map((tweet, i) => (
              <div key={i} className={`pt-2.5 ${i === 0 ? "pt-0" : ""}`}>
                <div className="text-[9px] font-mono font-bold text-slate-500 mb-1">TWEET {i + 1}</div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{tweet}</p>
              </div>
            ))}
          </div>
        </div>

        {/* YouTube Description Segment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
              <Youtube className="w-4 h-4 text-rose-500" /> SEO YouTube Description
            </h4>
            <button
              onClick={() => copyToClipboard(marketing.youtubeDescription, "youtube")}
              className="p-1.5 bg-slate-800 hover:bg-slate-705 text-slate-400 hover:text-slate-100 rounded border border-slate-700 transition cursor-pointer"
              title="Copy YouTube copy"
            >
              {copiedSection === "youtube" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-950">
            <textarea
              readOnly
              className="w-full h-44 bg-transparent text-xs text-slate-300 font-mono resize-none focus:outline-none leading-relaxed"
              value={marketing.youtubeDescription}
            />
          </div>
        </div>
      </div>

      {/* Landing Page Hero Segment */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase flex items-center gap-2">
            <Layout className="w-4 h-4 text-emerald-400" /> Landing Page Hero Framework
          </h4>
          <button
            onClick={() => {
              const fullHero = `Heading: ${marketing.landingPageHero.heading}\nSubheading: ${marketing.landingPageHero.subheading}\nCTA Button: ${marketing.landingPageHero.cta}`;
              copyToClipboard(fullHero, "hero");
            }}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-slate-100 text-[10px] font-mono rounded border border-slate-700 transition flex items-center gap-1.5 cursor-pointer min-h-[38px] sm:min-h-0"
            title="Copy Hero Section Copy"
          >
            {copiedSection === "hero" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copy Cards</span>
          </button>
        </div>

        <div className="bg-slate-950 p-6 md:p-10 rounded-xl border border-slate-950 text-center max-w-3xl mx-auto space-y-4 relative">
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded font-mono text-[9px] font-bold select-none">
            LANDING PAGE SECTION
          </div>
          
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight leading-tight pt-3">
            {marketing.landingPageHero.heading}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            {marketing.landingPageHero.subheading}
          </p>
          <div className="pt-2">
            <button className="px-5 py-2.5 bg-indigo-650 text-slate-100 text-xs font-bold rounded-lg shadow-lg border border-indigo-500 hover:bg-indigo-600 transition cursor-pointer select-none">
              {marketing.landingPageHero.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
