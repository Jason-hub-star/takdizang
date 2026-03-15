"use client";

import { useEffect, useState } from "react";
import { Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/use-t";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface SaveTemplateDialogProps {
  open: boolean;
  defaultName: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function SaveTemplateDialog({
  open,
  defaultName,
  saving,
  onClose,
  onSubmit,
}: SaveTemplateDialogProps) {
  const { messages } = useT();
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (open) {
      setName(defaultName);
    }
  }, [defaultName, open]);

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
            <div className="rounded-full bg-[#F8E7E2] p-2 text-[#D97C67]">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${WORKSPACE_TEXT.title}`}>{messages.composeShared.saveFavoriteTemplateTitle}</h2>
              <p className={`text-xs ${WORKSPACE_TEXT.body}`}>{messages.composeShared.saveFavoriteTemplateDescription}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={`${WORKSPACE_TEXT.muted} hover:text-[#4D433D]`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className={`mb-2 block text-xs font-medium ${WORKSPACE_TEXT.body}`} htmlFor="template-name">
          {messages.composeShared.templateName}
        </label>
        <input
          id="template-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`w-full rounded-2xl px-3 py-2 text-sm ${WORKSPACE_CONTROL.input}`}
          placeholder={messages.composeShared.templateNamePlaceholder}
        />

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving} className={`rounded-2xl ${WORKSPACE_CONTROL.ghostButton}`}>{messages.common.actions.cancel}</Button>
          <Button
            type="button"
            onClick={() => onSubmit(name.trim())}
            disabled={saving || name.trim().length === 0}
            className={`rounded-2xl ${WORKSPACE_CONTROL.accentButton}`}
          >
            {saving ? messages.composeShared.saving : messages.composeShared.saveTemplateButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
