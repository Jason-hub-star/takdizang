/** 이미지 그리드 블록 — 셀별 ImageUploadZone + 캡션 편집 + 추가/삭제 */
"use client";

import type { ImageGridBlock } from "@/types/blocks";
import { X, Plus } from "lucide-react";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { ImageUploadZone, EditableText, buildFilterStyle } from "../shared";

interface Props {
  block: ImageGridBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<ImageGridBlock>) => void;
  readOnly?: boolean;
}

export function ImageGridBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const maxCells = block.columns * 2;
  const images = block.images.length > 0 ? block.images : [];
  const shapeClass = block.shape === "circle" ? "rounded-full" : block.shape === "rounded" ? "rounded-xl" : "rounded";

  const updateImage = (index: number, patch: Partial<{ url: string; caption: string }>) => {
    const next = images.map((img, i) => (i === index ? { ...img, ...patch } : img));
    onUpdate({ images: next });
  };

  const deleteImage = (index: number) => {
    onUpdate({ images: images.filter((_, i) => i !== index) });
  };

  const addImage = () => {
    if (images.length >= maxCells) return;
    onUpdate({ images: [...images, { url: "", caption: "" }] });
  };

  return (
    <div
      className={`w-full p-6 ${selected ? "takdi-block takdi-block-selected takdi-block-selected-fill" : "takdi-block takdi-block-default"}`}
      onClick={onSelect}
    >
      <div className={`grid gap-2 ${block.columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {images.map((img, i) => (
          <div key={i} className="group/cell relative">
            {!readOnly && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteImage(i); }}
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--takdi-delete-border)] bg-[var(--takdi-delete-bg)] text-[var(--takdi-delete-text)] opacity-0 transition-opacity group-hover/cell:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <div className={`aspect-square overflow-hidden ${shapeClass}`}>
              {readOnly ? (
                img.url ? (
                  <img src={img.url} alt={img.caption} className="h-full w-full object-cover" style={buildFilterStyle(block.imageFilters) ? { filter: buildFilterStyle(block.imageFilters) } : undefined} />
                ) : (
                  <div className={`flex h-full items-center justify-center bg-[var(--takdi-soft-bg)] ${WORKSPACE_TEXT.muted}`}>
                    <p className="text-xs">이미지</p>
                  </div>
                )
              ) : (
                <ImageUploadZone
                  imageUrl={img.url}
                  onImageChange={(url) => updateImage(i, { url })}
                  className="h-full"
                  placeholderText="이미지"
                  imageFilter={buildFilterStyle(block.imageFilters)}
                />
              )}
            </div>
            <EditableText
              value={img.caption}
              placeholder="캡션"
              onChange={(v) => updateImage(i, { caption: v })}
              className={`mt-1 text-center text-xs ${WORKSPACE_TEXT.body}`}
              tag="p"
              readOnly={readOnly}
            />
          </div>
        ))}

        {!readOnly && images.length < maxCells && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); addImage(); }}
            className="flex aspect-square items-center justify-center rounded-[var(--takdi-radius-sm)] border-2 takdi-add-button"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {/* Empty placeholders for read-only with no images */}
        {readOnly && images.length === 0 &&
          Array.from({ length: block.columns * 2 }).map((_, i) => (
            <div key={i} className={`flex aspect-square items-center justify-center rounded-[var(--takdi-radius-sm)] bg-[var(--takdi-soft-bg)] ${WORKSPACE_TEXT.muted}`}>
              <p className="text-xs">이미지</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}
