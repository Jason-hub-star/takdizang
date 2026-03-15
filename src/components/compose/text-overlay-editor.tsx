/** 텍스트 오버레이 편집기 — 이미지 위 absolute-positioned 텍스트 드래그 */
"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { TextOverlay } from "@/types/blocks";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface TextOverlayEditorProps {
  overlays: TextOverlay[];
  onChange: (overlays: TextOverlay[]) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function TextOverlayEditor({ overlays, onChange, containerRef }: TextOverlayEditorProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleAdd = useCallback(() => {
    const newOverlay: TextOverlay = {
      id: `ovl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: "새 텍스트",
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#ffffff",
      fontWeight: "bold",
      textAlign: "center",
    };
    onChange([...overlays, newOverlay]);
  }, [overlays, onChange]);

  const handleDelete = useCallback(
    (id: string) => {
      onChange(overlays.filter((o) => o.id !== id));
    },
    [overlays, onChange],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingId(id);

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const overlay = overlays.find((o) => o.id === id);
      if (!overlay) return;

      const overlayX = (overlay.x / 100) * rect.width;
      const overlayY = (overlay.y / 100) * rect.height;
      dragOffset.current = {
        x: e.clientX - rect.left - overlayX,
        y: e.clientY - rect.top - overlayY,
      };

      function handleMouseMove(ev: MouseEvent) {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newX = Math.max(0, Math.min(100, ((ev.clientX - rect.left - dragOffset.current.x) / rect.width) * 100));
        const newY = Math.max(0, Math.min(100, ((ev.clientY - rect.top - dragOffset.current.y) / rect.height) * 100));

        onChange(
          overlays.map((o) => (o.id === id ? { ...o, x: Math.round(newX), y: Math.round(newY) } : o)),
        );
      }

      function handleMouseUp() {
        setDraggingId(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [overlays, onChange, containerRef],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${WORKSPACE_TEXT.body}`}>텍스트 오버레이</span>
        <button
          onClick={handleAdd}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${WORKSPACE_CONTROL.accentTint}`}
        >
          <Plus className="h-3 w-3" />
          추가
        </button>
      </div>

      {overlays.map((overlay) => (
        <div key={overlay.id} className={`rounded-[20px] p-2 ${WORKSPACE_SURFACE.softInset}`}>
          <div className="mb-1.5 flex items-center justify-between">
            <input
              type="text"
              value={overlay.text}
              onChange={(e) =>
                onChange(overlays.map((o) => (o.id === overlay.id ? { ...o, text: e.target.value } : o)))
              }
              className="flex-1 px-2 py-1 text-xs"
            />
            <button
              onClick={() => handleDelete(overlay.id)}
              className={`ml-1 rounded-full p-1 ${WORKSPACE_TEXT.muted} hover:text-[var(--takdi-accent-strong)]`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div>
              <label className={`text-[10px] ${WORKSPACE_TEXT.muted}`}>크기</label>
              <input
                type="number"
                value={overlay.fontSize}
                onChange={(e) =>
                  onChange(overlays.map((o) => (o.id === overlay.id ? { ...o, fontSize: Number(e.target.value) } : o)))
                }
                className="w-full px-1 py-0.5 text-xs"
                min={12}
                max={120}
              />
            </div>
            <div>
              <label className={`text-[10px] ${WORKSPACE_TEXT.muted}`}>색상</label>
              <input
                type="color"
                value={overlay.color}
                onChange={(e) =>
                  onChange(overlays.map((o) => (o.id === overlay.id ? { ...o, color: e.target.value } : o)))
                }
                className="h-6 w-full cursor-pointer rounded-xl border border-[rgb(214_199_184_/_0.74)]"
              />
            </div>
            <div>
              <label className={`text-[10px] ${WORKSPACE_TEXT.muted}`}>굵기</label>
              <select
                value={overlay.fontWeight}
                onChange={(e) =>
                  onChange(
                    overlays.map((o) =>
                      o.id === overlay.id ? { ...o, fontWeight: e.target.value as "normal" | "bold" } : o,
                    ),
                  )
                }
                className="w-full px-1 py-0.5 text-xs"
              >
                <option value="normal">보통</option>
                <option value="bold">굵게</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
