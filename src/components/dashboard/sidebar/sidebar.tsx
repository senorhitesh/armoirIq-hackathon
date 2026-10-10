"use client";

import { AnimatePresence, motion } from "motion/react";
import SidebarContent from "@/components/dashboard/sidebar/sidebar-content";
import { useUiStore } from "@/stores/ui-store";
import { ease } from "@/lib/easings";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleCollapsed = useUiStore((state) => state.toggleSidebarCollapsed);

  return (
    <>
      <aside
        className={cn(
          "border-border bg-sidebar ease-smooth-in-out hidden h-full shrink-0 flex-col overflow-hidden border-r transition-[width] duration-200 lg:flex",
          collapsed ? "w-[60px]" : "w-[260px]",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          toggleLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        />
      </aside>
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
              className="bg-sidebar shadow-popover absolute inset-y-0 left-0 flex w-[260px] flex-col"
            >
              <SidebarContent
                collapsed={false}
                onToggle={() => setSidebarOpen(false)}
                toggleLabel="Close menu"
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
