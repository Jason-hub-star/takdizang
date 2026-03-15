/** 레이아웃 템플릿 잠금 — 검증된 블록 구조 잠금 */

import type { BlockType } from "@/types/blocks";
import type { PersuasionFramework } from "./constants";

export interface LayoutTemplate {
  id: string;
  label: string;
  category: string;
  sequence: BlockType[];
  description: string;
  framework?: PersuasionFramework;
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: "fashion-standard",
    label: "패션 표준",
    category: "fashion",
    sequence: ["hero", "selling-point", "image-grid", "comparison", "usage-steps", "review", "spec-table", "cta"],
    description: "패션 상품에 최적화된 설득 구조",
  },
  {
    id: "beauty-routine",
    label: "뷰티 루틴",
    category: "beauty",
    sequence: ["hero", "selling-point", "usage-steps", "image-text", "spec-table", "review", "cta"],
    description: "뷰티 제품의 사용법 중심 구조",
  },
  {
    id: "electronics-spec",
    label: "전자제품 스펙",
    category: "electronics",
    sequence: ["hero", "spec-table", "comparison", "selling-point", "image-grid", "review", "cta"],
    description: "스펙/성능 비교 중심 구조",
  },
  {
    id: "food-story",
    label: "식품 스토리",
    category: "food",
    sequence: ["hero", "image-full", "selling-point", "usage-steps", "spec-table", "review", "cta"],
    description: "식품의 비주얼과 스토리 강조",
  },
  {
    id: "minimal-basic",
    label: "미니멀 기본",
    category: "default",
    sequence: ["hero", "selling-point", "image-text", "spec-table", "cta"],
    description: "최소한의 블록으로 핵심 전달",
  },
  {
    id: "full-detail",
    label: "풀 상세",
    category: "default",
    sequence: ["hero", "selling-point", "image-text", "image-full", "comparison", "usage-steps", "spec-table", "review", "cta"],
    description: "모든 섹션을 포함한 상세 구조",
  },
  {
    id: "aida-standard",
    label: "AIDA 표준",
    category: "default",
    framework: "aida",
    sequence: ["hero", "selling-point", "image-text", "image-full", "spec-table", "review", "cta"],
    description: "주의→관심→욕구→행동 클래식 설득 구조",
  },
  {
    id: "pas-korean",
    label: "한국형 PAS",
    category: "default",
    framework: "pas-korean",
    sequence: ["hero", "text-block", "selling-point", "image-full", "spec-table", "review", "cta"],
    description: "문제인식→공감→솔루션→라이프스타일→디테일→리뷰→행동",
  },
  {
    id: "pastor",
    label: "PASTOR",
    category: "default",
    framework: "pastor",
    sequence: ["hero", "text-block", "selling-point", "comparison", "review", "cta"],
    description: "문제→강화→솔루션→증거→추천→행동",
  },
];

export function getTemplatesByCategory(category: string): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter((t) => t.category === category || t.category === "default");
}

/** 자동 매칭: 카테고리와 가장 잘 맞는 템플릿 1개 반환 */
export function getBestTemplate(category: string): LayoutTemplate {
  const match = LAYOUT_TEMPLATES.find((t) => t.category === category);
  return match ?? LAYOUT_TEMPLATES.find((t) => t.id === "minimal-basic")!;
}

/** 프레임워크별 템플릿 반환 */
export function getTemplateByFramework(framework: PersuasionFramework): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((t) => t.framework === framework);
}
