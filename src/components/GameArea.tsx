"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Chess } from "chess.js";
import ChessBoard from "./ChessBoard";
import GameSidebar from "./GameSidebar";
import AICoachSidebar from "./AICoachSidebar";
import GameOverModal from "./GameOverModal";
import NewGameConfirmModal from "./NewGameConfirmModal";
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

  // New Game confirmation state
  const [isConfirmNewGameOpen, setIsConfirmNewGameOpen] = useState(false);

  // Stockfish hook for the playing bot
  const { getBestMove: getBotMove, isThinking: isBotThinking } = useStockfish();
  
  // Stockfish hook for the AI Coach advice calculations
  const { getBestMove: getCoachMove, isThinking: isCoachThinkingStockfish } = useStockfish();

  // AI Coach states
  const [coachCommentary, setCoachCommentary] = useState("");
  const [isCoachStreaming, setIsCoachStreaming] = useState(false);
  const [isAdviceRequested, setIsAdviceRequested] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Combined thinking state for AI Coach
  const isCoachThinking = isCoachThinkingStockfish || isCoachStreaming;

  // Clean up coach controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    const success = executeMove(from, to, promotion);
    if (success) {
      // Abort any ongoing coach streaming/request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Reset coach advice state
      setCoachCommentary("");
      setIsAdviceRequested(false);
      setCoachError(null);
      setIsCoachStreaming(false);
    }
  };

  // Trigger coach advice retrieval pipeline
  const handleGetCoachAdvice = async () => {
    if (isCoachThinking || isAdviceRequested) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsCoachStreaming(true);
    setCoachCommentary("");
    setCoachError(null);

    try {
      const fen = game.fen();
      
      // Calculate best move using the Coach's Stockfish Web Worker at grandmaster level (depth 15/level 10)
      const bestMoveUci = await getCoachMove(fen, 10);

      if (controller.signal.aborted) return;

      if (!bestMoveUci || bestMoveUci === "(none)") {
        throw new Error("Could not compute a best move recommendation for this position.");
      }

      // Query the server API which retrieves and streams Gemini Commentary
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fen,
          history: game.history(),
          bestMove: bestMoveUci,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Coach route error (status ${response.status})`);
      }

      if (!response.body) {
        throw new Error("API streaming body is empty.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setCoachCommentary(accumulatedText);
      }

      setIsAdviceRequested(true);
    } catch (err: any) {
      if (err.name === "AbortError" || err.message === "The user aborted a request.") {
        return;
      }
      console.error("AI Coach pipeline error:", err);
      setCoachError(err.message || "An unexpected error occurred while communicating with the AI Coach.");
    } finally {
      setIsCoachStreaming(false);
    }
  };

  // Bot Turn Trigger Loop
  useEffect(() => {
    const isBotTurn = game.turn() === botColor && !game.isGameOver();

    if (isBotTurn && !isBotThinking) {
      // Small timeout to simulate a tiny delay and improve UX feel
      const botTimer = setTimeout(async () => {
        try {
          const uciMove = await getBotMove(game.fen(), difficulty);
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
  }, [game, botColor, difficulty, isBotThinking, getBotMove]);

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
      setIsGameOverModalOpen(true);
    }
  }, [game, playerColor]);



  // New Game confirmation trigger
  const handleNewGame = () => {
    if (game.isGameOver()) {
      confirmNewGame();
    } else {
      setIsConfirmNewGameOpen(true);
    }
  };

  // Perform New Game reset
  const confirmNewGame = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsConfirmNewGameOpen(false);
    onReturnToWelcome();
  };

  const isPlayerTurn = game.turn() === playerColor && !game.isGameOver() && !isBotThinking;

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
          isBotThinking={isBotThinking}
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
          isBotThinking={isBotThinking}
          onNewGame={handleNewGame}
          isGameOver={game.isGameOver()}
        />
      </div>

      {/* AI Coach Commentary Sidebar */}
      <div className="w-full md:w-[420px] flex-shrink-0 flex justify-center order-3 md:order-3">
        <AICoachSidebar
          commentary={coachCommentary}
          isThinking={isCoachThinking}
          isAdviceRequested={isAdviceRequested}
          isPlayerTurn={isPlayerTurn}
          onGetAdvice={handleGetCoachAdvice}
          error={coachError}
        />
      </div>

      {/* GameOver Modal Trigger */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        winner={gameResult?.winner ?? null}
        reason={gameResult?.reason ?? ""}
        playerColor={playerColor}
        onClose={() => setIsGameOverModalOpen(false)}
      />

      {/* New Game Confirmation Modal */}
      <NewGameConfirmModal
        isOpen={isConfirmNewGameOpen}
        onConfirm={confirmNewGame}
        onClose={() => setIsConfirmNewGameOpen(false)}
      />
    </div>
  );
}

