"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import Header from "@/components/dashboard/header/header";
import Main from "@/components/dashboard/main/main";
import Dialogs from "@/components/dashboard/dialogs/dialogs";
import Toaster from "@/components/_ui/toaster";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export default function Dashboard() {
  useEffect(() => {
    useKanbanStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      const ui = useUiStore.getState();
      if (ui.dialog) return;
      if (event.key === "/") {
        event.preventDefault();
        document.getElementById("board-search")?.focus();
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        ui.openDialog({ type: "new-task" });
      } else if (event.key === "?") {
        event.preventDefault();
        ui.openDialog({ type: "help" });
      } else if (event.key === "[") {
        event.preventDefault();
        ui.toggleSidebarCollapsed();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background flex h-dvh w-full overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <Main />
        </div>
        <Dialogs />
        <Toaster />
      </div>
    </MotionConfig>
  );
}
