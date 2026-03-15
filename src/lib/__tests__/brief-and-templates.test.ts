import { describe, it, expect } from "vitest";
import { assembleBrief, isValidBrief, type BriefTags } from "../brief-assembler";
import { getTemplatesByCategory, getBestTemplate, LAYOUT_TEMPLATES } from "../layout-templates";
import { PERSUASION_SEQUENCES, TONE_PRESETS, TARGET_AUDIENCE, PRODUCT_CATEGORIES } from "../constants";
import type { BlockType } from "@/types/blocks";

// All valid block types
const VALID_TYPES = new Set<BlockType>([
  "hero", "selling-point", "image-full", "image-grid", "text-block", "image-text",
  "spec-table", "comparison", "review", "divider", "video", "cta", "usage-steps",
  "faq", "notice", "banner-strip", "price-promo", "trust-badge",
]);

describe("brief-assembler", () => {
  it("should assemble Korean brief from tags", () => {
    const tags: BriefTags = {
      productName: "실크 블라우스",
      category: "fashion",
      tone: "luxury",
      target: "30s-female",
      keywords: ["고급", "실크"],
    };
    const result = assembleBrief(tags);
    expect(result).toContain("실크 블라우스");
    expect(result).toContain("패션/의류");
    expect(result).toContain("럭셔리");
    expect(result).toContain("30대 여성");
    expect(result).toContain("고급, 실크");
  });

  it("isValidBrief requires productName and category", () => {
    expect(isValidBrief({ productName: "", category: "fashion", tone: "", target: "", keywords: [] })).toBe(false);
    expect(isValidBrief({ productName: "A", category: "", tone: "", target: "", keywords: [] })).toBe(false);
    expect(isValidBrief({ productName: "A", category: "fashion", tone: "", target: "", keywords: [] })).toBe(true);
  });
});

describe("layout-templates", () => {
  it("all templates use valid BlockType values", () => {
    for (const tmpl of LAYOUT_TEMPLATES) {
      for (const type of tmpl.sequence) {
        expect(VALID_TYPES.has(type), `Invalid type "${type}" in template "${tmpl.id}"`).toBe(true);
      }
    }
  });

  it("getTemplatesByCategory returns category + default", () => {
    const fashion = getTemplatesByCategory("fashion");
    expect(fashion.length).toBeGreaterThanOrEqual(2); // fashion-standard + defaults
    expect(fashion.some((t) => t.category === "fashion")).toBe(true);
    expect(fashion.some((t) => t.category === "default")).toBe(true);
  });

  it("getBestTemplate returns category-specific first", () => {
    expect(getBestTemplate("fashion").category).toBe("fashion");
    expect(getBestTemplate("beauty").category).toBe("beauty");
  });

  it("getBestTemplate falls back to minimal-basic for unknown", () => {
    expect(getBestTemplate("unknown").id).toBe("minimal-basic");
  });
});

describe("persuasion-sequences", () => {
  it("all sequences use valid BlockType values", () => {
    for (const [cat, seq] of Object.entries(PERSUASION_SEQUENCES)) {
      for (const type of seq) {
        expect(VALID_TYPES.has(type as BlockType), `Invalid type "${type}" in sequence "${cat}"`).toBe(true);
      }
    }
  });

  it("all sequences start with hero and end with cta", () => {
    for (const [cat, seq] of Object.entries(PERSUASION_SEQUENCES)) {
      expect(seq[0], `${cat} should start with hero`).toBe("hero");
      expect(seq[seq.length - 1], `${cat} should end with cta`).toBe("cta");
    }
  });

  it("all 6 product categories have a sequence", () => {
    for (const cat of PRODUCT_CATEGORIES) {
      expect(PERSUASION_SEQUENCES[cat.value], `Missing sequence for ${cat.value}`).toBeDefined();
    }
  });
});

describe("constants integrity", () => {
  it("TONE_PRESETS has 4 items", () => {
    expect(TONE_PRESETS).toHaveLength(4);
  });

  it("TARGET_AUDIENCE has 6 items", () => {
    expect(TARGET_AUDIENCE).toHaveLength(6);
  });
});
