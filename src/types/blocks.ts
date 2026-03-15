/** 상세페이지 블록 에디터 타입 정의 — 18종 블록 + BlockDocument */

// ─── Block Types ───

export type BlockType =
  | "hero"
  | "selling-point"
  | "image-full"
  | "image-grid"
  | "text-block"
  | "image-text"
  | "spec-table"
  | "comparison"
  | "review"
  | "divider"
  | "video"
  | "cta"
  | "usage-steps"
  | "faq"
  | "notice"
  | "banner-strip"
  | "price-promo"
  | "trust-badge";

// ─── Image Filters ───

export interface ImageFilters {
  brightness: number; // 0–200 (default 100)
  contrast: number;   // 0–200 (default 100)
  saturate: number;   // 0–200 (default 100)
}

// ─── Text Overlay ───

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // % (0–100)
  y: number; // % (0–100)
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  fontFamily?: string;
}

// ─── Base Block ───

interface BaseBlock {
  id: string;
  type: BlockType;
  visible: boolean;
  lockLayout?: boolean;
}

// ─── Typed Blocks ───

export interface HeroBlock extends BaseBlock {
  type: "hero";
  imageUrl: string;
  overlays: TextOverlay[];
  imageFilters?: ImageFilters;
}

export interface SellingPointBlock extends BaseBlock {
  type: "selling-point";
  layout?: "grid" | "horizontal";
  items: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface ImageFullBlock extends BaseBlock {
  type: "image-full";
  imageUrl: string;
  overlays: TextOverlay[];
  imageFilters?: ImageFilters;
}

export interface ImageGridBlock extends BaseBlock {
  type: "image-grid";
  images: Array<{ url: string; caption: string }>;
  columns: 2 | 3;
  shape?: "square" | "rounded" | "circle";
  imageFilters?: ImageFilters;
}

export interface TextBlockBlock extends BaseBlock {
  type: "text-block";
  heading: string;
  body: string;
  align: "left" | "center" | "right";
  fontSize?: "sm" | "base" | "lg" | "xl";
  fontFamily?: string;
}

export interface ImageTextBlock extends BaseBlock {
  type: "image-text";
  imageUrl: string;
  imagePosition: "left" | "right";
  heading: string;
  body: string;
  imageFilters?: ImageFilters;
  fontFamily?: string;
}

export interface SpecTableBlock extends BaseBlock {
  type: "spec-table";
  title: string;
  rows: Array<{ label: string; value: string }>;
}

export interface ComparisonBlock extends BaseBlock {
  type: "comparison";
  title: string;
  before: { label: string; imageUrl: string };
  after: { label: string; imageUrl: string };
  imageFilters?: ImageFilters;
}

export interface ReviewBlock extends BaseBlock {
  type: "review";
  title: string;
  reviews: Array<{ author: string; rating: number; text: string }>;
  displayStyle?: "card" | "quote" | "minimal" | "bubble";
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  style: "line" | "space" | "dot";
  height: number;
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  videoUrl: string;
  posterUrl: string;
  mediaType?: "mp4" | "gif";
}

export interface CtaBlock extends BaseBlock {
  type: "cta";
  text: string;
  subtext: string;
  buttonLabel: string;
  buttonUrl: string;
  bgColor?: string;
  buttonColor?: string;
  ctaStyle?: "default" | "gradient" | "dark" | "minimal";
}

export interface UsageStepsBlock extends BaseBlock {
  type: "usage-steps";
  title: string;
  steps: Array<{
    imageUrl: string;
    label: string;
    description: string;
  }>;
}

export interface FaqBlock extends BaseBlock {
  type: "faq";
  title: string;
  items: Array<{ question: string; answer: string }>;
}

export interface NoticeBlock extends BaseBlock {
  type: "notice";
  title: string;
  items: Array<{ icon: string; text: string }>;
  noticeStyle?: "default" | "compact";
}

export interface BannerStripBlock extends BaseBlock {
  type: "banner-strip";
  text: string;
  subtext?: string;
  bgColor?: string;
  textColor?: string;
}

export interface PricePromoBlock extends BaseBlock {
  type: "price-promo";
  productName: string;
  originalPrice: number;
  salePrice: number;
  badge?: string;
  expiresLabel?: string;
}

export interface TrustBadgeBlock extends BaseBlock {
  type: "trust-badge";
  title: string;
  badges: Array<{ icon: string; label: string }>;
}

// ─── Discriminated Union ───

export type Block =
  | HeroBlock
  | SellingPointBlock
  | ImageFullBlock
  | ImageGridBlock
  | TextBlockBlock
  | ImageTextBlock
  | SpecTableBlock
  | ComparisonBlock
  | ReviewBlock
  | DividerBlock
  | VideoBlock
  | CtaBlock
  | UsageStepsBlock
  | FaqBlock
  | NoticeBlock
  | BannerStripBlock
  | PricePromoBlock
  | TrustBadgeBlock;

// ─── Theme ───

export interface ThemePalette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

// ─── Block Document ───

export interface BlockDocument {
  format: "blocks";
  blocks: Block[];
  platform: {
    width: number;
    name: string;
  };
  theme?: ThemePalette;
  version: number;
}
