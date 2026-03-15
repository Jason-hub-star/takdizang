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
      className={`w-full rounded-[28px] border p-6 transition-colors ${
        selected
          ? "border-[rgb(236_197_183_/_0.95)] bg-[rgb(255_249_245_/_0.96)] shadow-[0_16px_36px_rgba(217,124,103,0.12)]"
          : `${WORKSPACE_SURFACE.panel} hover:border-[rgb(215_201_188_/_0.94)]`
      }`}
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgb(236_197_183_/_0.95)] bg-[rgb(217_124_103)] text-sm font-bold text-white shadow-[0_10px_20px_rgba(217,124,103,0.14)]">
              {idx + 1}
            </div>

            {/* Image */}
            <div className="w-20 shrink-0 overflow-hidden rounded-[20px]">
              {readOnly ? (
                step.imageUrl ? (
                  <img src={step.imageUrl} alt="" className="aspect-square w-full object-cover" />
                ) : (
                  <div className={`flex aspect-square items-center justify-center bg-[rgb(248_241_232_/_0.72)] text-[10px] ${WORKSPACE_TEXT.muted}`}>이미지</div>
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
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[rgb(236_201_201_/_0.95)] bg-[rgb(248_230_230_/_0.95)] text-[#B45A52] opacity-0 transition-opacity group-hover/step:opacity-100"
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
          className="mx-auto mt-4 flex items-center gap-1 rounded-full border border-dashed border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.72)] px-3 py-1.5 text-xs text-[var(--takdi-text-subtle)] transition-colors hover:border-[rgb(236_197_183_/_0.95)] hover:text-[var(--takdi-accent-strong)]"
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
