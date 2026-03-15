import type { Block, BlockDocument, ThemePalette, TextOverlay } from "@/types/blocks";

function nextId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function rehydrateOverlays(overlays: TextOverlay[] | undefined): TextOverlay[] {
  if (!overlays) {
    return [];
  }

  return overlays.map((overlay) => ({
    ...overlay,
    id: nextId("ovl"),
  }));
}

function rehydrateBlock(block: Block): Block {
  const nextBlock = cloneJson(block) as Block;
  nextBlock.id = nextId("blk");

  if ("overlays" in nextBlock) {
    nextBlock.overlays = rehydrateOverlays(nextBlock.overlays);
  }

  return nextBlock;
}

function firstNonEmpty(values: Array<string | undefined>) {
  for (const value of values) {
    const normalized = value?.trim();
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function blockPreviewText(block: Block) {
  switch (block.type) {
    case "hero":
    case "image-full":
      return firstNonEmpty(block.overlays.map((overlay) => overlay.text));
    case "selling-point":
      return firstNonEmpty([
        ...block.items.map((item) => item.title),
        ...block.items.map((item) => item.description),
      ]);
    case "text-block":
      return firstNonEmpty([block.heading, block.body]);
    case "image-text":
      return firstNonEmpty([block.heading, block.body]);
    case "spec-table":
      return firstNonEmpty([block.title, ...block.rows.map((row) => row.label), ...block.rows.map((row) => row.value)]);
    case "comparison":
      return firstNonEmpty([block.title, block.before.label, block.after.label]);
    case "review":
      return firstNonEmpty([block.title, ...block.reviews.map((review) => review.text)]);
    case "video":
      return firstNonEmpty([block.posterUrl, block.videoUrl]);
    case "cta":
      return firstNonEmpty([block.text, block.subtext, block.buttonLabel]);
    case "usage-steps":
      return firstNonEmpty([block.title, ...block.steps.map((step) => step.label), ...block.steps.map((step) => step.description)]);
    case "faq":
      return firstNonEmpty([block.title, ...block.items.map((item) => item.question), ...block.items.map((item) => item.answer)]);
    case "notice":
      return firstNonEmpty([block.title, ...block.items.map((item) => item.text)]);
    case "banner-strip":
      return firstNonEmpty([block.text, block.subtext]);
    case "price-promo":
      return firstNonEmpty([block.productName, block.badge, block.expiresLabel]);
    case "trust-badge":
      return firstNonEmpty([block.title, ...block.badges.map((badge) => badge.label)]);
    case "image-grid":
      return firstNonEmpty(block.images.map((image) => image.caption));
    case "divider":
      return null;
    default:
      return null;
  }
}

export function createTemplatePreviewTitle(doc: BlockDocument) {
  for (const block of doc.blocks) {
    const preview = blockPreviewText(block);
    if (preview) {
      return preview.slice(0, 80);
    }
  }

  return "Saved template";
}

export function createTemplateSnapshot(doc: BlockDocument): BlockDocument {
  return cloneJson(doc);
}

export function instantiateTemplateDocument(doc: BlockDocument): BlockDocument {
  return {
    format: "blocks",
    blocks: doc.blocks.map((block) => rehydrateBlock(block)),
    platform: cloneJson(doc.platform),
    theme: doc.theme ? cloneJson(doc.theme as ThemePalette) : undefined,
    version: doc.version,
  };
}
