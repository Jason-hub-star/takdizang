/** RightPanel - 우측 패널 (속성 패널 직접 렌더링, AI 허브 탭 제거) */
"use client";

import type { Block } from "@/types/blocks";
import { BlockPropertiesPanel } from "./block-properties-panel";

interface RightPanelProps {
  block: Block | null;
  onUpdate: (id: string, patch: Partial<Block>) => void;
}

export function RightPanel({ block, onUpdate }: RightPanelProps) {
  return <BlockPropertiesPanel block={block} onUpdate={onUpdate} />;
}
