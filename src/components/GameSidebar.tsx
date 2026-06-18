"use client";

import React, { useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Cpu, User, RefreshCw, Flag, Swords } from "lucide-react";
import { DIFFICULTY_LEVELS } from "../hooks/useStockfish";

interface GameSidebarProps {
  game: Chess;
  difficulty: number;
  playerColor: "w" | "b";
  isBotThinking: boolean;
  onResign: () => void;
  onNewGame: () => void;
  isGameOver: boolean;
}

export default function GameSidebar({
  game,
  difficulty,
  playerColor,
  isBotThinking,
  onResign,
  onNewGame,
  isGameOver,
}: GameSidebarProps) {
  const historyEndRef = useRef<HTMLDivElement | null>(null);
  const activeLevelConfig = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS[5];
  const history = game.history();
  const currentTurn = game.turn();
  const isPlayerTurn = currentTurn === playerColor && !isGameOver && !isBotThinking;

  // Chunk move history into pairs for a Chess.com style moves table
  const movePairs = React.useMemo(() => {
    const pairs: { num: number; w: string; b: string }[] = [];
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        num: Math.floor(i / 2) + 1,
        w: history[i],
        b: history[i + 1] || "",
      });
    }
    return pairs;
  }, [history]);

  // Scroll move history to the bottom when new moves are added
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="w-full md:w-[420px] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl h-[560px]">
      {/* Players Dashboard */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Opponent (Bot) Card */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
            !isPlayerTurn && !isGameOver
              ? "bg-zinc-800/80 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
              : "bg-zinc-950 border-zinc-800/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                !isPlayerTurn && !isGameOver
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-zinc-100">Stockfish Bot</div>
              <div className="text-[10px] text-zinc-500 font-bold">{activeLevelConfig.label}</div>
            </div>
          </div>
          {!isPlayerTurn && !isGameOver && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>

        {/* VS Divider */}
        <div className="flex justify-center -my-2.5 z-10">
          <div className="bg-zinc-950 border border-zinc-800 text-[10px] font-black tracking-widest text-zinc-500 uppercase px-2 py-0.5 rounded-md flex items-center gap-1 select-none">
            <Swords className="w-3 h-3 text-zinc-600" /> vs
          </div>
        </div>

        {/* User Card */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
            isPlayerTurn
              ? "bg-zinc-800/80 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
              : "bg-zinc-950 border-zinc-800/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isPlayerTurn ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-zinc-100">You</div>
              <div className="text-[10px] text-zinc-500 font-bold">
                Color: {playerColor === "w" ? "White" : "Black"}
              </div>
            </div>
          </div>
          {isPlayerTurn && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>
      </div>

      {/* Move History Log */}
      <div className="flex-grow flex flex-col min-h-0 bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 mb-5 select-text">
        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-2 mb-2">
          Moves Log
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-1">
          {movePairs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-semibold text-zinc-600 italic select-none">
              Waiting for first move...
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr_1fr] gap-x-6 gap-y-1.5 font-mono text-xs text-zinc-300">
              {movePairs.map((pair) => (
                <React.Fragment key={pair.num}>
                  <div className="text-zinc-600 font-bold select-none text-right w-6">
                    {pair.num}.
                  </div>
                  <div className="font-bold hover:text-white cursor-default">{pair.w}</div>
                  <div className="font-bold hover:text-white cursor-default text-zinc-400">
                    {pair.b}
                  </div>
                </React.Fragment>
              ))}
              <div ref={historyEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-2 gap-3 mt-auto select-none">
        <button
          type="button"
          disabled={isGameOver}
          onClick={onResign}
          className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/50 border border-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-950 disabled:hover:text-zinc-500 disabled:hover:border-zinc-800 text-zinc-400 font-extrabold text-xs py-3 px-4 rounded-xl cursor-pointer transition-all duration-150"
        >
          <Flag className="w-4 h-4" /> Resign
        </button>

        <button
          type="button"
          onClick={onNewGame}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-extrabold text-xs py-3 px-4 rounded-xl border border-zinc-700 cursor-pointer transition-colors duration-150"
        >
          <RefreshCw className="w-4 h-4" /> New Game
        </button>
      </div>
    </div>
  );
}
