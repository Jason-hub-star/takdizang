/** 태그 기반 브리프 자동 조립 — 선택된 태그를 프롬프트 텍스트로 변환 */

import { PRODUCT_CATEGORIES, TONE_PRESETS, TARGET_AUDIENCE } from "./constants";

export interface BriefTags {
  category: string;
  tone: string;
  target: string;
  keywords: string[];
  productName: string;
}

const CATEGORY_MAP = Object.fromEntries(PRODUCT_CATEGORIES.map((c) => [c.value, c.label]));
const TONE_MAP = Object.fromEntries(TONE_PRESETS.map((t) => [t.value, t.label]));
const TARGET_MAP = Object.fromEntries(TARGET_AUDIENCE.map((t) => [t.value, t.label]));

export function assembleBrief(tags: BriefTags): string {
  const parts: string[] = [];

  if (tags.productName) {
    parts.push(`상품명: ${tags.productName}`);
  }

  const categoryLabel = CATEGORY_MAP[tags.category];
  if (categoryLabel) {
    parts.push(`카테고리: ${categoryLabel}`);
  }

  const toneLabel = TONE_MAP[tags.tone];
  if (toneLabel) {
    parts.push(`톤앤매너: ${toneLabel}`);
  }

  const targetLabel = TARGET_MAP[tags.target];
  if (targetLabel) {
    parts.push(`타겟 고객: ${targetLabel}`);
  }

  if (tags.keywords.length > 0) {
    parts.push(`핵심 키워드: ${tags.keywords.join(", ")}`);
  }

  return parts.join("\n");
}

export function isValidBrief(tags: BriefTags): boolean {
  return tags.productName.trim().length > 0 && tags.category.length > 0;
}
