"use client";

import { Home, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/use-t";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface LeaveComposeDialogProps {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSaveAndLeave: () => void;
}

export function LeaveComposeDialog({
  open,
  saving,
  onClose,
  onDiscard,
  onSaveAndLeave,
}: LeaveComposeDialogProps) {
  const { messages } = useT();
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#201A17]/35 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-[28px] p-6 ${WORKSPACE_SURFACE.panelStrong}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#F8F4EF] p-2 text-[#6F655D]">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${WORKSPACE_TEXT.title}`}>{messages.composeShared.leaveComposeTitle}</h2>
              <p className={`text-xs ${WORKSPACE_TEXT.body}`}>{messages.composeShared.leaveComposeDescription}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={`${WORKSPACE_TEXT.muted} hover:text-[#4D433D]`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-[24px] bg-[#F8F4EF] p-4 text-sm text-[#6F655D]">{messages.composeShared.leaveComposeBody}</div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving} className={`rounded-2xl ${WORKSPACE_CONTROL.ghostButton}`}>{messages.common.actions.cancel}</Button>
          <Button type="button" variant="outline" onClick={onDiscard} disabled={saving} className={`rounded-2xl ${WORKSPACE_CONTROL.subtleButton}`}>
            {messages.common.actions.leaveWithoutSaving}
          </Button>
          <Button type="button" onClick={onSaveAndLeave} disabled={saving} className={`rounded-2xl ${WORKSPACE_CONTROL.accentButton}`}>
            {saving ? messages.composeShared.saving : messages.common.actions.saveAndLeave}
          </Button>
        </div>
      </div>
    </div>
  );
}
