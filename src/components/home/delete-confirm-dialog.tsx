"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  details?: string[];
  confirmLabel?: string;
  busyLabel?: string;
  pending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  title,
  description,
  details = [],
  confirmLabel = "삭제",
  busyLabel = "삭제 중...",
  pending = false,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, open, pending]);

  if (!open) {
    return null;
  }

  return (
    <div className="takdi-overlay-backdrop fixed inset-0 z-[80] flex items-center justify-center px-4" onClick={() => !pending && onClose()}>
      <div
        className="takdi-overlay-panel w-full max-w-md rounded-[28px] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full border border-[var(--takdi-delete-border)] bg-[var(--takdi-delete-bg)] p-2 text-[var(--takdi-delete-text)] shadow-[0_10px_22px_rgba(180,90,82,0.12)]">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className={`text-base font-semibold ${WORKSPACE_TEXT.title}`}>{title}</h2>
              <p className={`mt-1 text-sm leading-6 ${WORKSPACE_TEXT.body}`}>{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={`rounded-full p-1 transition ${WORKSPACE_CONTROL.ghostButton} ${WORKSPACE_TEXT.muted} disabled:opacity-40`}
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {details.length > 0 ? (
          <div className={`rounded-2xl px-4 py-3 ${WORKSPACE_SURFACE.softInset}`}>
            {details.map((detail) => (
              <p key={detail} className={`text-sm leading-6 ${WORKSPACE_TEXT.body}`}>
                {detail}
              </p>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
            className={`rounded-2xl ${WORKSPACE_CONTROL.ghostButton}`}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-2xl"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? busyLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
