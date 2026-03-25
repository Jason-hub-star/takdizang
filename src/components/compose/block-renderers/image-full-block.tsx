/** 전체 이미지 블록 — ImageUploadZone + 오버레이 (반응형 폰트) */
"use client";

import { useRef, useState, useEffect } from "react";
import type { ImageFullBlock } from "@/types/blocks";
import { getFontFamily } from "@/lib/constants";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { ImageUploadZone, EditableText, buildFilterStyle } from "../shared";

const BASE_WIDTH = 780;

interface Props {
  block: ImageFullBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<ImageFullBlock>) => void;
  readOnly?: boolean;
}

export function ImageFullBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? BASE_WIDTH;
      setFontScale(Math.min(1, width / BASE_WIDTH));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${selected ? "takdi-block takdi-block-selected" : "takdi-block takdi-block-default"}`}
      onClick={onSelect}
    >
      {readOnly ? (
        block.imageUrl ? (
          <img src={block.imageUrl} alt="" className="w-full rounded object-cover" style={buildFilterStyle(block.imageFilters) ? { filter: buildFilterStyle(block.imageFilters) } : undefined} />
        ) : (
          <div className={`flex h-48 items-center justify-center bg-[var(--takdi-soft-bg)] ${WORKSPACE_TEXT.muted}`}>
            <p className="text-sm">전체 이미지</p>
          </div>
        )
      ) : (
        <ImageUploadZone
          imageUrl={block.imageUrl}
          onImageChange={(url) => onUpdate({ imageUrl: url })}
          className="min-h-[192px]"
          placeholderText="전체 이미지를 업로드하세요"
          imageFilter={buildFilterStyle(block.imageFilters)}
        />
      )}

      {/* Overlays */}
      {block.overlays.map((overlay) => (
        <div
          key={overlay.id}
          className="absolute select-none"
          style={{
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            transform: "translate(-50%, -50%)",
            fontSize: Math.round(overlay.fontSize * fontScale),
            color: overlay.color,
            fontWeight: overlay.fontWeight,
            fontFamily: getFontFamily(overlay.fontFamily),
            textAlign: overlay.textAlign,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            maxWidth: "80%",
          }}
        >
          <EditableText
            value={overlay.text}
            placeholder="텍스트 입력"
            onChange={(newText) => {
              onUpdate({
                overlays: block.overlays.map((o) =>
                  o.id === overlay.id ? { ...o, text: newText } : o,
                ),
              });
            }}
            tag="span"
            readOnly={readOnly}
          />
        </div>
      ))}
    </div>
  );
}
