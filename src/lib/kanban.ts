export const CURRENT_USER_ID = "user-1";

export type Priority = "urgent" | "normal" | "low";

export type ColumnKind = 
  | "todo" 
  | "in-progress" 
  | "done" 
  | "backlog" 
  | "canceled" 
  | "duplicated";

export interface Column {
  id: string;
  title: string;
  name?: string; // for compatibility with legacy components
  kind: ColumnKind;
  hidden?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority: Priority;
  assigneeIds: string[];
  dueDate?: string | null;
  tags?: string[];
  order?: number;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface Activity {
  id: string;
  user: string;
  text: string;
  at: string;
  taskId?: string;
}

export const PRIORITIES: Array<{ value: Priority; label: string }> = [
  { value: "urgent", label: "Urgent" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

export function memberLabel(memberOrTask?: any, membersList?: Member[]): string {
  if (!memberOrTask) return "Unassigned";
  if (Array.isArray(membersList) && memberOrTask?.assigneeIds) {
    const assigned = membersList.filter((m) => memberOrTask.assigneeIds.includes(m.id));
    if (assigned.length === 0) return "Unassigned";
    if (assigned.length === 1) return assigned[0].name;
    return `${assigned[0].name} +${assigned.length - 1}`;
  }
  if (memberOrTask?.name) return memberOrTask.name;
  return "Unassigned";
}

export function crewLabel(membersOrTask?: any, teamNameOrMembers?: any): string {
  if (typeof teamNameOrMembers === "string") return teamNameOrMembers;
  if (Array.isArray(membersOrTask)) {
    if (membersOrTask.length === 0) return "Unassigned";
    if (membersOrTask.length === 1) return membersOrTask[0].name;
    return `${membersOrTask[0].name} +${membersOrTask.length - 1}`;
  }
  return "ScaleFlow Team";
}
