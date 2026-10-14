"use client";

import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import GlideMenu from "@/components/primitives/GlideMenu";
import { useUiStore, type NavId } from "@/stores/ui-store";
import { useChatStore } from "@/stores/chat-store";
import { ShieldCheck } from "lucide-react";

/* ─────────────────────────────────────────────────────────
 * SVG ICONS (Self-contained, pixel-perfect, zero missing deps)
 * ───────────────────────────────────────────────────────── */

type IconProps = { size?: number; className?: string };

function IconArrowBoxLeft({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconCheckmark1Small({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconChevronDownSmall({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconCrossSmall({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconEditBig({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconBarChart({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function IconChat({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconBrain({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
    </svg>
  );
}

function IconLayers({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconCalendar({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconMagnifyingGlass({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconPlusMedium({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconLogo({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconSettingsGear1({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconSidebarLeftArrow({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <path d="m14 15-3-3 3-3" />
    </svg>
  );
}

function IconUserAdd({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
 * OUR WORKSPACE CONFIGURATION & PANEL NAMES
 * ───────────────────────────────────────────────────────── */

const WORKSPACE = {
  key: "adloop",
  name: "AdLoop · ArmorIQ",
  monogram: "A",
  tag: "Marketing Ops",
};

export type SidebarRecent = {
  id: string;
  label: string;
  prompt?: string;
};

const DEFAULT_RECENTS: SidebarRecent[] = [
  { id: "black-friday", label: "Q4 Black Friday Hook Variations", prompt: "hey /linkedpost-123 create 3 variation based on /memory-linked-launch-post" },
  { id: "scaleflow", label: "ScaleFlow Viral TikTok Blueprint", prompt: "create 3 variation based on /memory-x-viral-thread" },
  { id: "linkedin", label: "LinkedIn Product Hunt Launch", prompt: "/view LinkedIn Launch Campaign" },
  { id: "audit", label: "ArmorIQ Cryptographic Audit", prompt: "/insights" },
  { id: "reels", label: "Instagram Reels Top CTR Hooks", prompt: "/score Instagram Reels Hook" },
  { id: "todos", label: "Urgent Approvals & Sign-offs", prompt: "/list pending" },
  { id: "restock", label: "Batch Restock & Sandbox Deploy", prompt: "/list" },
  { id: "competitor", label: "Competitor Benchmark Analysis", prompt: "/insights competitor marketing trends" },
];

const SIDEBAR_MOTION = {
  expandedWidth: 236,
  collapsedWidth: 54,
  duration: 260,
  copyDuration: 180,
  copyOffset: 8,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

const CHAT_SEARCH_MOTION = {
  duration: 180,
  closedWidth: 28,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

function GlideGroup({ children }: { children: ReactNode }) {
  return (
    <GlideMenu
      rowSelector="[data-row]"
      highlightClassName="sidebar-glide-highlight rounded-[7px] bg-hover-2"
      className="group/glide flex flex-col gap-px"
    >
      {children}
    </GlideMenu>
  );
}

function RailButton({
  icon,
  label,
  active = false,
  count,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  count?: string;
  onClick?: () => void;
}) {
  return (
    <button
      data-row
      type="button"
      onClick={onClick}
      className={`sidebar-row relative z-10 mx-2 flex h-8 items-center rounded-[8px] px-2 text-left cursor-pointer
        transition-[width,background-color,color,transform] duration-150 active:scale-[0.98]
        ${active ? "bg-hover-2 group-hover/glide:bg-transparent font-semibold" : ""}`}
    >
      <span className={`flex size-5 shrink-0 items-center justify-center ${active ? "text-primary" : "text-ink-2"}`}>
        {icon}
      </span>
      <span className={`sidebar-copy ml-1.5 min-w-0 flex-1 truncate text-[13.5px] font-medium ${active ? "text-ink font-semibold" : "text-ink-2"}`}>
        {label}
      </span>
      {count && (
        <span className="sidebar-copy mr-1 shrink-0 text-[11px] font-medium tabular-nums text-ink-3 px-1.5 py-0.5 rounded-full bg-field border border-line">
          {count}
        </span>
      )}
    </button>
  );
}

function WorkspaceMenu({
  position,
  onClose,
}: {
  position: { top: number; left: number };
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-workspace-menu
      className="fixed z-50 w-64 rounded-[14px] bg-surface p-1.5 shadow-overlay border border-line"
      style={{
        top: position.top,
        left: position.left,
        animation: "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both",
        transformOrigin: "top left",
      }}
    >
      <GlideMenu className="flex flex-col gap-px" highlightClassName="inset-x-0 rounded-[8px] bg-hover-2">
        <button
          data-menu-row
          type="button"
          onClick={onClose}
          className="relative z-10 flex h-10 w-full items-center gap-2 rounded-[8px] px-2 text-left cursor-pointer"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-primary text-[11px] font-semibold text-white shadow-xs">
            {WORKSPACE.monogram}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{WORKSPACE.name}</p>
            <p className="text-[10.5px] text-ink-3 font-mono">{WORKSPACE.tag}</p>
          </div>
          <span className="shrink-0 text-primary">
            <IconCheckmark1Small size={18} />
          </span>
        </button>
        <div className="my-1 h-px bg-line" />
        {[
          { label: "New Campaign Workspace", icon: <IconPlusMedium size={16} /> },
          { label: "ArmorIQ Policy Settings", icon: <IconSettingsGear1 size={16} /> },
          { label: "Invite Team Members", icon: <IconUserAdd size={16} /> },
        ].map((item) => (
          <button
            key={item.label}
            data-menu-row
            type="button"
            onClick={onClose}
            className="relative z-10 flex h-8.5 w-full items-center gap-2 rounded-[8px] px-2 text-left hover:bg-hover-2 transition-colors cursor-pointer"
          >
            <span className="flex size-5 shrink-0 items-center justify-center text-ink-2">{item.icon}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{item.label}</span>
          </button>
        ))}
        <div className="my-1 h-px bg-line" />
        <button
          data-menu-row
          type="button"
          onClick={onClose}
          className="relative z-10 flex h-8.5 w-full items-center gap-2 rounded-[8px] px-2 text-left hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
        >
          <span className="flex size-5 shrink-0 items-center justify-center text-rose-600">
            <IconArrowBoxLeft size={16} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium">Switch Account / Sign out</span>
        </button>
      </GlideMenu>
    </div>,
    document.body,
  );
}

export type SidebarNavProps = {
  className?: string;
  fill?: boolean;
  onNewChat?: () => void;
  recents?: SidebarRecent[];
};

export default function SidebarNav({
  className = "",
  fill = true,
  onNewChat,
  recents = DEFAULT_RECENTS,
}: SidebarNavProps) {
  const nav = useUiStore((state) => state.nav);
  const setNav = useUiStore((state) => state.setNav);
  const setTab = useUiStore((state) => state.setTab);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleCollapsed = useUiStore((state) => state.toggleSidebarCollapsed);
  const openDialog = useUiStore((state) => state.openDialog);

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspacePosition, setWorkspacePosition] = useState({ top: 0, left: 0 });
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const workspaceButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const visibleRecents = recents.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  /* Our application's core panels */
  const PANELS: { key: NavId | "invite"; label: string; icon: ReactNode; count?: string }[] = [
    { key: "analytics", label: "Dashboard", icon: <IconBarChart size={18} /> },
    { key: "chat", label: "AI Command", icon: <IconChat size={18} /> },
    { key: "trends", label: "Memory House", icon: <IconBrain size={18} />, count: "12" },
    { key: "creative-space", label: "Creative Space", icon: <IconLayers size={18} /> },
    { key: "workspace", label: "Schedule", icon: <IconCalendar size={18} /> },
    { key: "invite", label: "Invite users", icon: <IconUserAdd size={18} />, count: "3/10" },
  ];

  const handleSelectNav = (key: NavId | "invite") => {
    if (key === "invite") {
      openDialog({ type: "invite" });
      return;
    }
    setNav(key);
    if (key === "analytics") {
      setTab("overview");
    } else if (key === "workspace") {
      setTab("issues");
    }
  };

  useEffect(() => {
    if (!workspaceOpen) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-workspace-trigger]") && !target.closest("[data-workspace-menu]")) {
        setWorkspaceOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [workspaceOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleCollapseToggle = () => {
    toggleCollapsed();
    setWorkspaceOpen(false);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <aside
      data-sidebar-collapsed={collapsed}
      aria-label="Workspace navigation"
      className={`relative flex shrink-0 overflow-hidden select-none border-r border-line bg-sidebar transition-[width] ${
        fill ? "h-full" : "h-[640px]"
      } ${className}`}
      style={{
        width: collapsed ? SIDEBAR_MOTION.collapsedWidth : SIDEBAR_MOTION.expandedWidth,
        transitionDuration: `${SIDEBAR_MOTION.duration}ms`,
        transitionTimingFunction: SIDEBAR_MOTION.easing,
        "--sidebar-copy-duration": `${SIDEBAR_MOTION.copyDuration}ms`,
        "--sidebar-copy-offset": `${SIDEBAR_MOTION.copyOffset}px`,
        "--sidebar-easing": SIDEBAR_MOTION.easing,
      } as CSSProperties}
    >
      <div className="flex min-h-0 w-[236px] shrink-0 flex-col py-2">
        {/* Workspace Switcher & Collapse Toggle */}
        <div className="relative mb-2 h-10 shrink-0">
          <button
            ref={workspaceButtonRef}
            data-workspace-trigger
            type="button"
            aria-expanded={workspaceOpen}
            aria-hidden={collapsed}
            tabIndex={collapsed ? -1 : 0}
            onClick={() => {
              if (!workspaceOpen && workspaceButtonRef.current) {
                const rect = workspaceButtonRef.current.getBoundingClientRect();
                setWorkspacePosition({ top: rect.bottom + 6, left: rect.left });
              }
              setWorkspaceOpen((open) => !open);
            }}
            className="sidebar-workspace-control absolute left-2 top-1 flex h-8 w-[176px] items-center rounded-[8px] px-2 text-left transition-[background-color,transform] duration-100 hover:bg-hover-2 active:scale-[0.99] cursor-pointer"
          >
            <span className="sidebar-logo flex size-5.5 shrink-0 items-center justify-center text-primary">
              <IconLogo size={18} />
            </span>
            <span className="sidebar-copy ml-1.5 min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink">
              {WORKSPACE.name}
            </span>
            <span className="sidebar-copy ml-1 flex shrink-0 text-ink-3">
              <IconChevronDownSmall size={16} />
            </span>
          </button>

          {workspaceOpen && <WorkspaceMenu position={workspacePosition} onClose={() => setWorkspaceOpen(false)} />}

          {/* Collapse button when expanded */}
          <button
            type="button"
            aria-label="Collapse sidebar"
            aria-hidden={collapsed}
            tabIndex={collapsed ? -1 : 0}
            onClick={handleCollapseToggle}
            className="sidebar-collapse-control absolute right-2 top-1 flex size-8 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color] duration-150 hover:bg-hover-2 hover:text-ink cursor-pointer"
          >
            <IconSidebarLeftArrow size={18} />
          </button>

          {/* Expand button when collapsed */}
          <button
            type="button"
            aria-label="Expand sidebar"
            aria-hidden={!collapsed}
            tabIndex={collapsed ? 0 : -1}
            onClick={handleCollapseToggle}
            className="sidebar-expand-control absolute left-2 top-0.5 flex size-9 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color] duration-150 hover:bg-hover-2 hover:text-ink cursor-pointer"
          >
            <IconSidebarLeftArrow size={18} className="rotate-180" />
          </button>
        </div>

        {/* Primary Panels Navigation */}
        <GlideGroup>
          <RailButton
            icon={<IconEditBig size={18} />}
            label="New prompt / chat"
            onClick={() => {
              setNav("chat");
              setSelectedTitle(null);
              useChatStore.getState().setInputValue("");
              onNewChat?.();
            }}
          />
          {PANELS.map((item) => (
            <RailButton
              key={item.key}
              icon={item.icon}
              label={item.label}
              count={item.count}
              active={nav === item.key}
              onClick={() => handleSelectNav(item.key)}
            />
          ))}
        </GlideGroup>

        {/* Searchable Chat History Section */}
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-0.5">
          <div className="sidebar-copy relative mx-2 mb-1.5 h-8">
            <div
              aria-hidden={searchOpen}
              className={`absolute inset-0 flex items-center gap-1.5 px-2 text-[12px] font-semibold uppercase tracking-wider text-ink-3 transition-[opacity,transform] ${
                searchOpen ? "pointer-events-none -translate-x-1 opacity-0" : "translate-x-0 opacity-100"
              }`}
              style={{
                transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms`,
                transitionTimingFunction: CHAT_SEARCH_MOTION.easing,
              }}
            >
              <IconChevronDownSmall size={14} />
              <span>Recent Chats</span>
            </div>

            <button
              type="button"
              aria-label="Search chats"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className={`absolute right-0 top-0 z-10 flex size-8 items-center justify-center rounded-[8px] text-ink-3 transition-[opacity,background-color,color,transform] hover:bg-hover-2 hover:text-ink active:scale-[0.96] cursor-pointer ${
                searchOpen ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
              style={{ transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms` }}
            >
              <IconMagnifyingGlass size={16} />
            </button>

            {/* Expanding Search Bar */}
            <div
              className={`absolute right-0 top-0 z-20 flex h-8 items-center overflow-hidden rounded-[8px] bg-field text-ink-3 shadow-hairline transition-[width,opacity] focus-within:text-ink-2 ${
                searchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
              style={{
                width: searchOpen ? "100%" : CHAT_SEARCH_MOTION.closedWidth,
                transitionDuration: `${CHAT_SEARCH_MOTION.duration}ms`,
                transitionTimingFunction: CHAT_SEARCH_MOTION.easing,
              }}
            >
              <span className="ml-2 flex shrink-0 items-center justify-center">
                <IconMagnifyingGlass size={15} />
              </span>
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Search history…"
                aria-label="Search chat history"
                className="ml-1.5 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink outline-none placeholder:text-ink-3"
              />
              <button
                type="button"
                aria-label="Close chat search"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-[8px] text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover-2 hover:text-ink active:scale-[0.96] cursor-pointer"
              >
                <IconCrossSmall size={16} />
              </button>
            </div>
          </div>

          <GlideGroup>
            {visibleRecents.map((item) => {
              const active = item.label === selectedTitle;
              return (
                <button
                  key={item.id}
                  data-row
                  type="button"
                  title={item.label}
                  onClick={() => {
                    setNav("chat");
                    setSelectedTitle(item.label);
                    if (item.prompt) {
                      useChatStore.getState().setInputValue(item.prompt);
                    }
                  }}
                  className={`sidebar-row relative z-10 mx-2 flex h-8 items-center rounded-[8px] px-2 text-left cursor-pointer transition-[width,background-color,color,transform] duration-150 active:scale-[0.98] ${
                    active ? "bg-hover-2 group-hover/glide:bg-transparent font-semibold" : ""
                  }`}
                >
                  <span
                    className={`sidebar-copy min-w-0 flex-1 truncate text-[13px] font-medium ${
                      active ? "text-ink font-semibold" : "text-ink-2"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
            {query && visibleRecents.length === 0 && (
              <div className="sidebar-copy mx-2 px-2 py-2 text-[12px] text-ink-3">
                No chats found
              </div>
            )}
          </GlideGroup>
        </div>

        {/* Footer Policy Badge / Call to action */}
        <div className="sidebar-copy mx-2 mt-auto w-[220px] border-t border-line pt-2.5">
          <button
            type="button"
            onClick={() => {
              setNav("chat");
              useChatStore.getState().processCommand("/insights");
            }}
            className="flex h-8.5 w-full items-center justify-center gap-1.5 rounded-control bg-hover-2 text-[12px] font-semibold text-ink transition-[background-color,transform] duration-150 hover:bg-line-strong active:scale-[0.98] cursor-pointer"
          >
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>ArmorIQ Active</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
