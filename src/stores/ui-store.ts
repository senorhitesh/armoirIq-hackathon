import { create } from "zustand";
import type { Priority } from "@/lib/kanban";

export type Tab = "overview" | "updates" | "issues";

export type NavId =
  | "analytics"
  | "chat"
  | "trends"
  | "creative-space"
  | "workspace";

export type Display = {
  priority: boolean;
  assignees: boolean;
  due: boolean;
  tags: boolean;
  created: boolean;
  showPriority: boolean;
  showDueDate: boolean;
  showAssignee: boolean;
  showTags: boolean;
};

export const DISPLAY_OPTIONS = [
  { key: "showPriority" as const, label: "Priority" },
  { key: "showDueDate" as const, label: "Due date" },
  { key: "showAssignee" as const, label: "Assignee" },
  { key: "showTags" as const, label: "Tags" },
];

export type Filter = {
  priority?: Priority | null;
  assigneeId?: string | null;
  overdue?: boolean;
};

export function isFilterActive(filter: Filter): boolean {
  return Boolean(filter.priority || filter.assigneeId || filter.overdue);
}

export type DialogState = { type: string; [key: string]: any } | null;

interface UiState {
  tab: Tab;
  setTab: (tab: Tab) => void;
  nav: NavId;
  setNav: (nav: NavId) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  dialog: DialogState;
  dialogSession: any;
  setDialogSession: (session: any) => void;
  openDialog: (dialog: DialogState) => void;
  closeDialog: () => void;
  filter: Filter;
  setFilter: (patch: Partial<Filter>) => void;
  clearFilter: () => void;
  search: string;
  setSearch: (q: string) => void;
  display: Display;
  setDisplay: (patch: Partial<Display>) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  panelSheetOpen: boolean;
  setPanelSheetOpen: (open: boolean) => void;
  notificationsSeenAt: string | null;
  markNotificationsSeen: () => void;
  toastMessage: string | null;
  toasts: Array<{ id: string; title: string }>;
  toast: (message: string) => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  tab: "overview",
  setTab: (tab) => set({ tab }),
  nav: "analytics",
  setNav: (nav) => set({ nav }),
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  sidebarCollapsed: false,
  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  dialog: null,
  dialogSession: null,
  setDialogSession: (dialogSession) => set({ dialogSession }),
  openDialog: (dialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),
  filter: {},
  setFilter: (patch) =>
    set((state) => ({ filter: { ...state.filter, ...patch } })),
  clearFilter: () => set({ filter: {} }),
  search: "",
  setSearch: (search) => set({ search }),
  display: {
    priority: true,
    assignees: true,
    due: true,
    tags: true,
    created: true,
    showPriority: true,
    showDueDate: true,
    showAssignee: true,
    showTags: true,
  },
  toasts: [],
  setDisplay: (patch) =>
    set((state) => {
      const merged = { ...state.display, ...patch };
      if ("priority" in patch) merged.showPriority = Boolean(patch.priority);
      if ("showPriority" in patch)
        merged.priority = Boolean(patch.showPriority);
      if ("assignees" in patch) merged.showAssignee = Boolean(patch.assignees);
      if ("showAssignee" in patch)
        merged.assignees = Boolean(patch.showAssignee);
      if ("due" in patch) merged.showDueDate = Boolean(patch.due);
      if ("showDueDate" in patch) merged.due = Boolean(patch.showDueDate);
      if ("tags" in patch) merged.showTags = Boolean(patch.tags);
      if ("showTags" in patch) merged.tags = Boolean(patch.showTags);
      return { display: merged };
    }),
  panelOpen: false,
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  panelSheetOpen: false,
  setPanelSheetOpen: (panelSheetOpen) => set({ panelSheetOpen }),
  notificationsSeenAt: null,
  markNotificationsSeen: () =>
    set({ notificationsSeenAt: new Date().toISOString() }),
  toastMessage: null,
  toast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3000);
  },
  clearToast: () => set({ toastMessage: null }),
}));
