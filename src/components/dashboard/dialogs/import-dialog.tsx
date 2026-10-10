"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import Dialog from "@/components/_ui/dialog";
import { Field, Select, Textarea } from "@/components/_ui/form";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

export default function ImportDialog({ open }: { open: boolean }) {
  const columns = useKanbanStore((state) => state.columns);
  const importTasks = useKanbanStore((state) => state.importTasks);
  const closeDialog = useUiStore((state) => state.closeDialog);
  const toast = useUiStore((state) => state.toast);
  const [text, setText] = useState("");
  const [columnId, setColumnId] = useState(
    () => columns.find((c) => !c.hidden)?.id ?? columns[0]?.id ?? "",
  );

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const submit = () => {
    const count = importTasks(lines, columnId);
    toast(`Imported ${count} issue${count === 1 ? "" : "s"}`);
    closeDialog();
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      title="Import issues"
      description="Paste one issue title per line."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={submit}
            disabled={lines.length === 0}
          >
            Import {lines.length > 0 ? lines.length : ""}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Issues" htmlFor="import-text">
          <Textarea
            id="import-text"
            data-autofocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              "Write onboarding checklist\nFix login redirect\nDesign empty states"
            }
            className="min-h-[140px]"
          />
        </Field>
        <Field label="Add to column" htmlFor="import-column">
          <Select
            id="import-column"
            value={columnId}
            onChange={(event) => setColumnId(event.target.value)}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title || column.name}
                {column.hidden ? " (hidden)" : ""}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </Dialog>
  );
}
