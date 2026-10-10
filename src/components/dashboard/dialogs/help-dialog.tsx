"use client";

import Dialog from "@/components/_ui/dialog";
import { useUiStore } from "@/stores/ui-store";

const shortcuts = [
  { keys: ["/"], label: "Focus search" },
  { keys: ["N"], label: "New issue" },
  { keys: ["["], label: "Collapse or expand the sidebar" },
  { keys: ["?"], label: "Open this help" },
  { keys: ["Esc"], label: "Close menus and dialogs" },
];

const tips = [
  "Drag a card to reorder it or move it to another column.",
  "Drop a card on a hidden column to move it off the board.",
  "Click a priority, assignee or date chip to change it in place.",
];

export default function HelpDialog({ open }: { open: boolean }) {
  const closeDialog = useUiStore((state) => state.closeDialog);

  return (
    <Dialog open={open} onClose={closeDialog} title="Help and resources">
      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-3">
          <h3>Keyboard shortcuts</h3>
          <div className="divide-border flex flex-col divide-y">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.label}
                className="flex items-center justify-between py-2"
              >
                <span>{shortcut.label}</span>
                <span className="flex gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd
                      key={key}
                      className="bg-secondary text-muted-foreground shadow-ring inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-mono text-[12px]"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h3>Working the board</h3>
          <ul className="flex flex-col gap-2">
            {tips.map((tip) => (
              <li key={tip} className="text-muted-foreground flex gap-2">
                <span
                  aria-hidden
                  className="bg-icon mt-[7px] size-1.5 shrink-0 rounded-full"
                />
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Dialog>
  );
}
