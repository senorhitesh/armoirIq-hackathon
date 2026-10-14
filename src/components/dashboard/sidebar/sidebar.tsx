"use client";

import { AnimatePresence, motion } from "motion/react";
import SidebarNav from "@/components/dashboard/sidebar/sidebar-nav";
import { useUiStore } from "@/stores/ui-store";
import { ease } from "@/lib/easings";

export default function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <>
      <div className="hidden h-full shrink-0 lg:flex">
        <SidebarNav fill={true} />
      </div>
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setSidebarOpen(false)}
              className="bg-foreground/40 absolute inset-0"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.24, ease: ease.power3Out }}
              className="bg-sidebar shadow-popover absolute inset-y-0 left-0 flex flex-col"
            >
              <SidebarNav fill={true} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
