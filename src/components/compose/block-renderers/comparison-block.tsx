/** 비교 블록 — Before/After ImageUploadZone + 라벨 편집 */
"use client";

import type { ComparisonBlock } from "@/types/blocks";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { ImageUploadZone, EditableText, buildFilterStyle } from "../shared";

interface Props {
  block: ComparisonBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<ComparisonBlock>) => void;
  readOnly?: boolean;
}

export function ComparisonBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  return (
    <div
      className={`w-full p-6 ${selected ? "takdi-block takdi-block-selected takdi-block-selected-fill" : "takdi-block takdi-block-default"}`}
      onClick={onSelect}
    >
      <EditableText
        value={block.title}
        placeholder="비교 제목"
        onChange={(v) => onUpdate({ title: v })}
        className={`mb-4 text-center text-base font-bold ${WORKSPACE_TEXT.title}`}
        tag="h3"
        readOnly={readOnly}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className={`mb-2 aspect-square overflow-hidden rounded-[var(--takdi-radius-lg)] ${WORKSPACE_SURFACE.softInset}`}>
            {readOnly ? (
              block.before.imageUrl ? (
                <img src={block.before.imageUrl} alt="" className="h-full w-full object-cover" style={buildFilterStyle(block.imageFilters) ? { filter: buildFilterStyle(block.imageFilters) } : undefined} />
              ) : (
                <div className={`flex h-full items-center justify-center ${WORKSPACE_TEXT.muted}`}>
                  <p className="text-xs">Before</p>
                </div>
              )
            ) : (
              <ImageUploadZone
                imageUrl={block.before.imageUrl}
                onImageChange={(url) => onUpdate({ before: { ...block.before, imageUrl: url } })}
                className="h-full"
                placeholderText="Before 이미지"
                imageFilter={buildFilterStyle(block.imageFilters)}
              />
            )}
          </div>
          <EditableText
            value={block.before.label}
            placeholder="Before"
            onChange={(v) => onUpdate({ before: { ...block.before, label: v } })}
            className={`text-sm font-medium ${WORKSPACE_TEXT.body}`}
            tag="span"
            readOnly={readOnly}
          />
        </div>
        <div className="text-center">
          <div className={`mb-2 aspect-square overflow-hidden rounded-[var(--takdi-radius-lg)] ${WORKSPACE_SURFACE.softInset}`}>
            {readOnly ? (
              block.after.imageUrl ? (
                <img src={block.after.imageUrl} alt="" className="h-full w-full object-cover" style={buildFilterStyle(block.imageFilters) ? { filter: buildFilterStyle(block.imageFilters) } : undefined} />
              ) : (
                <div className={`flex h-full items-center justify-center ${WORKSPACE_TEXT.muted}`}>
                  <p className="text-xs">After</p>
                </div>
              )
            ) : (
              <ImageUploadZone
                imageUrl={block.after.imageUrl}
                onImageChange={(url) => onUpdate({ after: { ...block.after, imageUrl: url } })}
                className="h-full"
                placeholderText="After 이미지"
                imageFilter={buildFilterStyle(block.imageFilters)}
              />
            )}
          </div>
          <EditableText
            value={block.after.label}
            placeholder="After"
            onChange={(v) => onUpdate({ after: { ...block.after, label: v } })}
            className={`text-sm font-medium ${WORKSPACE_TEXT.body}`}
            tag="span"
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
