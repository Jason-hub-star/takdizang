/** Compose result preview regression tests for shared block rendering. */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlockPreview } from "@/components/compose/block-preview";
import type {
  Block,
  ComparisonBlock,
  CtaBlock,
  HeroBlock,
  SellingPointBlock,
  SpecTableBlock,
  ThemePalette,
} from "@/types/blocks";

const theme: ThemePalette = {
  primary: "#f97316",
  secondary: "#fed7aa",
  background: "#fff7ed",
  text: "#7c2d12",
  accent: "#ea580c",
};

const heroBlock: HeroBlock = {
  id: "hero-1",
  type: "hero",
  visible: true,
  imageUrl: "/uploads/demo/hero.webp",
  overlays: [
    {
      id: "overlay-1",
      text: "Hero copy",
      x: 50,
      y: 50,
      fontSize: 48,
      color: "#ffffff",
      fontWeight: "bold",
      textAlign: "center",
    },
  ],
};

const sellingPointBlock: SellingPointBlock = {
  id: "selling-1",
  type: "selling-point",
  visible: true,
  items: [
    {
      icon: "star",
      title: "Core point",
      description: "Explain the offer clearly.",
    },
  ],
};

const specTableBlock: SpecTableBlock = {
  id: "spec-1",
  type: "spec-table",
  visible: true,
  title: "Specs",
  rows: [
    {
      label: "Size",
      value: "Large",
    },
  ],
};

const ctaBlock: CtaBlock = {
  id: "cta-1",
  type: "cta",
  visible: true,
  text: "Buy now",
  subtext: "Limited offer",
  buttonLabel: "Purchase",
  buttonUrl: "https://example.com",
  bgColor: "#111827",
  buttonColor: "#ffffff",
};

const hiddenComparisonBlock: ComparisonBlock = {
  id: "comparison-hidden",
  type: "comparison",
  visible: false,
  title: "Before and after",
  before: { label: "Before", imageUrl: "/uploads/demo/before.webp" },
  after: { label: "After", imageUrl: "/uploads/demo/after.webp" },
};

function renderPreview(blocks: Block[]) {
  return renderToStaticMarkup(
    <BlockPreview blocks={blocks} platformWidth={780} theme={theme} />,
  );
}

describe("BlockPreview", () => {
  it("applies theme wrapper styles and hides invisible blocks", () => {
    const html = renderPreview([heroBlock, hiddenComparisonBlock, ctaBlock]);

    expect(html).toContain("--theme-bg:#fff7ed");
    expect(html).toContain("--theme-card-bg:color-mix");
    expect(html).toContain("background-color:#fff7ed");
    expect(html).toContain("color:#7c2d12");
    expect(html).toContain("Hero copy");
    expect(html).toContain("Buy now");
    expect(html).not.toContain("Before and after");
  });

  it("reuses compose block renderers for key block content in readOnly mode", () => {
    const html = renderPreview([heroBlock, sellingPointBlock, specTableBlock, ctaBlock]);

    expect(html).toContain("Hero copy");
    expect(html).toContain("Core point");
    expect(html).toContain("Specs");
    expect(html).toContain("Purchase");
    expect(html).toContain("pointer-events-none");
    expect(html).toContain("data-block-id=\"hero-1\"");
  });

  it("keeps the requested mobile preview width", () => {
    const html = renderToStaticMarkup(
      <BlockPreview
        blocks={[heroBlock]}
        platformWidth={780}
        theme={theme}
        mobilePreview
      />,
    );

    expect(html).toContain("data-mobile-preview=\"true\"");
    expect(html).toContain("width:375px");
  });
});
