"use client";

import TaskChips from "@/components/dashboard/board/task-chips";
import { COLUMN_META } from "@/components/_common/column-meta";
import type { Display } from "@/stores/ui-store";
import { crewLabel, type Column, type Member, type Task } from "@/lib/kanban";
import { formatShort } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type TaskCardViewProps = {
  task: Task;
  column: Column;
  members: Member[];
  teamName: string;
  display: Display;
  interactive?: boolean;
  lifted?: boolean;
  invisible?: boolean;
  className?: string;
};

export default function TaskCardView({
  task,
  column,
  members,
  teamName,
  display,
  interactive = false,
  lifted = false,
  invisible = false,
  className,
}: TaskCardViewProps) {
  const meta = COLUMN_META[column.kind];
  const Icon = meta.icon;
  const showFooter = display.priority || display.assignees || display.due;

  return (
    <div
      className={cn(
        "group/card shadow-card relative flex w-full flex-col overflow-clip rounded-2xl bg-white",
        lifted &&
          "shadow-card-lift animate-card-lift -rotate-4 motion-reduce:animate-none",
        invisible && "invisible",
        className,
      )}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start gap-1.5">
          <Icon
            aria-hidden
            className={cn("mt-[2px] size-3.5 shrink-0", meta.color)}
          />
          <h3 className="line-clamp-2 min-w-0 flex-1 break-words">
            {task.title}
          </h3>
        </div>
        {display.created && (
          <div className="text-subtle flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="whitespace-nowrap">
              Created {formatShort(task.createdAt)}
            </span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span
                aria-hidden
                className="size-[3px] rounded-full bg-[#d9d9d9]"
              />
              {crewLabel(task, teamName)}
            </span>
          </div>
        )}
      </div>
      {showFooter && (
        <div className="border-card-border flex flex-wrap items-center gap-2 border-t p-4">
          <TaskChips
            task={task}
            column={column}
            members={members}
            display={display}
            interactive={interactive}
          />
        </div>
      )}
    </div>
  );
}
