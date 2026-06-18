"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Swords, ShieldAlert } from "lucide-react";
import { sounds } from "../utils/sounds";

interface GameOverModalProps {
  isOpen: boolean;
  winner: "w" | "b" | "draw" | null;
  reason: string;
  playerColor: "w" | "b";
  onRestart: () => void;
}

export default function GameOverModal({
  isOpen,
  winner,
  reason,
  playerColor,
  onRestart,
}: GameOverModalProps) {
  const isWin = winner === playerColor;
  const isDraw = winner === "draw";

  // Play Game Over synthesized sound effect when modal opens
  useEffect(() => {
    if (isOpen) {
      sounds.playGameOver(isWin);
    }
  }, [isOpen, isWin]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            onClick={onRestart}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-center text-zinc-100"
          >
            {/* Visual Indicator (Icon) */}
            <div className="flex justify-center mb-4">
              {isDraw ? (
                <div className="bg-amber-600/10 p-4 rounded-full border border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <Swords className="w-8 h-8" />
                </div>
              ) : isWin ? (
                <div className="bg-emerald-600/10 p-4 rounded-full border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <Trophy className="w-8 h-8" />
                </div>
              ) : (
                <div className="bg-rose-600/10 p-4 rounded-full border border-rose-500/20 text-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Game Result Headline */}
            <h2 className="text-2xl font-black tracking-tight text-zinc-100 mb-1">
              {isDraw
                ? "Draw Game"
                : isWin
                ? "Victory!"
                : "Defeat"}
            </h2>

            {/* Sub-label Winner info */}
            <p className="text-emerald-400 font-bold text-sm mb-3">
              {winner === "w"
                ? "White Wins"
                : winner === "b"
                ? "Black Wins"
                : "No Winner"}
            </p>

            {/* Sub-reason description */}
            <p className="text-zinc-400 text-xs px-2 mb-6">
              Game ended {reason.toLowerCase()}
            </p>

            {/* Action button */}
            <button
              type="button"
              onClick={onRestart}
              className="w-full bg-[#81b64c] hover:bg-[#95ca5c] text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-[0_4px_12px_rgba(129,182,76,0.2)] transition-colors duration-150 uppercase tracking-wide cursor-pointer"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
