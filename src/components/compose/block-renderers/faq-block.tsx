/** FAQ 블록 — 질문+답변 아코디언 (추가/삭제) */
"use client";

import { useState } from "react";
import type { FaqBlock } from "@/types/blocks";
import { ChevronDown, Plus, X } from "lucide-react";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { EditableText } from "../shared";

interface Props {
  block: FaqBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<FaqBlock>) => void;
  readOnly?: boolean;
}

export function FaqBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const updateItem = (index: number, patch: Partial<FaqBlock["items"][0]>) => {
    const items = block.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onUpdate({ items });
  };

  const deleteItem = (index: number) => {
    if (block.items.length <= 1) return;
    onUpdate({ items: block.items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    if (block.items.length >= 10) return;
    onUpdate({
      items: [...block.items, { question: "질문을 입력하세요", answer: "답변을 입력하세요" }],
    });
  };

  return (
    <div
      className={`w-full p-6 ${selected ? "takdi-block takdi-block-selected takdi-block-selected-fill" : "takdi-block takdi-block-default"}`}
      onClick={onSelect}
    >
      <EditableText
        value={block.title}
        placeholder="자주 묻는 질문"
        onChange={(v) => onUpdate({ title: v })}
        className={`mb-4 text-center text-lg font-bold ${WORKSPACE_TEXT.title}`}
        tag="h3"
        readOnly={readOnly}
      />

      <div className="space-y-2">
        {block.items.map((item, idx) => (
          <div key={idx} className={`group/faq relative rounded-[var(--takdi-radius-md)] ${WORKSPACE_SURFACE.softInset}`}>
            {/* Question */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenIndex(openIndex === idx ? null : idx);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <EditableText
                value={item.question}
                placeholder="질문을 입력하세요"
                onChange={(v) => updateItem(idx, { question: v })}
                className={`flex-1 text-sm font-medium ${WORKSPACE_TEXT.title}`}
                tag="span"
                readOnly={readOnly}
              />
              <ChevronDown
                className={`ml-2 h-4 w-4 shrink-0 ${WORKSPACE_TEXT.muted} transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
              />
            </button>

            {/* Answer */}
            {openIndex === idx && (
              <div className="border-t border-[rgb(226_214_201_/_0.86)] px-4 py-3">
                <EditableText
                  value={item.answer}
                  placeholder="답변을 입력하세요"
                  onChange={(v) => updateItem(idx, { answer: v })}
                  className={`text-sm ${WORKSPACE_TEXT.body}`}
                  tag="p"
                  readOnly={readOnly}
                />
              </div>
            )}

            {/* Delete */}
            {!readOnly && block.items.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--takdi-delete-border)] bg-[var(--takdi-delete-bg)] text-[var(--takdi-delete-text)] opacity-0 transition-opacity group-hover/faq:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && block.items.length < 10 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addItem(); }}
          className="mx-auto mt-4 flex items-center gap-1 rounded-full takdi-add-button px-3 py-1.5 text-xs"
        >
          <Plus className="h-3 w-3" /> 질문 추가
        </button>
      )}
    </div>
  );
}
