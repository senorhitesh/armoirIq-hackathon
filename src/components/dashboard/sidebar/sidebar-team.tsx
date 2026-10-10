"use client";

import { useState } from "react";
import SidebarItem from "@/components/dashboard/sidebar/sidebar-item";
import StatusBadge from "@/components/_common/status-badge";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore, type NavId } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  UsersIcon,
  CopyIcon,
  CubeIcon,
  LayersIcon,
  ChevronRightIcon,
} from "@/components/_common/icons";

const children: { id: NavId; label: string; icon: typeof CopyIcon }[] = [
  { id: "team-issues", label: "Issues", icon: CopyIcon },
  { id: "team-projects", label: "Projects", icon: CubeIcon },
  { id: "team-views", label: "Views", icon: LayersIcon },
];

export default function SidebarTeam({ collapsed }: { collapsed: boolean }) {
  const teamName = useKanbanStore((state) => state.teamName);
  const nav = useUiStore((state) => state.nav);
  const setNav = useUiStore((state) => state.setNav);
  const [open, setOpen] = useState(true);
  const childActive = children.some((child) => child.id === nav);
  const expanded = open && !collapsed;

  return (
    <div className="flex flex-col">
      <SidebarItem
        label={teamName}
        collapsed={collapsed}
        active={collapsed && childActive}
        onClick={() => (collapsed ? setNav("team-issues") : setOpen((v) => !v))}
        aria-expanded={expanded}
        leading={<StatusBadge icon={UsersIcon} tone="info" />}
        trailing={
          <ChevronRightIcon
            aria-hidden
            className={cn(
              "text-icon ease-power3-in-out size-3.5 shrink-0 opacity-0 transition-[opacity,rotate] duration-200 group-hover/item:opacity-100",
              open && "rotate-90",
            )}
          />
        }
      />
      <div
        className={cn(
          "ease-smooth-in-out grid transition-[grid-template-rows] duration-200",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div inert={!expanded} className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-1 pt-1 pl-[22px]">
            {children.map((child, index) => (
              <div key={child.id} className="relative">
                <span
                  aria-hidden
                  className="border-border pointer-events-none absolute -top-1 -left-[7px] h-[calc(50%+4px)] w-2 rounded-bl-md border-b border-l"
                />
                {index < children.length - 1 && (
                  <span
                    aria-hidden
                    className="border-border pointer-events-none absolute top-1/2 -bottom-1 -left-[7px] border-l"
                  />
                )}
                <SidebarItem
                  icon={child.icon}
                  label={child.label}
                  active={nav === child.id}
                  onClick={() => setNav(child.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
