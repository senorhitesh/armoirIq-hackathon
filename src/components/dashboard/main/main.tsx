"use client";

import Toolbar from "@/components/dashboard/toolbar/toolbar";
import Board from "@/components/dashboard/board/board";
import BoardSkeleton from "@/components/dashboard/board/board-skeleton";
import Overview from "@/components/dashboard/overview/overview";
import CreativeSpaceView from "@/components/dashboard/creative-space/creative-space-view";
import AgentMemoryHouseView from "@/components/dashboard/memory/agent-memory-house-view";
import ChatPanel from "@/components/dashboard/chat/chat-panel";
import PlannerView from "@/components/dashboard/planner/planner-view";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

export default function Main() {
  const hydrated = useKanbanStore((state) => state.hydrated);
  const nav = useUiStore((state) => state.nav);

  if (!hydrated) return <BoardSkeleton />;

  if (nav === "analytics") return <Overview />;
  if (nav === "chat") return <ChatPanel />;
  if (nav === "trends") return <AgentMemoryHouseView />;
  if (nav === "creative-space") return <CreativeSpaceView />;
  if (nav === "workspace") {
    return <PlannerView />;
  }

  return <Overview />;
}
