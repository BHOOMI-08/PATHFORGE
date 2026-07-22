import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Award } from "lucide-react";

export const ChatInterface = ({
  history = [],
  onSendMessage,
  onFinishInterview,
  sending = false,
  finishing = false,
  targetRole = "Technical Interview",
}) => {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, sending]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-[#10263D]/80 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[72vh] backdrop-blur-xl shadow-2xl">
      {/* Top Toolbar */}
      <div className="p-4 sm:p-5 bg-[#041220]/90 border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#A7F3D0]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-slate-100 text-base flex items-center gap-2">
              Gemini AI Tech Interviewer
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400">Target Role: {targetRole}</p>
          </div>
        </div>

        <button
          onClick={onFinishInterview}
          disabled={finishing || history.length < 2}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#34D399] to-[#10B981] hover:opacity-90 disabled:opacity-40 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-[#34D399]/20"
        >
          {finishing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating Session...
            </>
          ) : (
            <>
              <Award className="w-3.5 h-3.5" /> Finish & Evaluate
            </>
          )}
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {history.map((msg, idx) => {
          const isAI = msg.sender === "ai";

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isAI ? "justify-start" : "justify-end"}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#A7F3D0] shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4.5 rounded-2xl leading-relaxed text-xs sm:text-sm shadow-md ${
                  isAI
                    ? "bg-[#041220] border border-white/10 text-slate-200 rounded-tl-none"
                    : "bg-gradient-to-r from-[#3B82F6] to-indigo-600 text-white rounded-tr-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text.11px opacity-75 font-semibold">
                  <span>{isAI ? "AI Technical Lead" : "You (Candidate)"}</span>
                  <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-[#071A2C] border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {sending && (
          <div className="flex items-start gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#A7F3D0] shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-[#041220] border border-white/10 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-300 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#34D399]" /> AI Interviewer is formulating technical question...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#041220]/90 border-t border-white/10 flex items-center gap-3">
        <textarea
          rows={2}
          placeholder="Type your technical response... (Press Enter to send)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-[#0B2238] border border-white/10 text-slate-100 text-sm rounded-2xl p-3.5 focus:outline-none focus:border-[#6EE7C8] resize-none leading-relaxed"
        />

        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#34D399] hover:opacity-90 disabled:opacity-40 text-slate-950 flex items-center justify-center transition-all shadow-lg shrink-0 font-bold"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
