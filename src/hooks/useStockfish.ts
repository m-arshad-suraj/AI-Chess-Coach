import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";

export interface StockfishLevelConfig {
  skill: number;     // Stockfish Skill Level option (0 to 20)
  depth: number;     // Search depth (1 to 15)
  movetime: number;  // Max think time in milliseconds
  label: string;     // Elo label shown in UI
}

export const DIFFICULTY_LEVELS: Record<number, StockfishLevelConfig> = {
  1: { skill: 0, depth: 1, movetime: 50, label: "Novice (800 Elo)" },
  2: { skill: 2, depth: 2, movetime: 100, label: "Casual (1000 Elo)" },
  3: { skill: 4, depth: 3, movetime: 150, label: "Amateur (1200 Elo)" },
  4: { skill: 6, depth: 4, movetime: 200, label: "Club Player (1400 Elo)" },
  5: { skill: 9, depth: 5, movetime: 300, label: "Intermediate (1600 Elo)" },
  6: { skill: 12, depth: 6, movetime: 400, label: "Experienced (1800 Elo)" },
  7: { skill: 14, depth: 8, movetime: 600, label: "Advanced (2000 Elo)" },
  8: { skill: 16, depth: 10, movetime: 800, label: "Expert (2200 Elo)" },
  9: { skill: 18, depth: 12, movetime: 1000, label: "Candidate Master (2400 Elo)" },
  10: { skill: 20, depth: 15, movetime: 1500, label: "Grandmaster (2600 Elo)" },
};

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const moveResolverRef = useRef<((move: string) => void) | null>(null);

  useEffect(() => {
    // Only initialize in browser
    if (typeof window === "undefined") return;

    try {
      // Create local Web Worker from public/stockfish.js (same origin, no CORS)
      const worker = new Worker("/stockfish.js");
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent) => {
        const line = e.data;
        if (typeof line === "string") {
          console.log("Stockfish:", line);
          if (line.startsWith("bestmove")) {
            const parts = line.split(" ");
            const move = parts[1]; // UCI format (e.g. e2e4)
            if (moveResolverRef.current && move && move !== "(none)") {
              moveResolverRef.current(move);
              moveResolverRef.current = null;
              setIsThinking(false);
            }
          }
        }
      };

      // Initialize UCI
      worker.postMessage("uci");
      
      return () => {
        worker.terminate();
      };
    } catch (err) {
      console.warn("Failed to initialize Stockfish Web Worker:", err);
    }
  }, []);

  // 100% offline fallback: selects a random legal move instantly if the engine stalls
  const fallbackLocalCall = (fen: string): string => {
    try {
      const localGame = new Chess(fen);
      const moves = localGame.moves({ verbose: true });
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        return `${randomMove.from}${randomMove.to}${randomMove.promotion || ""}`;
      }
    } catch (e) {
      console.error("Local fallback move generation failed:", e);
    }
    return "(none)";
  };

  const getBestMove = (fen: string, level: number): Promise<string> => {
    setIsThinking(true);
    const config = DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS[5];

    return new Promise((resolve) => {
      let resolved = false;

      // Setup timeout to prevent hanging, falling back to local move if worker stalls
      const timeout = setTimeout(() => {
        if (!resolved) {
          console.warn("Stockfish local worker timed out. Resolving local random move.");
          const move = fallbackLocalCall(fen);
          resolved = true;
          setIsThinking(false);
          resolve(move);
        }
      }, config.movetime + 5000);

      const handleResolve = (move: string) => {
        resolved = true;
        clearTimeout(timeout);
        setIsThinking(false);
        resolve(move);
      };

      // Fallback if the worker fails to initialize
      if (!workerRef.current) {
        console.warn("Stockfish worker not available. Resolving local random move.");
        const move = fallbackLocalCall(fen);
        resolved = true;
        clearTimeout(timeout);
        setIsThinking(false);
        resolve(move);
        return;
      }

      // Store the resolver for the onmessage callback
      moveResolverRef.current = handleResolve;

      // Configure skill level and request best move
      workerRef.current.postMessage(`setoption name Skill Level value ${config.skill}`);
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage(`go depth ${config.depth} movetime ${config.movetime}`);
    });
  };

  return {
    getBestMove,
    isThinking,
  };
}
