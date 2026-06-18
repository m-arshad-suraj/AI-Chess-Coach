"use client";

import React, { useState } from "react";
import WelcomeScreen from "../components/WelcomeScreen";
import GameArea from "../components/GameArea";

export default function Home() {
  const [view, setView] = useState<"welcome" | "game">("welcome");
  const [gameConfig, setGameConfig] = useState<{
    color: "w" | "b" | "random";
    level: number;
  }>({
    color: "w",
    level: 5,
  });

  const handleStartGame = (color: "w" | "b" | "random", level: number) => {
    setGameConfig({ color, level });
    setView("game");
  };

  const handleReturnToWelcome = () => {
    setView("welcome");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col select-none">
      {/* Header Banner */}
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-default">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center font-extrabold text-white text-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            ♟
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
            Chess Coach AI
          </span>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-grow flex items-center w-full">
        {view === "welcome" ? (
          <div className="w-full flex justify-center items-center">
            <WelcomeScreen onStartGame={handleStartGame} />
          </div>
        ) : (
          <GameArea
            playerColorConfig={gameConfig.color}
            difficulty={gameConfig.level}
            onReturnToWelcome={handleReturnToWelcome}
          />
        )}
      </main>
    </div>
  );
}
