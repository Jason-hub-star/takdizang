/** 공지/안내 블록 — 아이콘+텍스트 리스트 (배송/교환/환불 등) */
"use client";

import type { NoticeBlock } from "@/types/blocks";
import { Plus, X } from "lucide-react";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { EditableText } from "../shared";

interface Props {
  block: NoticeBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<NoticeBlock>) => void;
  readOnly?: boolean;
}

const NOTICE_ICONS = [
  { value: "truck", label: "배송", emoji: "🚚" },
  { value: "refresh", label: "교환", emoji: "🔄" },
  { value: "shield", label: "보증", emoji: "🛡️" },
  { value: "info", label: "안내", emoji: "ℹ️" },
  { value: "alert", label: "주의", emoji: "⚠️" },
  { value: "clock", label: "기간", emoji: "⏰" },
  { value: "phone", label: "문의", emoji: "📞" },
  { value: "gift", label: "혜택", emoji: "🎁" },
];

function getIconEmoji(icon: string): string {
  return NOTICE_ICONS.find((i) => i.value === icon)?.emoji ?? "ℹ️";
}

export function NoticeBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const isCompact = block.noticeStyle === "compact";

  const updateItem = (index: number, patch: Partial<NoticeBlock["items"][0]>) => {
    const items = block.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onUpdate({ items });
  };

  const deleteItem = (index: number) => {
    if (block.items.length <= 1) return;
    onUpdate({ items: block.items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    if (block.items.length >= 8) return;
    onUpdate({
      items: [...block.items, { icon: "info", text: "안내 사항을 입력하세요" }],
    });
  };

  return (
    <div
      className={`w-full rounded-[28px] border p-6 transition-colors ${
        selected
          ? "border-[rgb(236_197_183_/_0.95)] bg-[rgb(252_247_242_/_0.94)] shadow-[0_16px_36px_rgba(217,124,103,0.12)]"
          : `${WORKSPACE_SURFACE.panelMuted} hover:border-[rgb(215_201_188_/_0.94)]`
      }`}
      onClick={onSelect}
    >
      <EditableText
        value={block.title}
        placeholder="안내 사항"
        onChange={(v) => onUpdate({ title: v })}
        className={`mb-3 text-sm font-bold ${WORKSPACE_TEXT.title}`}
        tag="h3"
        readOnly={readOnly}
      />

      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        {block.items.map((item, idx) => (
          <div key={idx} className="group/notice relative flex items-start gap-2">
            {/* Icon selector */}
            {readOnly ? (
              <span className="shrink-0 text-sm">{getIconEmoji(item.icon)}</span>
            ) : (
              <select
                value={item.icon}
                onChange={(e) => updateItem(idx, { icon: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className={`shrink-0 rounded-xl px-2 py-1 text-sm ${WORKSPACE_CONTROL.input}`}
              >
                {NOTICE_ICONS.map((ni) => (
                  <option key={ni.value} value={ni.value}>
                    {ni.emoji} {ni.label}
                  </option>
                ))}
              </select>
            )}

            <EditableText
              value={item.text}
              placeholder="안내 사항을 입력하세요"
              onChange={(v) => updateItem(idx, { text: v })}
              className={`flex-1 text-xs leading-relaxed ${WORKSPACE_TEXT.body}`}
              tag="p"
              readOnly={readOnly}
            />

            {/* Delete */}
            {!readOnly && block.items.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[rgb(236_201_201_/_0.95)] bg-[rgb(248_230_230_/_0.95)] text-[#B45A52] opacity-0 transition-opacity group-hover/notice:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && block.items.length < 8 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addItem(); }}
          className="mx-auto mt-3 flex items-center gap-1 rounded-full border border-dashed border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.72)] px-3 py-1.5 text-xs text-[var(--takdi-text-subtle)] transition-colors hover:border-[rgb(236_197_183_/_0.95)] hover:text-[var(--takdi-accent-strong)]"
        >
          <Plus className="h-3 w-3" /> 항목 추가
        </button>
      )}
    </div>
  );
}
