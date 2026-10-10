"use client";

import { useMemo, useRef, useState } from "react";
import Button from "@/components/_ui/button";
import Popover from "@/components/_ui/popover";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { isOverdue, timeAgo } from "@/lib/dates";
import type { Activity } from "@/lib/kanban";
import { BellIcon, CalendarIcon } from "@/components/_common/icons";

export default function HeaderNotifications() {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const tasks = useKanbanStore((state) => state.tasks);
  const columns = useKanbanStore((state) => state.columns);
  const activity = useKanbanStore((state) => state.activity);
  const seenAt = useUiStore((state) => state.notificationsSeenAt);
  const markSeen = useUiStore((state) => state.markNotificationsSeen);
  const openDialog = useUiStore((state) => state.openDialog);

  const overdue = useMemo(
    () =>
      tasks.filter((task) => {
        const column = columns.find((c) => c.id === task.columnId);
        return isOverdue(task.dueDate, column?.kind === "done");
      }),
    [tasks, columns],
  );
  const unseen = (activity || []).some((item: Activity) => !seenAt || item.at > seenAt);

  const toggle = () => {
    if (!open) markSeen();
    setOpen((value) => !value);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        variant="secondary"
        size="icon"
        aria-label="Notifications"
        aria-expanded={open}
        data-active={open}
        onClick={toggle}
        className="relative"
      >
        <BellIcon className="size-3.5" aria-hidden />
        {(unseen || overdue.length > 0) && (
          <span
            aria-hidden
            className="bg-danger absolute top-1.5 right-1.5 size-1.5 rounded-full"
          />
        )}
      </Button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        label="Notifications"
        className="w-[320px] p-2"
      >
        <div className="flex flex-col gap-2">
          {overdue.length > 0 && (
            <div className="flex flex-col">
              <span className="label-style text-danger px-2 pt-1 pb-1.5 font-medium">
                Overdue issues ({overdue.length})
              </span>
              {overdue.slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openDialog({ type: "task", taskId: task.id });
                  }}
                  className="hover:bg-muted-hover flex items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors duration-150"
                >
                  <span className="text-foreground min-w-0 flex-1 truncate">
                    {task.title}
                  </span>
                  <span className="text-danger flex shrink-0 items-center gap-1 text-[12px]">
                    <CalendarIcon aria-hidden className="size-3" />
                    Overdue
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col">
            <span className="label-style text-muted-foreground px-2 pt-2 pb-1.5">
              Recent activity
            </span>
            {(!activity || activity.length === 0) && (
              <p className="text-subtle px-2 py-2">Nothing has happened yet.</p>
            )}
            {(activity || []).slice(0, 8).map((item: Activity) => (
              <div key={item.id} className="flex gap-2 px-2 py-1.5">
                <span
                  aria-hidden
                  className="bg-icon mt-[7px] size-1.5 shrink-0 rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-[13px]">{item.text}</p>
                  <span className="text-subtle text-[11px]">
                    {timeAgo(item.at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popover>
    </>
  );
}
