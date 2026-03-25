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
      className={`w-full rounded-[var(--takdi-radius-lg)] ${selected ? "takdi-block takdi-block-selected takdi-block-selected-fill" : "takdi-block takdi-block-default"}`}
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
