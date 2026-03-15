/** 디자인 가드레일 — 블록 편집 시 자동 검증 규칙 */

import type { Block } from "@/types/blocks";

export type GuardrailSeverity = "warning" | "error";

export interface GuardrailViolation {
  blockId: string;
  rule: string;
  message: string;
  severity: GuardrailSeverity;
  autoFixable: boolean;
}

const MAX_TEXT = 150;
const MIN_FONT = 14;

/** 텍스트 최소/최대 길이 검증 */
function checkTextLength(block: Block): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];

  if (block.type === "text-block" && block.body.length > MAX_TEXT) {
    violations.push({
      blockId: block.id,
      rule: "max-text-length",
      message: `본문이 ${MAX_TEXT}자를 초과합니다 (${block.body.length}자)`,
      severity: "warning",
      autoFixable: true,
    });
  }

  if (block.type === "hero") {
    for (const overlay of block.overlays) {
      if (overlay.fontSize < MIN_FONT) {
        violations.push({
          blockId: block.id,
          rule: "min-font-size",
          message: `오버레이 텍스트 크기가 ${MIN_FONT}px 미만입니다 (${overlay.fontSize}px)`,
          severity: "warning",
          autoFixable: true,
        });
      }
    }
  }

  return violations;
}

/** 인접 동일 블록 타입 경고 */
function checkAdjacentDuplicates(blocks: Block[]): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i].type === blocks[i - 1].type && blocks[i].type !== "divider") {
      violations.push({
        blockId: blocks[i].id,
        rule: "adjacent-duplicate",
        message: `같은 타입(${blocks[i].type})이 연속됩니다. 다양한 블록 배치를 권장합니다`,
        severity: "warning",
        autoFixable: false,
      });
    }
  }
  return violations;
}

/** 이미지 없는 이미지 블록 경고 */
function checkMissingImages(block: Block): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];

  if ((block.type === "hero" || block.type === "image-full") && !block.imageUrl) {
    violations.push({
      blockId: block.id,
      rule: "missing-image",
      message: "이미지가 설정되지 않았습니다",
      severity: "warning",
      autoFixable: false,
    });
  }

  if (block.type === "image-grid" && block.images.length === 0) {
    violations.push({
      blockId: block.id,
      rule: "missing-image",
      message: "이미지가 추가되지 않았습니다",
      severity: "warning",
      autoFixable: false,
    });
  }

  return violations;
}

/** CTA 블록 확인 */
function checkCtaPresence(blocks: Block[]): GuardrailViolation[] {
  const hasCta = blocks.some((b) => b.type === "cta" && b.visible);
  if (blocks.length >= 3 && !hasCta) {
    return [{
      blockId: "__document__",
      rule: "no-cta",
      message: "구매 유도(CTA) 블록이 없습니다. 하단에 CTA 블록 추가를 권장합니다",
      severity: "warning",
      autoFixable: true,
    }];
  }
  return [];
}

/** 전체 블록 문서 검증 */
export function validateBlocks(blocks: Block[]): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];

  for (const block of blocks) {
    if (!block.visible) continue;
    violations.push(...checkTextLength(block));
    violations.push(...checkMissingImages(block));
  }

  violations.push(...checkAdjacentDuplicates(blocks.filter((b) => b.visible)));
  violations.push(...checkCtaPresence(blocks));

  return violations;
}

/** 단일 블록 위반 건수 */
export function getBlockViolations(blockId: string, violations: GuardrailViolation[]): GuardrailViolation[] {
  return violations.filter((v) => v.blockId === blockId);
}

/** 단일 블록 자동 수정 — autoFixable 위반만 교정 */
export function autoFixBlock(block: Block, violation: GuardrailViolation): Block {
  switch (violation.rule) {
    case "min-font-size":
      if (block.type === "hero") {
        return {
          ...block,
          overlays: block.overlays.map((o) =>
            o.fontSize < MIN_FONT ? { ...o, fontSize: MIN_FONT } : o,
          ),
        };
      }
      return block;

    case "max-text-length":
      if (block.type === "text-block" && block.body.length > MAX_TEXT) {
        return { ...block, body: block.body.slice(0, MAX_TEXT) + "..." };
      }
      return block;

    default:
      return block;
  }
}

/** 전체 블록 일괄 자동 수정 — autoFixable 위반 모두 교정, CTA 블록 자동 추가 포함 */
export function autoFixAllBlocks(blocks: Block[], createCtaBlock: () => Block): { blocks: Block[]; fixCount: number } {
  const violations = validateBlocks(blocks);
  const fixable = violations.filter((v) => v.autoFixable);
  let fixCount = 0;

  let result = blocks.map((block) => {
    const blockViolations = fixable.filter((v) => v.blockId === block.id);
    let fixed = block;
    for (const v of blockViolations) {
      fixed = autoFixBlock(fixed, v);
      fixCount++;
    }
    return fixed;
  });

  // CTA 자동 추가
  const ctaViolation = fixable.find((v) => v.rule === "no-cta");
  if (ctaViolation) {
    result = [...result, createCtaBlock()];
    fixCount++;
  }

  return { blocks: result, fixCount };
}
