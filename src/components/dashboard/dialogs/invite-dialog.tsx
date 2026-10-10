"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import Dialog from "@/components/_ui/dialog";
import { Field, Input } from "@/components/_ui/form";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { UserIcon } from "@/components/_common/icons";

export default function InviteDialog({ open }: { open: boolean }) {
  const members = useKanbanStore((state) => state.members);
  const teamName = useKanbanStore((state) => state.teamName);
  const addMember = useKanbanStore((state) => state.addMember);
  const closeDialog = useUiStore((state) => state.closeDialog);
  const toast = useUiStore((state) => state.toast);
  const [name, setName] = useState("");

  const exists = members.some(
    (member) => member.name.toLowerCase() === name.trim().toLowerCase(),
  );

  const submit = () => {
    if (!name.trim() || exists) return;
    addMember(name);
    toast(`${name.trim()} joined ${teamName}`);
    closeDialog();
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      title="Invite people"
      description={`Add a teammate to ${teamName}.`}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={submit}
            disabled={!name.trim() || exists}
          >
            Send invite
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field
          label="Name"
          htmlFor="invite-name"
          hint={exists ? "That person is already on the team." : undefined}
        >
          <Input
            id="invite-name"
            data-autofocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ada Lovelace"
          />
        </Field>
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-[13px]">
            Current members
          </span>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <span
                key={member.id}
                className="text-muted-foreground shadow-ring inline-flex h-[30px] items-center gap-1 rounded-full bg-white px-2"
              >
                <UserIcon aria-hidden className="text-icon size-3.5" />
                {member.name}
              </span>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
