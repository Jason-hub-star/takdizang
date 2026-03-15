/** 블록 프리뷰 — readOnly 모드 블록 렌더링, 스크롤 프리뷰 */
"use client";

import { forwardRef } from "react";
import type { Block, ThemePalette } from "@/types/blocks";
import { BlockDispatch } from "./block-dispatch";
import { BlockSurfaceFrame } from "./block-surface-frame";

interface BlockPreviewProps {
  blocks: Block[];
  platformWidth: number;
  theme?: ThemePalette;
  mobilePreview?: boolean;
  className?: string;
}

export const BlockPreview = forwardRef<HTMLDivElement, BlockPreviewProps>(function BlockPreview(
  { blocks, platformWidth, theme, mobilePreview, className },
  ref,
) {
  const visibleBlocks = blocks.filter((b) => b.visible);

  return (
    <BlockSurfaceFrame
      ref={ref}
      platformWidth={platformWidth}
      mobilePreview={mobilePreview}
      theme={theme}
      className={className}
    >
      {visibleBlocks.map((block) => (
        <div key={block.id} data-block-id={block.id} className="pointer-events-none">
          <BlockDispatch
            block={block}
            selected={false}
            onSelect={() => {}}
            onUpdate={() => {}}
            readOnly
          />
        </div>
      ))}
      {visibleBlocks.length === 0 && (
        <div className="flex h-64 items-center justify-center text-center text-gray-400">
          <p>표시할 블록이 없습니다</p>
        </div>
      )}
    </BlockSurfaceFrame>
  );
});
