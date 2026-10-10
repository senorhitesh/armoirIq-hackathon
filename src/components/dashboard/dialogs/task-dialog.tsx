"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import Dialog from "@/components/_ui/dialog";
import { Field, Input, Textarea } from "@/components/_ui/form";
import { COLUMN_META, PRIORITY_COLOR } from "@/components/_common/column-meta";
import StatusBadge from "@/components/_common/status-badge";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { PRIORITIES, type Priority } from "@/lib/kanban";
import { formatShort } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { BarChartIcon, UserIcon } from "@/components/_common/icons";

type TaskDialogProps = {
  open: boolean;
  taskId: string | null;
  columnId: string | null;
};

type Draft = {
  title: string;
  description: string;
  columnId: string;
  priority: Priority;
  assigneeIds: string[];
  dueDate: string;
};

export default function TaskDialog({
  open,
  taskId,
  columnId,
}: TaskDialogProps) {
  const tasks = useKanbanStore((state) => state.tasks);
  const columns = useKanbanStore((state) => state.columns);
  const members = useKanbanStore((state) => state.members);
  const addTask = useKanbanStore((state) => state.addTask);
  const updateTask = useKanbanStore((state) => state.updateTask);
  const deleteTask = useKanbanStore((state) => state.deleteTask);
  const closeDialog = useUiStore((state) => state.closeDialog);
  const toast = useUiStore((state) => state.toast);
  const [task] = useState(() =>
    taskId ? tasks.find((item) => item.id === taskId) : undefined,
  );
  const editing = Boolean(task);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(() =>
    task
      ? {
          title: task.title,
          description: task.description ?? "",
          columnId: task.columnId,
          priority: task.priority,
          assigneeIds: task.assigneeIds,
          dueDate: task.dueDate ?? "",
        }
      : {
          title: "",
          description: "",
          columnId:
            columnId ??
            columns.find((c) => !c.hidden)?.id ??
            columns[0]?.id ??
            "",
          priority: "normal",
          assigneeIds: [],
          dueDate: "",
        },
  );

  const patch = (next: Partial<Draft>) =>
    setDraft((current) => (current ? { ...current, ...next } : current));

  const toggleAssignee = (id: string) => {
    if (!draft) return;
    patch({
      assigneeIds: draft.assigneeIds.includes(id)
        ? draft.assigneeIds.filter((item) => item !== id)
        : [...draft.assigneeIds, id],
    });
  };

  const save = () => {
    if (!draft || !draft.title.trim()) return;
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      columnId: draft.columnId,
      priority: draft.priority,
      assigneeIds: draft.assigneeIds,
      dueDate: draft.dueDate || null,
    };
    if (task) {
      updateTask(task.id, payload);
      toast("Issue updated");
    } else {
      addTask(payload);
      toast("Issue created");
    }
    closeDialog();
  };

  const remove = () => {
    if (!task) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTask(task.id);
    toast("Issue deleted");
    closeDialog();
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      title={editing ? "Edit issue" : "New issue"}
      description={task ? `Created ${formatShort(task.createdAt)}` : undefined}
      footer={
        <>
          {editing && (
            <Button
              variant="danger"
              size="md"
              data-active={confirmDelete}
              onClick={remove}
              onBlur={() => setConfirmDelete(false)}
              className="mr-auto"
            >
              {confirmDelete ? "Confirm delete" : "Delete"}
            </Button>
          )}
          <Button variant="secondary" size="md" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={save}
            disabled={!draft?.title.trim()}
          >
            {editing ? "Save changes" : "Create issue"}
          </Button>
        </>
      }
    >
      {draft && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <Field label="Column">
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Column"
            >
              {columns.map((column) => {
                const meta = COLUMN_META[column.kind];
                const active = draft.columnId === column.id;
                return (
                  <Button
                    key={column.id}
                    role="radio"
                    aria-checked={active}
                    variant="chip"
                    size="md"
                    data-active={active}
                    title={
                      column.hidden
                        ? `${column.title || column.name} (hidden column)`
                        : undefined
                    }
                    onClick={() => patch({ columnId: column.id })}
                    className={cn(column.hidden && !active && "text-subtle")}
                  >
                    <StatusBadge icon={meta.icon} tone={meta.tone} />
                    {column.title || column.name}
                  </Button>
                );
              })}
            </div>
          </Field>
          <Field label="Title" htmlFor="task-title">
            <Input
              id="task-title"
              data-autofocus
              value={draft.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="What needs to be done?"
            />
          </Field>
          <Field label="Description" htmlFor="task-description">
            <Textarea
              id="task-description"
              value={draft.description}
              onChange={(event) => patch({ description: event.target.value })}
              placeholder="Add context, links or acceptance criteria"
            />
          </Field>
          <Field label="Priority">
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Priority"
            >
              {PRIORITIES.map((priority) => (
                <Button
                  key={priority.value}
                  role="radio"
                  aria-checked={draft.priority === priority.value}
                  variant="chip"
                  size="md"
                  data-active={draft.priority === priority.value}
                  onClick={() => patch({ priority: priority.value })}
                >
                  <BarChartIcon
                    aria-hidden
                    className={cn("size-3.5", PRIORITY_COLOR[priority.value])}
                  />
                  {priority.label}
                </Button>
              ))}
            </div>
          </Field>
          <Field label="Assignees">
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const active = draft.assigneeIds.includes(member.id);
                return (
                  <Button
                    key={member.id}
                    variant="chip"
                    size="md"
                    aria-pressed={active}
                    data-active={active}
                    onClick={() => toggleAssignee(member.id)}
                  >
                    <UserIcon
                      aria-hidden
                      className={cn(
                        "size-3.5",
                        active ? "text-foreground" : "text-icon",
                      )}
                    />
                    {member.name}
                  </Button>
                );
              })}
            </div>
          </Field>
          <Field label="Due date" htmlFor="task-due">
            <Input
              id="task-due"
              type="date"
              value={draft.dueDate}
              onChange={(event) => patch({ dueDate: event.target.value })}
            />
          </Field>
        </form>
      )}
    </Dialog>
  );
}
