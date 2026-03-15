"use client";

import type { Block } from "@/types/blocks";
import {
  ComparisonBlockRenderer,
  CtaBlockRenderer,
  DividerBlockRenderer,
  HeroBlockRenderer,
  ImageFullBlockRenderer,
  ImageGridBlockRenderer,
  ImageTextBlockRenderer,
  ReviewBlockRenderer,
  SellingPointBlockRenderer,
  SpecTableBlockRenderer,
  TextBlockRenderer,
  UsageStepsBlockRenderer,
  VideoBlockRenderer,
  FaqBlockRenderer,
  NoticeBlockRenderer,
  BannerStripBlockRenderer,
  PricePromoBlockRenderer,
  TrustBadgeBlockRenderer,
} from "./block-renderers";

interface BlockDispatchProps {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<Block>) => void;
  readOnly?: boolean;
}

export function BlockDispatch({
  block,
  selected,
  onSelect,
  onUpdate,
  readOnly,
}: BlockDispatchProps) {
  const props = {
    selected,
    onSelect,
    onUpdate: onUpdate as never,
    readOnly,
  };

  switch (block.type) {
    case "hero":
      return <HeroBlockRenderer block={block} {...props} />;
    case "selling-point":
      return <SellingPointBlockRenderer block={block} {...props} />;
    case "text-block":
      return <TextBlockRenderer block={block} {...props} />;
    case "image-text":
      return <ImageTextBlockRenderer block={block} {...props} />;
    case "image-full":
      return <ImageFullBlockRenderer block={block} {...props} />;
    case "image-grid":
      return <ImageGridBlockRenderer block={block} {...props} />;
    case "spec-table":
      return <SpecTableBlockRenderer block={block} {...props} />;
    case "comparison":
      return <ComparisonBlockRenderer block={block} {...props} />;
    case "review":
      return <ReviewBlockRenderer block={block} {...props} />;
    case "divider":
      return <DividerBlockRenderer block={block} {...props} />;
    case "video":
      return <VideoBlockRenderer block={block} {...props} />;
    case "cta":
      return <CtaBlockRenderer block={block} {...props} />;
    case "usage-steps":
      return <UsageStepsBlockRenderer block={block} {...props} />;
    case "faq":
      return <FaqBlockRenderer block={block} {...props} />;
    case "notice":
      return <NoticeBlockRenderer block={block} {...props} />;
    case "banner-strip":
      return <BannerStripBlockRenderer block={block} {...props} />;
    case "price-promo":
      return <PricePromoBlockRenderer block={block} {...props} />;
    case "trust-badge":
      return <TrustBadgeBlockRenderer block={block} {...props} />;
    default:
      return null;
  }
}
