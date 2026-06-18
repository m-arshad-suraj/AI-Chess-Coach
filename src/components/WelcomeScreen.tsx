"use client";

import React, { useState } from "react";
import { DIFFICULTY_LEVELS } from "../hooks/useStockfish";
import { Crown, Sparkles, Trophy, Shuffle } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onStartGame: (color: "w" | "b" | "random", level: number) => void;
}

export default function WelcomeScreen({ onStartGame }: WelcomeScreenProps) {
  const [selectedColor, setSelectedColor] = useState<"w" | "b" | "random">("w");
  const [difficulty, setDifficulty] = useState<number>(5);

  const activeLevelConfig = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS[5];

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 text-center text-zinc-100"
      >
        {/* Title / Logo Header */}
        <div className="flex justify-center mb-4">
          <div className="bg-emerald-600/10 p-4 rounded-full border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Trophy className="w-10 h-10" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
          AI Chess Coach
        </h1>
        <p className="text-zinc-400 text-sm mt-1 mb-8">
          Train your skills against Stockfish v18 WASM
        </p>

        {/* Piece Color Selection */}
        <div className="mb-8 text-left">
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Play As
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* White */}
            <button
              type="button"
              onClick={() => setSelectedColor("w")}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                selectedColor === "w"
                  ? "bg-zinc-800 border-zinc-200 text-white shadow-[0_0_12px_rgba(255,255,255,0.05)]"
                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg mb-2 text-zinc-900 shadow">
                <Crown className="w-6 h-6 fill-zinc-900 stroke-zinc-900" />
              </div>
              <span className="text-xs font-bold">White</span>
            </button>

            {/* Random */}
            <button
              type="button"
              onClick={() => setSelectedColor("random")}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                selectedColor === "random"
                  ? "bg-zinc-800 border-zinc-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-white to-zinc-900 rounded-lg mb-2 text-emerald-500 shadow border border-zinc-700">
                <Shuffle className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold">Random</span>
            </button>

            {/* Black */}
            <button
              type="button"
              onClick={() => setSelectedColor("b")}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                selectedColor === "b"
                  ? "bg-zinc-800 border-zinc-700 text-zinc-100 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-lg mb-2 text-white border border-zinc-700 shadow">
                <Crown className="w-6 h-6 fill-white stroke-white" />
              </div>
              <span className="text-xs font-bold">Black</span>
            </button>
          </div>
        </div>

        {/* Difficulty Setting */}
        <div className="mb-10 text-left">
          <div className="flex justify-between items-baseline mb-2">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              Bot Strength
            </label>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Level {difficulty}
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-zinc-800 focus:outline-none"
          />

          <div className="mt-3 text-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3 px-4 shadow-inner">
            <span className="text-zinc-100 font-extrabold text-sm block">
              {activeLevelConfig.label}
            </span>
            <span className="text-zinc-500 text-xs block mt-0.5">
              Think depth: {activeLevelConfig.depth} plies • Max duration: {activeLevelConfig.movetime}ms
            </span>
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => onStartGame(selectedColor, difficulty)}
          className="w-full bg-[#81b64c] hover:bg-[#95ca5c] text-white font-extrabold text-lg py-4 px-6 rounded-xl shadow-[0_4px_16px_rgba(129,182,76,0.3)] transition-colors duration-150 uppercase tracking-wide cursor-pointer"
        >
          Start Game
        </motion.button>
      </motion.div>
    </div>
  );
}
