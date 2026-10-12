"use client";

import { AnimatePresence, motion } from "motion/react";
import { useUiStore } from "@/stores/ui-store";
import { ease } from "@/lib/easings";

export default function Toaster() {
  const toastMessage = useUiStore((state) => state.toastMessage);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {toastMessage && (() => {
          const isAllowed = toastMessage.includes("✅");
          const isBlocked = toastMessage.includes("⛔");

          return (
            <motion.div
              key={toastMessage}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: ease.power3Out }}
              className={`shadow-xl pointer-events-auto rounded-xl px-4 py-2.5 text-xs font-semibold tracking-tight border backdrop-blur-md transition-all flex items-center gap-2 ${
                isBlocked
                  ? "bg-rose-50/95 text-rose-900 border-rose-300 ring-2 ring-rose-500/20 shadow-rose-500/10"
                  : isAllowed
                  ? "bg-emerald-50/95 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20 shadow-emerald-500/10"
                  : "bg-white text-slate-900 border-slate-200"
              }`}
            >
              {toastMessage}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
