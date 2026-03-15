/** GenerationResult.sections → Block[] 변환기 (설득 구조 기반 매핑) */
import type { GenerationResultSection } from "@/types";
import type { Block, BlockType } from "@/types/blocks";
import { PERSUASION_SEQUENCES } from "@/lib/constants";

const SECTION_MAP: Record<string, Block["type"]> = {
  hero: "hero",
  brand: "image-text",
  "selling-point": "selling-point",
  detail: "image-full",
  usage: "usage-steps",
  spec: "spec-table",
  comparison: "comparison",
  review: "review",
  cta: "cta",
  "image-grid": "image-grid",
  "image-text": "image-text",
  "image-full": "image-full",
  "usage-steps": "usage-steps",
  "spec-table": "spec-table",
};

let blockIdCounter = 0;
function nextId() {
  return `blk-${Date.now()}-${++blockIdCounter}`;
}

export function sectionsToBlocks(
  sections: GenerationResultSection[],
  category?: string,
): Block[] {
  blockIdCounter = 0;

  // Map sections to blocks with assigned types
  const blocks = sections.map((section, idx) => {
    const blockType = SECTION_MAP[section.styleKey] ?? inferType(idx, sections.length);
    return createBlock(blockType, section, idx);
  });

  // Apply persuasion sequence ordering if category is provided
  if (category) {
    return sortByPersuasionSequence(blocks, category);
  }

  return blocks;
}

/** 설득 구조 시퀀스에 따라 블록 정렬 */
function sortByPersuasionSequence(blocks: Block[], category: string): Block[] {
  const sequence = PERSUASION_SEQUENCES[category] ?? PERSUASION_SEQUENCES.default;
  const typeOrder = new Map<BlockType, number>();
  sequence.forEach((t, i) => typeOrder.set(t, i));

  return [...blocks].sort((a, b) => {
    const orderA = typeOrder.get(a.type) ?? 999;
    const orderB = typeOrder.get(b.type) ?? 999;
    return orderA - orderB;
  });
}

/** styleKey가 없을 때 위치 기반 추론 */
function inferType(index: number, total: number): Block["type"] {
  if (index === 0) return "hero";
  if (index === total - 1) return "cta";
  if (index === 1) return "selling-point";
  return "text-block";
}

function createBlock(blockType: Block["type"], section: GenerationResultSection, idx: number): Block {
  switch (blockType) {
    case "hero":
      return {
        id: nextId(),
        type: "hero",
        visible: true,
        imageUrl: "",
        overlays: [
          {
            id: `ovl-${Date.now()}-${idx}`,
            text: section.headline,
            x: 50,
            y: 50,
            fontSize: 32,
            color: "#ffffff",
            fontWeight: "bold" as const,
            textAlign: "center" as const,
          },
        ],
      };

    case "selling-point":
      return {
        id: nextId(),
        type: "selling-point",
        visible: true,
        items: [
          { icon: "star", title: section.headline, description: section.body },
        ],
      };

    case "image-full":
      return {
        id: nextId(),
        type: "image-full",
        visible: true,
        imageUrl: "",
        overlays: [],
      };

    case "image-text":
      return {
        id: nextId(),
        type: "image-text",
        visible: true,
        imageUrl: "",
        imagePosition: idx % 2 === 0 ? "left" as const : "right" as const,
        heading: section.headline,
        body: section.body,
      };

    case "image-grid":
      return {
        id: nextId(),
        type: "image-grid",
        visible: true,
        images: [],
        columns: 2,
      };

    case "spec-table":
      return {
        id: nextId(),
        type: "spec-table",
        visible: true,
        title: section.headline,
        rows: section.body.split("\n").filter(Boolean).map((line) => {
          const [label, ...rest] = line.split(":");
          return { label: label.trim(), value: rest.join(":").trim() || line };
        }),
      };

    case "comparison":
      return {
        id: nextId(),
        type: "comparison",
        visible: true,
        title: section.headline,
        before: { label: "Before", imageUrl: "" },
        after: { label: "After", imageUrl: "" },
      };

    case "review":
      return {
        id: nextId(),
        type: "review",
        visible: true,
        title: section.headline,
        reviews: [{ author: "고객", rating: 5, text: section.body }],
      };

    case "usage-steps":
      return {
        id: nextId(),
        type: "usage-steps",
        visible: true,
        title: section.headline,
        steps: section.body.split("\n").filter(Boolean).map((line, i) => ({
          imageUrl: "",
          label: `STEP ${i + 1}`,
          description: line.trim(),
        })),
      };

    case "cta":
      return {
        id: nextId(),
        type: "cta",
        visible: true,
        text: section.headline,
        subtext: section.body,
        buttonLabel: "지금 구매하기",
        buttonUrl: "#",
      };

    default:
      return {
        id: nextId(),
        type: "text-block",
        visible: true,
        heading: section.headline,
        body: section.body,
        align: "left" as const,
      };
  }
}
