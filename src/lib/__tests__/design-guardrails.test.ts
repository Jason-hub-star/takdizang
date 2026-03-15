import { describe, it, expect } from "vitest";
import { validateBlocks, getBlockViolations, type GuardrailViolation } from "../design-guardrails";
import type { Block } from "@/types/blocks";

function makeBlock(type: Block["type"], overrides?: Partial<Block>): Block {
  const base = { id: `blk-${Math.random()}`, visible: true };
  switch (type) {
    case "hero":
      return { ...base, type: "hero", imageUrl: "", overlays: [], ...overrides } as Block;
    case "text-block":
      return { ...base, type: "text-block", heading: "H", body: "B", align: "left", ...overrides } as Block;
    case "cta":
      return { ...base, type: "cta", text: "T", subtext: "S", buttonLabel: "Buy", buttonUrl: "#", ...overrides } as Block;
    case "selling-point":
      return { ...base, type: "selling-point", items: [{ icon: "star", title: "T", description: "D" }], ...overrides } as Block;
    case "image-full":
      return { ...base, type: "image-full", imageUrl: "", overlays: [], ...overrides } as Block;
    case "image-grid":
      return { ...base, type: "image-grid", images: [], columns: 2, ...overrides } as Block;
    default:
      return { ...base, type: "text-block", heading: "H", body: "B", align: "left", ...overrides } as Block;
  }
}

describe("design-guardrails", () => {
  it("should pass with valid blocks", () => {
    const blocks: Block[] = [
      makeBlock("hero", { imageUrl: "http://example.com/img.jpg" }),
      makeBlock("selling-point"),
      makeBlock("cta"),
    ];
    const violations = validateBlocks(blocks);
    expect(violations).toHaveLength(0);
  });

  it("should warn on missing hero image", () => {
    const blocks = [makeBlock("hero"), makeBlock("cta")];
    const violations = validateBlocks(blocks);
    expect(violations.some((v) => v.rule === "missing-image")).toBe(true);
  });

  it("should warn on adjacent duplicate types", () => {
    const blocks = [makeBlock("text-block"), makeBlock("text-block"), makeBlock("cta")];
    const violations = validateBlocks(blocks);
    expect(violations.some((v) => v.rule === "adjacent-duplicate")).toBe(true);
  });

  it("should warn on missing CTA when 3+ blocks", () => {
    const blocks = [makeBlock("hero"), makeBlock("selling-point"), makeBlock("text-block")];
    const violations = validateBlocks(blocks);
    expect(violations.some((v) => v.rule === "no-cta")).toBe(true);
  });

  it("should not warn on missing CTA when less than 3 blocks", () => {
    const blocks = [makeBlock("hero"), makeBlock("selling-point")];
    const violations = validateBlocks(blocks);
    expect(violations.some((v) => v.rule === "no-cta")).toBe(false);
  });

  it("should warn on long text body > 150 chars", () => {
    const longBody = "a".repeat(200);
    const blocks = [makeBlock("text-block", { body: longBody } as any), makeBlock("cta")];
    const violations = validateBlocks(blocks);
    expect(violations.some((v) => v.rule === "max-text-length")).toBe(true);
  });

  it("should warn on small font in hero overlay", () => {
    const blocks = [
      makeBlock("hero", {
        overlays: [{ id: "o1", text: "Hi", x: 50, y: 50, fontSize: 10, color: "#fff", fontWeight: "bold", textAlign: "center" }],
      } as any),
      makeBlock("cta"),
    ];
    const violations = validateBlocks(blocks);
    expect(violations.some((v) => v.rule === "min-font-size")).toBe(true);
  });

  it("should skip hidden blocks", () => {
    const blocks = [makeBlock("hero", { visible: false }), makeBlock("cta")];
    const violations = validateBlocks(blocks);
    // No missing-image warning for hidden hero
    expect(violations.some((v) => v.rule === "missing-image")).toBe(false);
  });

  it("getBlockViolations filters correctly", () => {
    const violations: GuardrailViolation[] = [
      { blockId: "a", rule: "test", message: "", severity: "warning", autoFixable: false },
      { blockId: "b", rule: "test", message: "", severity: "warning", autoFixable: false },
    ];
    expect(getBlockViolations("a", violations)).toHaveLength(1);
    expect(getBlockViolations("c", violations)).toHaveLength(0);
  });

  it("should warn on empty image-grid", () => {
    const blocks = [makeBlock("image-grid"), makeBlock("cta")];
    const violations = validateBlocks(blocks);
    expect(violations.some((v) => v.rule === "missing-image")).toBe(true);
  });
});
