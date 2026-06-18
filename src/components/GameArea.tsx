"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Chess } from "chess.js";
import ChessBoard from "./ChessBoard";
import GameSidebar from "./GameSidebar";
import GameOverModal from "./GameOverModal";
import { useStockfish } from "../hooks/useStockfish";
import { sounds } from "../utils/sounds";

interface GameAreaProps {
  playerColorConfig: "w" | "b" | "random";
  difficulty: number;
  onReturnToWelcome: () => void;
}

export default function GameArea({
  playerColorConfig,
  difficulty,
  onReturnToWelcome,
}: GameAreaProps) {
  // Resolve player color if "random" is selected
  const playerColor = useMemo(() => {
    if (playerColorConfig === "random") {
      return Math.random() < 0.5 ? "w" : "b";
    }
    return playerColorConfig;
  }, [playerColorConfig]);

  const botColor = playerColor === "w" ? "b" : "w";

  // Initialize game state
  const [game, setGame] = useState(() => new Chess());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  
  // Game over state
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner: "w" | "b" | "draw" | null;
    reason: string;
  } | null>(null);

  // Stockfish hook
  const { getBestMove, isThinking } = useStockfish();

  // Make a move on the board
  const executeMove = (from: string, to: string, promotion?: string) => {
    try {
      const result = game.move({
        from,
        to,
        promotion,
      });

      if (result) {
        // Trigger chess sound effects
        if (result.captured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        // Force react re-render by instantiating a new Chess instance with the updated PGN history
        const nextGame = new Chess();
        nextGame.loadPgn(game.pgn());
        setGame(nextGame);
        setLastMove({ from, to });
        return true;
      }
    } catch (e) {
      console.warn("Invalid move attempted:", from, to, e);
    }
    return false;
  };

  // Human player move handler
  const handlePlayerMove = (from: string, to: string, promotion?: string) => {
    executeMove(from, to, promotion);
  };

  // Bot Turn Trigger Loop
  useEffect(() => {
    const isBotTurn = game.turn() === botColor && !game.isGameOver();

    if (isBotTurn && !isThinking) {
      // Small timeout to simulate a tiny delay and improve UX feel
      const botTimer = setTimeout(async () => {
        try {
          const uciMove = await getBestMove(game.fen(), difficulty);
          if (uciMove && uciMove.length >= 4) {
            const from = uciMove.slice(0, 2);
            const to = uciMove.slice(2, 4);
            const promotion = uciMove.length > 4 ? uciMove.slice(4, 5) : undefined;
            executeMove(from, to, promotion);
          }
        } catch (error) {
          console.error("AI engine move selection failed:", error);
        }
      }, 300);

      return () => clearTimeout(botTimer);
    }
  }, [game, botColor, difficulty, isThinking, getBestMove]);

  // Monitor game over conditions
  useEffect(() => {
    if (game.isGameOver()) {
      let winner: "w" | "b" | "draw" | null = "draw";
      let reason = "Draw";
      const checkmate = game.isCheckmate();

      if (checkmate) {
        // Winner is the player whose turn it isn't
        winner = game.turn() === "w" ? "b" : "w";
        reason = "by Checkmate";
        // Play game over sound directly
        const isWin = winner === playerColor;
        sounds.playGameOver(isWin);
      } else if (game.isStalemate()) {
        reason = "by Stalemate";
      } else if (game.isThreefoldRepetition()) {
        reason = "by Threefold Repetition";
      } else if (game.isInsufficientMaterial()) {
        reason = "by Insufficient Material";
      } else if (game.isDraw()) {
        // Fallback draw (e.g. 50-move rule)
        reason = "by 50-move rule";
      }

      setGameResult({ winner, reason });

      // Do not open popup modal on checkmate
      if (!checkmate) {
        setIsGameOverModalOpen(true);
      }
    }
  }, [game, playerColor]);

  // Resignation Handler
  const handleResign = () => {
    setGameResult({
      winner: botColor,
      reason: "by Resignation",
    });
    setIsGameOverModalOpen(true);
  };

  // New Game reset
  const handleNewGame = () => {
    onReturnToWelcome();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[85vh] py-4 gap-8 md:flex-row md:items-center md:justify-start md:pl-8">
      {/* Chessboard Container */}
      <div className="flex flex-col items-center justify-center flex-shrink-0 md:w-[560px] md:h-[560px] w-full order-1 md:order-2">
        {/* Game state subheader for mobile view */}
        <div className="w-full flex justify-between items-center text-xs font-bold text-zinc-500 mb-2 px-1 md:hidden select-none">
          <span>AI Chess Coach</span>
          <span>Level {difficulty}</span>
        </div>
        
        <ChessBoard
          game={game}
          onMove={handlePlayerMove}
          isBotThinking={isThinking}
          playerColor={playerColor}
          lastMove={lastMove}
          isGameOver={game.isGameOver()}
        />
      </div>

      {/* Sidebar Controls & Move Log */}
      <div className="w-full md:w-[420px] flex-shrink-0 flex justify-center order-2 md:order-1">
        <GameSidebar
          game={game}
          difficulty={difficulty}
          playerColor={playerColor}
          isBotThinking={isThinking}
          onResign={handleResign}
          onNewGame={handleNewGame}
          isGameOver={game.isGameOver()}
        />
      </div>

      {/* GameOver Modal Trigger */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        winner={gameResult?.winner ?? null}
        reason={gameResult?.reason ?? ""}
        playerColor={playerColor}
        onRestart={handleNewGame}
      />
    </div>
  );
}
