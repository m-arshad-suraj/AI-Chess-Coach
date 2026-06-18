"use client";

import React, { useEffect, useRef } from "react";
import { Brain, Sparkles, Loader2 } from "lucide-react";

interface AICoachSidebarProps {
  commentary: string;
  isThinking: boolean;
  isAdviceRequested: boolean;
  isPlayerTurn: boolean;
  onGetAdvice: () => void;
  error?: string | null;
}

export default function AICoachSidebar({
  commentary,
  isThinking,
  isAdviceRequested,
  isPlayerTurn,
  onGetAdvice,
  error,
}: AICoachSidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll commentary to the bottom as it streams in
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [commentary, isThinking]);

  // A custom inline styling formatter for simple markdown parsing (*bullet*, **bold**, \n\n paragraphs)
  const renderCommentary = (text: string) => {
    if (!text) return null;

    const paragraphs = text.split("\n\n");

    return paragraphs.map((para, i) => {
      const lines = para.split("\n");
      const isBulletList = lines.every(
        (line) => line.trim().startsWith("*") || line.trim().startsWith("-")
      );

      if (isBulletList && lines.length > 0) {
        return (
          <ul key={i} className="list-disc pl-5 my-3 space-y-1.5 text-zinc-300">
            {lines.map((line, j) => {
              const cleanLine = line.replace(/^[\*\-]\s*/, "");
              return (
                <li key={j} className="text-xs leading-relaxed">
                  {parseInlineMarkdown(cleanLine)}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={i} className="mb-4 text-xs leading-relaxed text-zinc-300">
          {lines.map((line, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {parseInlineMarkdown(line)}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (text: string) => {
    // Bold tokens: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold text-emerald-400">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full md:w-[420px] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl h-[560px]">
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.05)]">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="font-black text-sm text-zinc-100 uppercase tracking-wider">
            AI Chess Coach
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold">
            Grandmaster Assistant
          </p>
        </div>
      </div>

      {/* Commentary Box */}
      <div className="flex-grow flex flex-col min-h-0 bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 mb-5 select-text">
        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-2 mb-2 select-none">
          Coach Commentary
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto custom-scrollbar pr-1"
        >
          {error ? (
            <div className="h-full flex items-center justify-center p-2 text-center text-xs font-semibold text-rose-500 leading-relaxed">
              {error}
            </div>
          ) : isThinking && !commentary ? (
            /* Pulsing thinking skeleton loader */
            <div className="space-y-4 animate-pulse py-2 select-none">
              <div className="h-3 bg-zinc-850 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-850 rounded w-5/6"></div>
                <div className="h-3 bg-zinc-850 rounded"></div>
                <div className="h-3 bg-zinc-850 rounded w-4/5"></div>
              </div>
              <div className="h-3 bg-zinc-850 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-850 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-850 rounded"></div>
              </div>
            </div>
          ) : commentary ? (
            <div className="text-zinc-300 font-medium">
              {renderCommentary(commentary)}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 select-none text-zinc-650">
              <Brain className="w-8 h-8 mb-2 opacity-25" />
              <p className="text-xs font-bold text-zinc-500 mb-1">
                Coach is Standby
              </p>
              <p className="text-[10px] text-zinc-500/80 leading-normal max-w-[240px]">
                Click the button below during your turn to get deep tactical and strategic calculations from the grandmaster coach.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advice Trigger Button */}
      <div className="mt-auto select-none">
        <button
          type="button"
          disabled={!isPlayerTurn || isThinking || isAdviceRequested}
          onClick={onGetAdvice}
          className={`w-full flex items-center justify-center gap-2 font-extrabold text-xs py-3.5 px-4 rounded-xl border transition-all duration-200 cursor-pointer ${
            isThinking
              ? "bg-zinc-900 border-zinc-850 text-zinc-500 cursor-not-allowed"
              : !isPlayerTurn
              ? "bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed opacity-50"
              : isAdviceRequested
              ? "bg-zinc-950 border-zinc-850/50 text-zinc-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-zinc-950 border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          }`}
        >
          {isThinking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
              Coach is thinking...
            </>
          ) : !isPlayerTurn ? (
            <>
              <Brain className="w-4 h-4 text-zinc-600" />
              Waiting for Bot Move
            </>
          ) : isAdviceRequested ? (
            <>
              <Brain className="w-4 h-4 text-zinc-500" />
              Advice Received
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-zinc-950" />
              Get AI Coach Advice
            </>
          )}
        </button>
      </div>
    </div>
  );
}
