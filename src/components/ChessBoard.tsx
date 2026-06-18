"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { motion } from "framer-motion";
import { sounds } from "../utils/sounds";

interface ChessBoardProps {
  game: Chess;
  onMove: (from: string, to: string, promotion?: string) => void;
  isBotThinking: boolean;
  playerColor: "w" | "b";
  lastMove: { from: string; to: string } | null;
  isGameOver: boolean;
}

export default function ChessBoard({
  game,
  onMove,
  isBotThinking,
  playerColor,
  lastMove,
  isGameOver,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const inCheck = game.inCheck();
  const currentTurn = game.turn();
  const isPlayerTurn = currentTurn === playerColor && !isBotThinking && !isGameOver;

  // Shake the board and play check sounds when in check
  useEffect(() => {
    if (inCheck && currentTurn === playerColor) {
      setShakeTrigger((prev) => prev + 1);
      sounds.playCheck();
    }
  }, [inCheck, currentTurn, playerColor]);

  // Find checking King square
  const kingSquare = useMemo(() => {
    if (!inCheck) return null;
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === "k" && piece.color === currentTurn) {
          return `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        }
      }
    }
    return null;
  }, [inCheck, currentTurn, game]);

  // Hints logic
  const getMoveOptions = (square: Square) => {
    const moves = game.moves({
      square: square,
      verbose: true,
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      const isCapture = move.captured !== undefined;
      newSquares[move.to] = {
        background: isCapture
          ? "radial-gradient(circle, transparent 52%, rgba(0, 0, 0, 0.15) 54%, rgba(0, 0, 0, 0.15) 68%, transparent 70%)"
          : "radial-gradient(circle, rgba(0, 0, 0, 0.15) 24%, transparent 26%)",
        borderRadius: "50%",
        cursor: "pointer",
      };
    });

    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.25)",
    };

    setOptionSquares(newSquares);
  };

  // Click-to-move handling
  const handleSquareClick = (square: string, piece: { pieceType: string } | null) => {
    if (!isPlayerTurn) return;
    const sq = square as Square;

    if (selectedSquare) {
      if (selectedSquare === sq) {
        setSelectedSquare(null);
        setOptionSquares({});
        return;
      }

      const moves = game.moves({ square: selectedSquare, verbose: true });
      const foundMove = moves.find((m) => m.to === sq);

      if (foundMove) {
        const isPawn = foundMove.piece === "p";
        const isPromotion = isPawn && (sq.endsWith("8") || sq.endsWith("1"));
        onMove(selectedSquare, sq, isPromotion ? "q" : undefined);
        setSelectedSquare(null);
        setOptionSquares({});
        return;
      }
    }

    // Select piece
    if (piece && piece.pieceType[0] === playerColor) {
      setSelectedSquare(sq);
      getMoveOptions(sq);
    } else {
      setSelectedSquare(null);
      setOptionSquares({});
    }
  };

  // Combine highlights: option dots, last move, check warning
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...optionSquares };

    if (lastMove) {
      if (!styles[lastMove.from]) {
        styles[lastMove.from] = { backgroundColor: "rgba(186, 202, 68, 0.4)" };
      }
      if (!styles[lastMove.to]) {
        styles[lastMove.to] = { backgroundColor: "rgba(186, 202, 68, 0.4)" };
      }
    }

    if (kingSquare) {
      const isCheckmate = game.isCheckmate();
      styles[kingSquare] = {
        background: isCheckmate
          ? "radial-gradient(circle, rgba(220, 38, 38, 0.95) 0%, rgba(185, 28, 28, 0.8) 50%, rgba(127, 29, 29, 0.7) 100%)"
          : "radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0.2) 60%, transparent 100%)",
      };
    }

    return styles;
  }, [optionSquares, lastMove, kingSquare]);

  return (
    <motion.div
      animate={shakeTrigger > 0 ? "shake" : "idle"}
      variants={{
        shake: {
          x: [0, -8, 8, -6, 6, -4, 4, 0],
          transition: { duration: 0.35, ease: "easeInOut" },
        },
        idle: { x: 0 },
      }}
      className="w-full md:w-[560px] md:h-[560px] aspect-square bg-[#769656] rounded-lg overflow-hidden shadow-2xl border border-zinc-800"
    >
      <Chessboard
        options={{
          position: game.fen(),
          boardOrientation: playerColor === "w" ? "white" : "black",
          squareStyles: customSquareStyles,
          animationDurationInMs: 180,
          darkSquareStyle: { backgroundColor: "#769656" },
          lightSquareStyle: { backgroundColor: "#eeeed2" },
          allowDragging: isPlayerTurn,
          onPieceDrop: ({ piece, sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            
            const isPawn = piece.pieceType.endsWith("P") || piece.pieceType.endsWith("p");
            const isPromotion = isPawn && (targetSquare.endsWith("8") || targetSquare.endsWith("1"));
            
            onMove(sourceSquare, targetSquare, isPromotion ? "q" : undefined);
            setSelectedSquare(null);
            setOptionSquares({});
            return true;
          },
          onSquareClick: ({ square, piece }) => {
            handleSquareClick(square, piece);
          },
        }}
      />
    </motion.div>
  );
}
