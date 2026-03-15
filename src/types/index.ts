// Project status lifecycle: draft -> generating -> generated -> exported
// Fail path: draft -> generating -> failed
export type ProjectStatus = "draft" | "generating" | "generated" | "failed" | "exported";
export type ProjectMode =
  | "compose"
  | "shortform-video"
  | "model-shot"
  | "cutout"
  | "brand-image"
  | "gif-source"
  | "freeform";

export type PlanTier = "solo_free" | "starter" | "pro" | "agency";

export type AssetSourceType = "uploaded" | "generated" | "byoi_edited";
export type ExportArtifactType =
  | "html"
  | "single"
  | "split"
  | "card-news"
  | "video"
  | "gif"
  | "thumbnail"
  | "marketing-script";

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface GenerationResultSection {
  headline: string;
  body: string;
  imageSlot: string;
  styleKey: string;
}

export interface GenerationResult {
  sections: GenerationResultSection[];
}

export interface MarketingScript {
  hook: string;
  body: string;
  hashtags: string[];
}

export type ShortformSceneSource = "manual" | "generated" | "reference";
export type ShortformGenerationMode = "demo" | "ai";
export type ShortformTransitionType = "cut" | "fade";

export interface ShortformSceneAssignment {
  imageSlot: string;
  assetId: string;
  filePath: string;
  source: ShortformSceneSource;
}

export interface ShortformBgm {
  assetId: string;
  filePath: string;
  durationMs?: number | null;
  bpm?: number | null;
}

export interface ShortformCut {
  imageSlot: string;
  order: number;
  durationMs: number;
  enabled: boolean;
  transition: ShortformTransitionType;
}

export interface ShortformRenderPreset {
  templateKey: "9:16" | "1:1" | "16:9";
  enabled: boolean;
  artifactId?: string;
  filePath?: string;
}

export interface ShortformProjectState {
  sections: GenerationResultSection[];
  sceneAssignments: ShortformSceneAssignment[];
  referenceAssetIds: string[];
  bgm: ShortformBgm | null;
  cuts: ShortformCut[];
  renderPresets: ShortformRenderPreset[];
  generationMode: ShortformGenerationMode;
}

export interface ShortformRenderScene {
  imageSlot: string;
  headline: string;
  body: string;
  imageSrc?: string;
  durationMs: number;
  enabled: boolean;
  transition: ShortformTransitionType;
}

export interface CutHandoffPayload {
  projectId: string;
  selectedImageId: string;
  preserveOriginal: boolean;
}

// Block editor types
export type { BlockType, TextOverlay, Block, BlockDocument } from "./blocks";
export type {
  HeroBlock,
  SellingPointBlock,
  ImageFullBlock,
  ImageGridBlock,
  TextBlockBlock,
  ImageTextBlock,
  SpecTableBlock,
  ComparisonBlock,
  ReviewBlock,
  DividerBlock,
  VideoBlock,
  CtaBlock,
} from "./blocks";

// Remotion composition IDs — keep stable for automation
export type CompositionId = "TakdiVideo-916" | "TakdiVideo-1x1" | "TakdiVideo-169";

export interface RemotionInputProps {
  title: string;
  sections: GenerationResultSection[];
  selectedImages: string[];
  scenes: ShortformRenderScene[];
  bgmMetadata: {
    src: string;
    bpm?: number;
    durationMs?: number;
  };
  templateKey: string;
  totalDurationFrames?: number;
}
