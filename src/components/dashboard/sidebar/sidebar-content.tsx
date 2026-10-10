"use client";

import SidebarItem, {
  sidebarFade,
} from "@/components/dashboard/sidebar/sidebar-item";
import SidebarTeam from "@/components/dashboard/sidebar/sidebar-team";
import Button from "@/components/_ui/button";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  Logo,
  AlignLeftIcon,
  InboxIcon,
  GridIcon,
  CubeIcon,
  LayersIcon,
  DotsIcon,
  ShareIcon,
  UserPlusIcon,
  LinkIcon,
  ArrowLeftIcon,
  HelpIcon,
  BarChartIcon,
} from "@/components/_common/icons";

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
  const openDialog = useUiStore((state) => state.openDialog);
  const toast = useUiStore((state) => state.toast);
  const githubConnected = useKanbanStore((state) => state.githubConnected);
  const toggleGithub = useKanbanStore((state) => state.toggleGithub);

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
              ScaleFlow IQ
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              ArmorIQ Governed
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

      {/* Main Wireframe Navigation Section */}
      <nav
        aria-label="Core Navigation"
        className="border-slate-200 flex flex-col gap-1.5 border-b p-3"
      >
        <SidebarLabel collapsed={collapsed}>Main Apps</SidebarLabel>

        {/* 1. workspace (Kanban / Campaign Board) */}
        <SidebarItem
          icon={GridIcon}
          label="workspace"
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

        {/* 2. Analytics (Ads Metrics Dashboard - Image 1 active item) */}
        <SidebarItem
          icon={BarChartIcon}
          label="Analytics"
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

        {/* 3. CREATIVE SPACE (Multi-Agent Creative Studio) */}
        <SidebarItem
          icon={CubeIcon}
          label="CREATIVE SPACE"
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
      </nav>

      {/* Campaign Views / Teams */}
      <nav
        aria-label="Workspace"
        className="border-slate-200 flex flex-col gap-4 border-b p-3"
      >
        <div className="flex flex-col gap-1">
          <SidebarLabel collapsed={collapsed}>Pipeline & Queues</SidebarLabel>
          <SidebarItem
            icon={InboxIcon}
            label="Approvals Queue"
            collapsed={collapsed}
            active={nav === "inbox"}
            onClick={() => setNav("inbox")}
          />
          <SidebarItem
            icon={LayersIcon}
            label="Campaign Views"
            collapsed={collapsed}
            active={nav === "views"}
            onClick={() => setNav("views")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <SidebarLabel collapsed={collapsed}>Agent Teams</SidebarLabel>
          <SidebarTeam collapsed={collapsed} />
        </div>
      </nav>

      {/* Tools & Integrations */}
      <div className="scroll-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        <SidebarLabel collapsed={collapsed}>Integrations</SidebarLabel>
        <SidebarItem
          icon={ShareIcon}
          label="Export Reports"
          collapsed={collapsed}
          onClick={() => toast("Exported ad metrics CSV")}
        />
        <SidebarItem
          icon={UserPlusIcon}
          label="Invite Team"
          collapsed={collapsed}
          onClick={() => openDialog({ type: "invite" })}
        />
      </div>
    </div>
  );
}
