/** 카드뉴스(정방형) 내보내기 — 블록을 1080×1080 슬라이드로 재배치 */
"use client";

import { forwardRef } from "react";
import type { Block, ThemePalette } from "@/types/blocks";
import { BlockDispatch } from "./block-dispatch";

interface CardNewsLayoutProps {
  blocks: Block[];
  theme?: ThemePalette;
}

export const CardNewsLayout = forwardRef<HTMLDivElement, CardNewsLayoutProps>(
  function CardNewsLayout({ blocks, theme }, ref) {
    const visibleBlocks = blocks.filter((b) => b.visible);

    return (
      <div ref={ref} className="flex flex-col gap-4">
        {visibleBlocks.map((block) => (
          <div
            key={block.id}
            data-card-slide={block.id}
            className="flex items-center justify-center overflow-hidden bg-white"
            style={{
              width: 1080,
              height: 1080,
              backgroundColor: theme?.background ?? "#ffffff",
              color: theme?.text ?? "#111827",
            }}
          >
            <div className="w-full p-12 pointer-events-none">
              <BlockDispatch
                block={block}
                selected={false}
                onSelect={() => {}}
                onUpdate={() => {}}
                readOnly
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
);
