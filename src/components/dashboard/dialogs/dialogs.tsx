"use client";

import TaskDialog from "@/components/dashboard/dialogs/task-dialog";
import ImportDialog from "@/components/dashboard/dialogs/import-dialog";
import InviteDialog from "@/components/dashboard/dialogs/invite-dialog";
import HelpDialog from "@/components/dashboard/dialogs/help-dialog";
import { useUiStore } from "@/stores/ui-store";

export default function Dialogs() {
  const dialog = useUiStore((state) => state.dialog);
  const session = useUiStore((state) => state.dialogSession);
  const taskId = dialog?.type === "task" ? dialog.taskId : null;
  const columnId =
    dialog?.type === "new-task" ? (dialog.columnId ?? null) : null;

  return (
    <>
      <TaskDialog
        key={`task-${session}`}
        open={dialog?.type === "task" || dialog?.type === "new-task"}
        taskId={taskId}
        columnId={columnId}
      />
      <ImportDialog
        key={`import-${session}`}
        open={dialog?.type === "import"}
      />
      <InviteDialog
        key={`invite-${session}`}
        open={dialog?.type === "invite"}
      />
      <HelpDialog open={dialog?.type === "help"} />
    </>
  );
}
