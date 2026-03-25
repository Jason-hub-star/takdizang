"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

export interface ItemAction {
  key: string;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

interface ItemActionsMenuProps {
  label: string;
  actions: ItemAction[];
}

export function ItemActionsMenu({ label, actions }: ItemActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className={`rounded-full shadow-none ${WORKSPACE_CONTROL.subtleButton} ${WORKSPACE_TEXT.muted}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open ? (
        <div className={`absolute right-0 top-full z-20 mt-2 min-w-36 rounded-2xl p-1.5 ${WORKSPACE_SURFACE.floating}`}>
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              disabled={action.disabled}
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition ${
                action.destructive
                  ? "text-[var(--takdi-delete-text)] hover:bg-[rgb(248_230_230_/_0.9)]"
                  : `${WORKSPACE_TEXT.body} hover:bg-[rgb(247_239_231_/_0.92)] hover:text-[var(--takdi-text)]`
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
