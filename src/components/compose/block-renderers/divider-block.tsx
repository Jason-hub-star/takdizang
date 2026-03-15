/** 구분선 블록 — line/space/dot 스타일 */
"use client";

import type { DividerBlock } from "@/types/blocks";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface Props {
  block: DividerBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<DividerBlock>) => void;
  readOnly?: boolean;
}

export function DividerBlockRenderer({ block, selected, onSelect, onUpdate: _onUpdate, readOnly: _readOnly }: Props) {
  return (
    <div
      className={`w-full rounded-[24px] border transition-colors ${
        selected
          ? "border-[rgb(236_197_183_/_0.95)] bg-[rgb(255_249_245_/_0.9)] shadow-[0_12px_28px_rgba(217,124,103,0.12)]"
          : `${WORKSPACE_SURFACE.panel} hover:border-[rgb(215_201_188_/_0.94)]`
      }`}
      onClick={onSelect}
      style={{ height: block.height || 32 }}
    >
      {block.style === "line" && <hr className="mt-4 border-[rgb(221_208_194_/_0.92)]" />}
      {block.style === "dot" && (
        <div className={`flex h-full items-center justify-center gap-2 ${WORKSPACE_TEXT.muted}`}>
          <span>&#8226;</span><span>&#8226;</span><span>&#8226;</span>
        </div>
      )}
    </div>
  );
}
