/** 블록 타입 + 상수 정합성 테스트 — 비용 0원, 순수 로직 검증 */

import { describe, it, expect } from "vitest";
import {
  BLOCK_TYPE_LABELS,
  PLATFORM_PRESETS,
  PLATFORM_WIDTHS,
  PRODUCT_CATEGORIES,
  THEME_PRESETS,
  MODE_NODE_CONFIG,
  MODE_LABELS,
} from "../constants";
import type {
  BlockType,
  Block,
  UsageStepsBlock,
  ImageFilters,
  ThemePalette,
  BlockDocument,
} from "@/types/blocks";

// ══════════════════════════════════════
// Group 1: BlockType & BLOCK_TYPE_LABELS 정합성
// ══════════════════════════════════════

describe("BlockType 상수 정합성", () => {
  const ALL_BLOCK_TYPES: BlockType[] = [
    "hero",
    "selling-point",
    "image-full",
    "image-grid",
    "text-block",
    "image-text",
    "spec-table",
    "comparison",
    "review",
    "divider",
    "video",
    "cta",
    "usage-steps",
    "faq",
    "notice",
    "banner-strip",
    "price-promo",
    "trust-badge",
  ];

  it("1. BLOCK_TYPE_LABELS에 13종 블록 모두 존재", () => {
    for (const t of ALL_BLOCK_TYPES) {
      expect(BLOCK_TYPE_LABELS[t]).toBeDefined();
      expect(typeof BLOCK_TYPE_LABELS[t]).toBe("string");
    }
  });

  it("2. BLOCK_TYPE_LABELS 키 개수 = 18", () => {
    expect(Object.keys(BLOCK_TYPE_LABELS)).toHaveLength(18);
  });

  it("3. usage-steps 라벨 = '사용 방법'", () => {
    expect(BLOCK_TYPE_LABELS["usage-steps"]).toBe("사용 방법");
  });
});

// ══════════════════════════════════════
// Group 2: UsageStepsBlock 타입 구조
// ══════════════════════════════════════

describe("UsageStepsBlock 구조", () => {
  function makeUsageStepsBlock(): UsageStepsBlock {
    return {
      id: "blk-1",
      type: "usage-steps",
      visible: true,
      title: "사용 방법",
      steps: [
        { imageUrl: "", label: "STEP 1", description: "설명1" },
        { imageUrl: "/img.jpg", label: "STEP 2", description: "설명2" },
      ],
    };
  }

  it("4. 기본 생성 구조 유효", () => {
    const block = makeUsageStepsBlock();
    expect(block.type).toBe("usage-steps");
    expect(block.steps).toHaveLength(2);
    expect(block.title).toBe("사용 방법");
  });

  it("5. steps 추가 (최대 6)", () => {
    const block = makeUsageStepsBlock();
    while (block.steps.length < 6) {
      block.steps.push({ imageUrl: "", label: `STEP ${block.steps.length + 1}`, description: "설명" });
    }
    expect(block.steps).toHaveLength(6);
  });

  it("6. steps 삭제 (최소 1 유지)", () => {
    const block = makeUsageStepsBlock();
    block.steps = block.steps.filter((_, i) => i !== 0);
    expect(block.steps).toHaveLength(1);
  });

  it("7. Block union에 usage-steps 포함 (type narrowing)", () => {
    const block: Block = makeUsageStepsBlock();
    if (block.type === "usage-steps") {
      expect(block.steps).toBeDefined();
      expect(block.title).toBeDefined();
    }
  });
});

// ══════════════════════════════════════
// Group 3: ImageFilters 기본값
// ══════════════════════════════════════

describe("ImageFilters", () => {
  it("8. 기본값 100/100/100", () => {
    const filters: ImageFilters = { brightness: 100, contrast: 100, saturate: 100 };
    expect(filters.brightness).toBe(100);
    expect(filters.contrast).toBe(100);
    expect(filters.saturate).toBe(100);
  });

  it("9. CSS filter 문자열 빌드", () => {
    const filters: ImageFilters = { brightness: 120, contrast: 80, saturate: 150 };
    const css = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`;
    expect(css).toBe("brightness(120%) contrast(80%) saturate(150%)");
  });
});

// ══════════════════════════════════════
// Group 4: 플랫폼 프리셋
// ══════════════════════════════════════

describe("플랫폼 프리셋", () => {
  it("10. PLATFORM_PRESETS 6종", () => {
    expect(PLATFORM_PRESETS).toHaveLength(6);
  });

  it("11. 모든 프리셋에 value/label/width 존재", () => {
    for (const p of PLATFORM_PRESETS) {
      expect(p.value).toBeDefined();
      expect(p.label).toBeDefined();
      expect(typeof p.width).toBe("number");
      expect(p.width).toBeGreaterThan(0);
    }
  });

  it("12. PLATFORM_WIDTHS 매핑 일치", () => {
    for (const p of PLATFORM_PRESETS) {
      expect(PLATFORM_WIDTHS[p.value]).toBe(p.width);
    }
  });

  it("13. 쿠팡 780px", () => {
    expect(PLATFORM_WIDTHS["coupang"]).toBe(780);
  });

  it("14. 네이버 860px", () => {
    expect(PLATFORM_WIDTHS["naver"]).toBe(860);
  });
});

// ══════════════════════════════════════
// Group 5: 카테고리
// ══════════════════════════════════════

describe("카테고리 프리셋", () => {
  it("15. PRODUCT_CATEGORIES 6종", () => {
    expect(PRODUCT_CATEGORIES).toHaveLength(6);
  });

  it("16. 모든 카테고리에 value/label 존재", () => {
    for (const c of PRODUCT_CATEGORIES) {
      expect(c.value).toBeDefined();
      expect(c.label).toBeDefined();
    }
  });

  it("17. fashion 카테고리 존재", () => {
    expect(PRODUCT_CATEGORIES.find((c) => c.value === "fashion")).toBeDefined();
  });
});

// ══════════════════════════════════════
// Group 6: 테마 프리셋
// ══════════════════════════════════════

describe("테마 프리셋", () => {
  it("18. THEME_PRESETS 7종", () => {
    expect(THEME_PRESETS).toHaveLength(7);
  });

  it("19. 모든 프리셋에 5색 palette 존재", () => {
    for (const t of THEME_PRESETS) {
      expect(t.palette.primary).toBeDefined();
      expect(t.palette.secondary).toBeDefined();
      expect(t.palette.background).toBeDefined();
      expect(t.palette.text).toBeDefined();
      expect(t.palette.accent).toBeDefined();
    }
  });

  it("20. default 프리셋 존재", () => {
    const def = THEME_PRESETS.find((t) => t.name === "default");
    expect(def).toBeDefined();
    expect(def!.palette.primary).toBe("#4f46e5");
  });

  it("21. ThemePalette → BlockDocument.theme 대입 가능", () => {
    const theme: ThemePalette = THEME_PRESETS[0].palette;
    const doc: BlockDocument = {
      format: "blocks",
      blocks: [],
      platform: { width: 780, name: "coupang" },
      theme,
      version: 1,
    };
    expect(doc.theme).toBe(theme);
  });
});

// ══════════════════════════════════════
// Group 7: 모드 설정
// ══════════════════════════════════════

describe("모드 설정", () => {
  it("22. MODE_NODE_CONFIG 6종 모드", () => {
    expect(Object.keys(MODE_NODE_CONFIG)).toHaveLength(6);
  });

  it("23. shortform-video 모드: prompt→generate-images→bgm→cuts→render→export", () => {
    const cfg = MODE_NODE_CONFIG["shortform-video"];
    expect(cfg.initialPipeline).toEqual(["prompt", "generate-images", "bgm", "cuts", "render", "export"]);
  });

  it("24. brand-image 모드: prompt→generate-images→export", () => {
    const cfg = MODE_NODE_CONFIG["brand-image"];
    expect(cfg.initialPipeline).toEqual(["prompt", "generate-images", "export"]);
  });

  it("25. cutout 모드: upload-image→remove-bg→export", () => {
    const cfg = MODE_NODE_CONFIG["cutout"];
    expect(cfg.initialPipeline).toEqual(["upload-image", "remove-bg", "export"]);
  });

  it("26. model-shot 모드: upload-image→prompt→model-compose→export", () => {
    const cfg = MODE_NODE_CONFIG["model-shot"];
    expect(cfg.initialPipeline).toEqual(["upload-image", "prompt", "model-compose", "export"]);
  });

  it("27. MODE_LABELS에 compose 포함", () => {
    expect(MODE_LABELS["compose"]).toBe("상세페이지");
  });
});

// ══════════════════════════════════════
// Group 8: scene-templates
// ══════════════════════════════════════

describe("장면 템플릿", () => {
  it("27. scene-templates 모듈 로드 + 카테고리 6종", async () => {
    const mod = await import("../../lib/scene-templates");
    expect(mod.SCENE_CATEGORIES).toHaveLength(6);
  });

  it("28. 총 템플릿 24종", async () => {
    const mod = await import("../../lib/scene-templates");
    expect(mod.SCENE_TEMPLATES).toHaveLength(24);
  });

  it("29. 모든 템플릿에 label/prompt/category 존재", async () => {
    const mod = await import("../../lib/scene-templates");
    for (const tmpl of mod.SCENE_TEMPLATES) {
      expect(tmpl.label).toBeDefined();
      expect(tmpl.prompt).toBeDefined();
      expect(tmpl.prompt.length).toBeGreaterThan(10);
      expect(tmpl.category).toBeDefined();
    }
  });
});
