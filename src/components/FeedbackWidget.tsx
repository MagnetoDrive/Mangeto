import React, { useState } from "react";
import { MessageSquare, X, Send, CheckCircle, AlertCircle } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface FeedbackWidgetProps {
  userId: string | null;
}

export default function FeedbackWidget({ userId }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general"); // general, bug, suggestion
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "feedback"), {
        user: userId || "anonymous_magneto_user",
        message: message.trim(),
        type,
        timestamp: new Date().toISOString(), // Standard date string as per schema
        createdAt: serverTimestamp() // For Firestore index ordering if needed
      });
      
      setSuccess(true);
      setMessage("");
      setType("general");
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
      }, 3000);
    } catch (err: any) {
      console.error("Failed to submit feedback", err);
      setError("Failed to transmit feedback. App offline, but your feedback is noted!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-45" id="feedback_widget_container">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-full text-xs font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 duration-150 cursor-pointer border border-indigo-500/30"
          id="btn_feedback_trigger"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback</span>
        </button>
      )}

      {/* Feedback Dialog */}
      {isOpen && (
        <div 
          className="bg-slate-900 border border-slate-800 rounded-2xl w-80 p-5 shadow-2xl relative animate-fade-in space-y-4"
          id="feedback_dialog_box"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Submit Feedback
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
              aria-label="Close dialog"
              id="btn_close_feedback"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
              <p className="text-xs font-bold text-slate-100">Feedback Transmitted!</p>
              <p className="text-[11px] text-slate-400">Thank you for helping us tune Magneto.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Type selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-slate-450 uppercase font-bold">Feedback Type</label>
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-lg gap-1">
                  {["general", "bug", "idea"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-1 text-[10px] font-bold rounded capitalize transition duration-150 cursor-pointer ${
                        type === t 
                          ? "bg-slate-800 text-indigo-400" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message field */}
              <div className="space-y-1">
                <label className="text-[9px] font-mono tracking-wider text-slate-450 uppercase font-bold">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share bugs, suggestions, or general vibes with the architect..."
                  required
                  rows={4}
                  className="w-full bg-slate-950 text-slate-200 px-3 py-2.5 text-xs rounded-xl border border-slate-850 focus:border-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 transition duration-150 font-medium placeholder:text-slate-600 resize-none"
                  id="textarea_feedback_msg"
                />
              </div>

              {error && (
                <div className="text-[10px] text-amber-400 flex items-start gap-1.5 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action trigger */}
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black rounded-xl tracking-wider uppercase transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                id="btn_submit_feedback"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                <span>{isSubmitting ? "Transmitting..." : "Send Feedback"}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
