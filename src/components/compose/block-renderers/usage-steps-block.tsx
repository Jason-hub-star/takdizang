/** 사용 방법 블록 — 번호 + 이미지 + 설명 (추가/삭제) */
"use client";

import type { UsageStepsBlock } from "@/types/blocks";
import { X, Plus } from "lucide-react";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { ImageUploadZone, EditableText } from "../shared";

interface Props {
  block: UsageStepsBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<UsageStepsBlock>) => void;
  readOnly?: boolean;
}

export function UsageStepsBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const updateStep = (index: number, patch: Partial<UsageStepsBlock["steps"][0]>) => {
    const steps = block.steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onUpdate({ steps });
  };

  const deleteStep = (index: number) => {
    if (block.steps.length <= 1) return;
    onUpdate({ steps: block.steps.filter((_, i) => i !== index) });
  };

  const addStep = () => {
    if (block.steps.length >= 6) return;
    onUpdate({
      steps: [...block.steps, { imageUrl: "", label: `STEP ${block.steps.length + 1}`, description: "설명을 입력하세요" }],
    });
  };

  return (
    <div
      className={`w-full p-6 ${selected ? "takdi-block takdi-block-selected takdi-block-selected-fill" : "takdi-block takdi-block-default"}`}
      onClick={onSelect}
    >
      <EditableText
        value={block.title}
        placeholder="사용 방법"
        onChange={(v) => onUpdate({ title: v })}
        className={`mb-4 text-center text-lg font-bold ${WORKSPACE_TEXT.title}`}
        tag="h3"
        readOnly={readOnly}
      />

      <div className="space-y-4">
        {block.steps.map((step, idx) => (
          <div key={idx} className="group/step relative flex gap-4">
            {/* Step number */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--takdi-accent-tint-border)] bg-[var(--takdi-accent)] text-sm font-bold text-white shadow-[var(--takdi-shadow-accent-pill)]">
              {idx + 1}
            </div>

            {/* Image */}
            <div className="w-20 shrink-0 overflow-hidden rounded-[var(--takdi-radius-sm)]">
              {readOnly ? (
                step.imageUrl ? (
                  <img src={step.imageUrl} alt="" className="aspect-square w-full object-cover" />
                ) : (
                  <div className={`flex aspect-square items-center justify-center bg-[var(--takdi-soft-bg)] text-[10px] ${WORKSPACE_TEXT.muted}`}>이미지</div>
                )
              ) : (
                <ImageUploadZone
                  imageUrl={step.imageUrl}
                  onImageChange={(url) => updateStep(idx, { imageUrl: url })}
                  className="aspect-square"
                  placeholderText="이미지"
                />
              )}
            </div>

            {/* Text */}
            <div className="flex flex-1 flex-col justify-center">
              <EditableText
                value={step.label}
                placeholder={`STEP ${idx + 1}`}
                onChange={(v) => updateStep(idx, { label: v })}
                className={`text-sm font-semibold ${WORKSPACE_TEXT.title}`}
                tag="span"
                readOnly={readOnly}
              />
              <EditableText
                value={step.description}
                placeholder="설명을 입력하세요"
                onChange={(v) => updateStep(idx, { description: v })}
                className={`text-sm ${WORKSPACE_TEXT.body}`}
                tag="p"
                readOnly={readOnly}
              />
            </div>

            {/* Delete */}
            {!readOnly && block.steps.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteStep(idx); }}
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--takdi-delete-border)] bg-[var(--takdi-delete-bg)] text-[var(--takdi-delete-text)] opacity-0 transition-opacity group-hover/step:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && block.steps.length < 6 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addStep(); }}
          className="mx-auto mt-4 flex items-center gap-1 rounded-full takdi-add-button px-3 py-1.5 text-xs"
        >
          <Plus className="h-3 w-3" /> 단계 추가
        </button>
      )}
      {!readOnly && block.steps.length >= 6 && (
        <p className={`mt-3 text-center text-xs ${WORKSPACE_TEXT.muted}`}>최대 6개까지 추가할 수 있습니다</p>
      )}
    </div>
  );
}
