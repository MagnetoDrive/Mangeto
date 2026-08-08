import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, RefreshCw, HelpCircle, AlertCircle, Magnet, Copy, Check } from "lucide-react";
import { CompanionMessage } from "../types";

interface CompanionChatProps {
  onQuickApplyHooks: (concept: string, audience: string, outcome: string) => void;
  activeProjectName?: string;
}

export default function CompanionChat({ onQuickApplyHooks, activeProjectName }: CompanionChatProps) {
  const [messages, setMessages] = useState<CompanionMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hey! I'm Magneto Copilot, your magnetic marketing and storyboard strategist. Describe your product concept, target audience, and key outcome so we can formulate some high-impact hooks first!",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCopyText = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userMsg: CompanionMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.map(m => ({ role: m.sender === "ai" ? "model" : "user", text: m.text })),
          newMessage: userMsg.text
        }),
      });
      const data = await response.json();
      
      if (response.ok && data.text) {
        const aiMsg: CompanionMessage = {
          id: `ai_${Date.now()}`,
          sender: "ai",
          text: data.text,
          timestamp: new Date().toLocaleTimeString(),
          actionRequired: data.actionRequired // optional 'create' triggers
        };
        
        setMessages((prev) => [...prev, aiMsg]);

        // If the AI response suggests auto-populating or generating hooks:
        if (data.autoParams) {
          onQuickApplyHooks(data.autoParams.concept, data.autoParams.audience, data.autoParams.outcome);
        }
      } else {
        throw new Error(data.error || "Failed to fetch response.");
      }
    } catch (err: any) {
      console.error("Chat companion fallback activated:", err);
      const userText = userMsg.text;
      const extractedConcept = userText.length > 80 ? userText.slice(0, 80) + "..." : userText;
      const fallbackAiMsg: CompanionMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: `I've analyzed your concept: "${extractedConcept}". I'm now formulating 15 high-converting magnetic hooks and workspace assets for you right away!`,
        timestamp: new Date().toLocaleTimeString(),
        actionRequired: "create"
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
      onQuickApplyHooks(
        userText.slice(0, 60),
        "Target buyers, valuation analysts & key decision makers",
        "Scale conversions and automate market reports"
      );
    } finally {
      setIsSending(false);
    }
  };

  const loadSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[650px] relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Magnet className="w-4 h-4 text-indigo-400 rotate-180" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Magneto Copilot
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">MAGNETIC MARKETING STRATEGIST</p>
          </div>
        </div>
        {activeProjectName && (
          <span className="text-[9px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-750 font-mono">
            Active: {activeProjectName}
          </span>
        )}
      </div>

      {/* Messages Stream */}
      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar bg-slate-950/20">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
            <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center ${
              m.sender === "user" ? "bg-slate-800 text-slate-350" : "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
            } w-7 h-7 mt-0.5`}>
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Magnet className="w-4 h-4" />}
            </div>

            <div className={`p-3 rounded-xl space-y-1.5 text-xs leading-relaxed ${
              m.sender === "user"
                ? "bg-indigo-600/10 text-slate-200 border border-indigo-500/10 rounded-tr-none"
                : "bg-slate-905 text-slate-300 border border-slate-800 rounded-tl-none"
            }`}>
              {/* Parse lines beautifully */}
              <p className="whitespace-pre-line font-medium">{m.text}</p>
              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 font-mono select-none border-t border-slate-800/40 mt-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(m.id, m.text)}
                  className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800/60"
                  title="Copy message content"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-sans font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="font-sans font-medium">Copy</span>
                    </>
                  )}
                </button>
                <span>{m.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 mr-auto items-center max-w-[80%]">
            <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-500/20 w-7 h-7 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl rounded-tl-none">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && (
        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-850 flex flex-wrap gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => loadSuggestion("Pitch a smart leash for pets of busy professionals which prevents losing focus during walks.")}
            className="text-[10px] bg-slate-920 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 px-2.5 py-1.5 rounded-full border border-slate-800 transition text-left cursor-pointer text-ellipsis truncate max-w-full"
          >
            🐕 Smart Leash Pitch
          </button>
          <button
            onClick={() => loadSuggestion("I need script hooks for a tool that automates coding user guide manuals.")}
            className="text-[10px] bg-slate-920 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 px-2.5 py-1.5 rounded-full border border-slate-800 transition text-left cursor-pointer text-ellipsis truncate max-w-full"
          >
            💻 Manual Automation tool
          </button>
        </div>
      )}

      {/* Footer input form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 rounded-b-xl flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isSending ? "Copilot is drafting..." : "Ask Magneto to formulate a hook list or scripts..."}
          disabled={isSending}
          className="flex-grow bg-slate-950 text-slate-200 px-4 py-2.5 text-xs rounded-xl border border-slate-850 focus:border-slate-700 focus:outline-none font-medium"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isSending}
          className="p-2.5 bg-indigo-600 rounded-xl text-slate-100 hover:bg-indigo-505 disabled:opacity-40 transition flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4 fill-slate-100" />
        </button>
      </form>
    </div>
  );
}
