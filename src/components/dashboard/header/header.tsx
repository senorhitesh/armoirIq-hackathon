"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Button from "@/components/_ui/button";
import Menu from "@/components/_ui/menu";
import { Input } from "@/components/_ui/form";
import HeaderNotifications from "@/components/dashboard/header/header-notifications";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  AlignLeftIcon,
  ChevronRightIcon,
  FileIcon,
  StarIcon,
  DotsIcon,
  LinkIcon,
  CopyIcon,
  XCloseIcon,
  CubeIcon,
} from "@/components/_common/icons";

export default function Header() {
  const title = useKanbanStore((state) => state.title);
  const favorite = useKanbanStore((state) => state.favorite);
  const setTitle = useKanbanStore((state) => state.setTitle);
  const toggleFavorite = useKanbanStore((state) => state.toggleFavorite);
  const reset = useKanbanStore((state) => state.reset);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const nav = useUiStore((state) => state.nav);
  const toast = useUiStore((state) => state.toast);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(title);
  const [selectedAccount, setSelectedAccount] = useState("meta-ads-account");
  const [guardActive, setGuardActive] = useState(true);

  useEffect(() => {
    document.title = `${title} - ScaleFlow IQ`;
  }, [title]);

  const startRename = () => {
    setDraft(title);
    setRenaming(true);
  };

  const commitRename = () => {
    setRenaming(false);
    if (draft.trim() && draft.trim() !== title) {
      setTitle(draft);
      toast("Dashboard renamed");
    }
  };

  const onRenameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commitRename();
    if (event.key === "Escape") setRenaming(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard");
    } catch {
      toast("Couldn't copy the link");
    }
  };

  return (
    <header className="border-border flex items-center justify-between gap-3 border-b bg-card/60 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden"
        >
          <AlignLeftIcon className="size-3.5" aria-hidden />
        </Button>

        {/* Wireframe: meta-ads-account Account Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                toast(`Switched context to ${e.target.value}`);
              }}
              className="appearance-none cursor-pointer rounded-lg border border-border bg-background px-3 py-1.5 pr-8 text-xs font-semibold text-foreground tracking-tight shadow-xs hover:border-border/80 focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="meta-ads-account">meta-ads-account</option>
              <option value="linkedin-b2b-growth">linkedin-b2b-growth</option>
              <option value="youtube-shorts-scale">youtube-shorts-scale</option>
            </select>
            <ChevronRightIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground rotate-90" />
          </div>
        </div>

        {/* Breadcrumbs & Title */}
        <nav
          aria-label="Breadcrumb"
          className="hidden md:flex min-w-0 items-center gap-2 border-l border-border pl-3"
        >
          <span className="text-muted-foreground text-xs font-medium">
            ScaleFlow IQ
          </span>
          <ChevronRightIcon
            aria-hidden
            className="text-muted-foreground size-3"
          />
          {renaming ? (
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitRename}
              onKeyDown={onRenameKey}
              aria-label="Dashboard title"
              autoFocus
              className="h-[28px] max-w-[280px] text-xs"
            />
          ) : (
            <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
              {nav === "analytics" ? "Meta Ads Analytics" : title}
            </span>
          )}

          <div className="divide-border flex shrink-0 divide-x overflow-hidden rounded-md border border-border bg-background">
            <Button
              variant="ghost"
              size="icon"
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={favorite}
              onClick={() => {
                toggleFavorite();
                toast(favorite ? "Removed from favorites" : "Added to favorites");
              }}
              className="h-6 w-6 rounded-none p-0"
            >
              <StarIcon
                aria-hidden
                className={cn(
                  "size-3 transition-colors duration-150",
                  favorite && "text-warning fill-current",
                )}
              />
            </Button>
            <Button
              ref={menuRef}
              variant="ghost"
              size="icon"
              aria-label="Dashboard options"
              aria-expanded={menuOpen}
              data-active={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="h-6 w-6 rounded-none p-0"
            >
              <DotsIcon className="size-3" aria-hidden />
            </Button>
          </div>

          <Menu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            anchorRef={menuRef}
            label="Dashboard options"
            items={[
              {
                id: "rename",
                label: "Rename dashboard",
                icon: <FileIcon className="size-3.5" />,
                onSelect: startRename,
              },
              {
                id: "copy",
                label: "Copy shareable link",
                icon: <CopyIcon className="size-3.5" />,
                onSelect: copyLink,
              },
              {
                id: "favorite",
                label: favorite ? "Remove favorite" : "Add to favorites",
                icon: <StarIcon className="size-3.5" />,
                onSelect: toggleFavorite,
              },
              { id: "sep", separator: true },
              {
                id: "reset",
                label: "Reset demo data",
                icon: <XCloseIcon className="size-3.5" />,
                danger: true,
                onSelect: () => {
                  reset();
                  toast("Demo data reset to initial state");
                },
              },
            ]}
          />
        </nav>
      </div>

      {/* Right Controls: Wireframe "No" / Guard toggle & Notifications */}
      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            setGuardActive(!guardActive);
            toast(guardActive ? "ArmorIQ Guard in permissive mode" : "ArmorIQ Zero-Trust Guard: ENFORCED");
          }}
          title="ArmorIQ Cryptographic Verification Guard"
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all shadow-2xs",
            guardActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "border-border bg-muted/60 text-muted-foreground hover:bg-muted"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              guardActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
            )}
          />
          <span>{guardActive ? "Zero-Trust Active" : "No Guard"}</span>
        </button>

        <Button
          variant="secondary"
          size="icon"
          aria-label="Copy link"
          onClick={copyLink}
          className="hidden sm:inline-flex h-8 w-8"
        >
          <LinkIcon className="size-3.5" aria-hidden />
        </Button>

        <HeaderNotifications />
      </div>
    </header>
  );
}
