"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";

interface NewGameConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function NewGameConfirmModal({
  isOpen,
  onConfirm,
  onClose,
}: NewGameConfirmModalProps) {
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
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-center text-zinc-100"
          >
            {/* Warning/Help Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-600/10 p-4 rounded-full border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <HelpCircle className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            {/* Prompt Message */}
            <h3 className="text-lg font-bold tracking-tight text-zinc-100 mb-6 px-2">
              Are you sure you need to start a new game?
            </h3>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 font-semibold">
              <button
                type="button"
                onClick={onConfirm}
                className="w-full bg-[#81b64c] hover:bg-[#95ca5c] text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-[0_4px_12px_rgba(129,182,76,0.2)] transition-colors duration-150 uppercase tracking-wide cursor-pointer text-center"
              >
                Yes
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-extrabold text-sm py-3 px-4 rounded-xl border border-zinc-700/60 cursor-pointer transition-colors duration-150 uppercase tracking-wide text-center"
              >
                No
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
