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
        {toastMessage && (
          <motion.div
            key={toastMessage}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: ease.power3Out }}
            className="bg-white text-slate-900 shadow-xl pointer-events-auto rounded-xl px-4 py-2.5 text-xs font-semibold tracking-tight border border-slate-200"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
