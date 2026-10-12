import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Column, Member, Priority, Task, Activity } from "@/lib/kanban";

interface KanbanState {
  teamName: string;
  title: string;
  favorite: boolean;
  columns: Column[];
  tasks: Task[];
  members: Member[];
  activity: Activity[];
  githubConnected: boolean;
  hydrated: boolean;
  setTitle: (title: string) => void;
  toggleFavorite: () => void;
  reset: () => void;
  toggleGithub: () => void;
  moveTask: (taskId: string, targetColumnId: string, beforeIdOrOrder?: string | number | null) => void;
  addTask: (task: Partial<Task>) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  importTasks: (tasks: any, columnId?: string) => number;
  addMember: (member: Partial<Member> | string) => void;
  toggleColumnHidden: (columnId: string) => void;
  setColumnHidden: (columnId: string, hidden: boolean) => void;
  showAllColumns: () => void;
  renameColumn: (columnId: string, name: string) => void;
  sortColumn: (columnId: string, sortType?: any) => void;
  reorderColumns: (columnIds: string[]) => void;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "col-drafts", title: "Ad Drafts", name: "Ad Drafts", kind: "todo" },
  { id: "col-review", title: "Pending Approval", name: "Pending Approval", kind: "in-progress" },
  { id: "col-approved", title: "Approved by Lead", name: "Approved by Lead", kind: "in-progress" },
  { id: "col-scheduled", title: "Scheduled (Sandbox)", name: "Scheduled (Sandbox)", kind: "done" },
  { id: "col-published", title: "Live Published", name: "Live Published", kind: "done" },
];

const DEFAULT_MEMBERS: Member[] = [
  { id: "user-1", name: "Alex (Strategist)", role: "Lead Strategist" },
  { id: "user-2", name: "Sarah (Creator)", role: "Ad Copywriter" },
  { id: "user-3", name: "David (Account Mgr)", role: "Approver" },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: "task-101",
    title: "ScaleFlow Q4 Contrarian LinkedIn Ad",
    description: "Challenges standard CAC dogma; scored 88/100 virality with high confidence.",
    columnId: "col-scheduled",
    priority: "urgent",
    assigneeIds: ["user-2"],
    dueDate: "2026-10-12",
    createdAt: "2026-10-09",
    tags: ["LinkedIn", "B2B SaaS", "Governed"],
    order: 0,
    metadata: {
      platform: "linkedin",
      viralityScore: 88,
      planRef: "plan_approved_4920"
    }
  },
  {
    id: "task-102",
    title: "Meta Short-Form Script: 3-Second Hook",
    description: "Urgency hook teardown script awaiting account manager approval flag.",
    columnId: "col-review",
    priority: "normal",
    assigneeIds: ["user-1", "user-2"],
    dueDate: "2026-10-14",
    createdAt: "2026-10-10",
    tags: ["Meta Ads", "Shorts", "Approval Gate"],
    order: 1,
    metadata: {
      platform: "instagram",
      viralityScore: 79
    }
  },
  {
    id: "task-103",
    title: "YouTube Shorts: The Costly Rogue Agent Mistake",
    description: "Story vulnerability hook draft analyzing rogue AI ad budget leaks.",
    columnId: "col-drafts",
    priority: "low",
    assigneeIds: ["user-2"],
    dueDate: "2026-10-15",
    createdAt: "2026-10-10",
    tags: ["YouTube", "Story", "Creator Agent"],
    order: 2,
    metadata: {
      platform: "youtube",
      viralityScore: 84
    }
  },
];

const DEFAULT_ACTIVITY: Activity[] = [
  { id: "act-1", user: "Alex (Strategist)", text: "Created campaign brief for Q4 launch", at: "2026-10-11T14:00:00.000Z", taskId: "task-101" },
  { id: "act-2", user: "Sarah (Creator)", text: "Submitted Meta 3-Second Hook for review", at: "2026-10-11T11:00:00.000Z", taskId: "task-102" },
  { id: "act-3", user: "ArmorIQ Engine", text: "Cryptographic policy verified: Budget threshold within sandbox bounds", at: "2026-10-11T04:00:00.000Z" },
];

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      teamName: "ScaleFlow Ad Operations",
      title: "ScaleFlow Q4 Campaign Sprint",
      favorite: false,
      columns: DEFAULT_COLUMNS,
      tasks: DEFAULT_TASKS,
      members: DEFAULT_MEMBERS,
      activity: DEFAULT_ACTIVITY,
      githubConnected: true,
      hydrated: true,
      setTitle: (title) => set({ title }),
      toggleFavorite: () => set((state) => ({ favorite: !state.favorite })),
      reset: () =>
        set({
          columns: DEFAULT_COLUMNS,
          tasks: DEFAULT_TASKS,
          members: DEFAULT_MEMBERS,
          activity: DEFAULT_ACTIVITY,
          githubConnected: true,
          hydrated: true,
          title: "ScaleFlow Q4 Campaign Sprint",
          favorite: false,
        }),
      toggleGithub: () => set((state) => ({ githubConnected: !state.githubConnected })),
      moveTask: (taskId, targetColumnId, beforeIdOrOrder) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  columnId: targetColumnId,
                  order: typeof beforeIdOrOrder === "number" ? beforeIdOrOrder : task.order,
                }
              : task
          ),
        })),
      addTask: (taskData) =>
        set((state) => {
          const newTask: Task = {
            id: `task-${Date.now()}`,
            title: taskData.title || "Untitled Ad Task",
            description: taskData.description || "",
            columnId: taskData.columnId || state.columns[0].id,
            priority: taskData.priority || "normal",
            assigneeIds: taskData.assigneeIds || ["user-1"],
            dueDate: taskData.dueDate || null,
            tags: taskData.tags || ["AdLoop"],
            order: state.tasks.length,
            createdAt: new Date().toISOString(),
            metadata: taskData.metadata || {},
          };
          return { tasks: [...state.tasks, newTask] };
        }),
      updateTask: (taskId, patch) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...patch } : task
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
      importTasks: (linesOrTasks, columnId) => {
        let count = 0;
        set((state) => {
          const list = Array.isArray(linesOrTasks) ? linesOrTasks : [];
          const formatted = list.map((item: any, idx: number) => {
            count++;
            if (typeof item === "string") {
              return {
                id: `task-${Date.now()}-${idx}`,
                title: item,
                description: "",
                columnId: columnId || state.columns[0].id,
                priority: "normal" as const,
                assigneeIds: ["user-1"],
                dueDate: null,
                tags: ["Imported"],
                order: state.tasks.length + idx,
                createdAt: new Date().toISOString(),
                metadata: {},
              };
            }
            return {
              id: `task-${Date.now()}-${idx}`,
              title: item.title || "Imported Task",
              description: item.description || "",
              columnId: item.columnId || columnId || state.columns[0].id,
              priority: item.priority || "normal",
              assigneeIds: item.assigneeIds || ["user-1"],
              dueDate: item.dueDate || null,
              tags: item.tags || ["Imported"],
              order: state.tasks.length + idx,
              createdAt: new Date().toISOString(),
              metadata: item.metadata || {},
            };
          });
          return { tasks: [...state.tasks, ...formatted] };
        });
        return count;
      },
      addMember: (member) =>
        set((state) => {
          const memberObj = typeof member === "string" ? { name: member } : member;
          return {
            members: [
              ...state.members,
              {
                id: `user-${Date.now()}`,
                name: memberObj.name || "New Member",
                role: memberObj.role || "Contributor",
                avatar: memberObj.avatar,
                email: memberObj.email,
              },
            ],
          };
        }),
      toggleColumnHidden: (columnId) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, hidden: !col.hidden } : col
          ),
        })),
      setColumnHidden: (columnId, hidden) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, hidden } : col
          ),
        })),
      showAllColumns: () =>
        set((state) => ({
          columns: state.columns.map((col) => ({ ...col, hidden: false })),
        })),
      renameColumn: (columnId, name) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, name, title: name } : col
          ),
        })),
      sortColumn: (columnId) =>
        set((state) => {
          const colTasks = state.tasks.filter((t) => t.columnId === columnId);
          const otherTasks = state.tasks.filter((t) => t.columnId !== columnId);
          colTasks.sort((a, b) => a.title.localeCompare(b.title));
          return { tasks: [...otherTasks, ...colTasks] };
        }),
      reorderColumns: (columnIds) =>
        set((state) => {
          const map = new Map(state.columns.map((c) => [c.id, c]));
          const reordered = columnIds.map((id) => map.get(id)!).filter(Boolean);
          return { columns: reordered };
        }),
    }),
    {
      name: "adloop-kanban-store",
      skipHydration: true,
    }
  )
);
