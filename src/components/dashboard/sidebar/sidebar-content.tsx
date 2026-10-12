"use client";

import SidebarItem, {
  sidebarFade,
} from "@/components/dashboard/sidebar/sidebar-item";
import Button from "@/components/_ui/button";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  Logo,
  AlignLeftIcon,
  GridIcon,
  CubeIcon,
  ChatIcon,
  BarChartIcon,
} from "@/components/_common/icons";
import { Flame } from "lucide-react";

type SidebarContentProps = {
  collapsed: boolean;
  onToggle: () => void;
  toggleLabel: string;
};

function SidebarLabel({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: string;
}) {
  return (
    <span
      data-collapsed={collapsed}
      className={cn(
        "label-style text-muted-foreground px-2 py-1 uppercase tracking-wider text-[11px] font-semibold whitespace-nowrap",
        sidebarFade,
      )}
    >
      {children}
    </span>
  );
}

export default function SidebarContent({
  collapsed,
  onToggle,
  toggleLabel,
}: SidebarContentProps) {
  const nav = useUiStore((state) => state.nav);
  const setNav = useUiStore((state) => state.setNav);
  const setTab = useUiStore((state) => state.setTab);

  return (
    <div className="flex h-full flex-col bg-sidebar select-none">
      {/* Brand Header */}
      <div
        className={cn(
          "border-slate-200 ease-smooth-in-out relative shrink-0 border-b transition-[height] duration-200",
          collapsed ? "h-[100px]" : "h-[64px]",
        )}
      >
        <div className="flex items-center gap-2.5 absolute top-3.5 left-3.5">
          <div className="size-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-xs">
            <Logo className="size-4 text-blue-600" />
          </div>
          <div
            data-collapsed={collapsed}
            className={cn(
              "flex flex-col transition-opacity duration-150",
              collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
            )}
          >
            <span className="font-semibold text-[14px] leading-tight text-foreground tracking-tight">
              AdLoop
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Marketing Workspace
            </span>
          </div>
        </div>

        <Button
          variant="secondary"
          size="icon"
          aria-label={toggleLabel}
          onClick={onToggle}
          className={cn(
            "shadow-ring ease-smooth-in-out absolute transition-[top,left] duration-200",
            collapsed ? "top-[54px] left-[15px]" : "top-3.5 left-[214px]",
          )}
        >
          <AlignLeftIcon
            aria-hidden
            className={cn(
              "text-icon ease-power3-in-out size-3.5 transition-transform duration-200",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Core Navigation */}
      <nav
        aria-label="Core Navigation"
        className="border-slate-200 flex flex-col gap-1.5 border-b p-3"
      >
        <SidebarLabel collapsed={collapsed}>Core</SidebarLabel>

        {/* 1. Dashboard / Analytics */}
        <SidebarItem
          icon={BarChartIcon}
          label="Dashboard"
          collapsed={collapsed}
          active={nav === "analytics"}
          className={cn(
            "font-medium rounded-lg transition-all",
            nav === "analytics" &&
              "bg-blue-50/90 text-blue-700 border border-blue-300 shadow-xs",
          )}
          onClick={() => {
            setNav("analytics");
            setTab("overview");
          }}
        />

        {/* 2. AI Chat */}
        <SidebarItem
          icon={ChatIcon}
          label="AI Chat"
          collapsed={collapsed}
          active={nav === "chat"}
          className={cn(
            "font-medium rounded-lg transition-all",
            nav === "chat" &&
              "bg-violet-50/80 text-violet-700 border border-violet-200/60 shadow-xs",
          )}
          onClick={() => {
            setNav("chat");
          }}
        />

        {/* 3. Trend Jacking */}
        <SidebarItem
          icon={Flame}
          label="Trend Jacking"
          collapsed={collapsed}
          active={nav === "trends"}
          className={cn(
            "font-medium rounded-lg transition-all",
            nav === "trends" &&
              "bg-orange-50/80 text-orange-700 border border-orange-200/60 shadow-xs",
          )}
          onClick={() => {
            setNav("trends");
          }}
        />

        {/* 4. Creative Workspace */}
        <SidebarItem
          icon={CubeIcon}
          label="Creative Space"
          collapsed={collapsed}
          active={nav === "creative-space"}
          className={cn(
            "font-medium rounded-lg transition-all",
            nav === "creative-space" &&
              "bg-blue-50/80 text-blue-700 border border-blue-200/60 shadow-xs",
          )}
          onClick={() => {
            setNav("creative-space");
          }}
        />

        {/* 5. Kanban Board */}
        <SidebarItem
          icon={GridIcon}
          label="Task Board"
          collapsed={collapsed}
          active={nav === "workspace"}
          className={cn(
            "font-medium rounded-lg transition-all",
            nav === "workspace" &&
              "bg-blue-50/80 text-blue-700 border border-blue-200/60 shadow-xs",
          )}
          onClick={() => {
            setNav("workspace");
            setTab("issues");
          }}
        />
      </nav>

      {/* Bottom spacer */}
      <div className="flex-1" />
    </div>
  );
}
