import type { CompositionId } from "@/types";

export const COMPOSITIONS: Record<
  CompositionId,
  {
    width: number;
    height: number;
    label: string;
    aspectClassName: string;
    maxWidthClassName: string;
  }
> = {
  "TakdiVideo-916": {
    width: 1080,
    height: 1920,
    label: "9:16",
    aspectClassName: "aspect-[9/16]",
    maxWidthClassName: "max-w-sm",
  },
  "TakdiVideo-1x1": {
    width: 1080,
    height: 1080,
    label: "1:1",
    aspectClassName: "aspect-square",
    maxWidthClassName: "max-w-xl",
  },
  "TakdiVideo-169": {
    width: 1920,
    height: 1080,
    label: "16:9",
    aspectClassName: "aspect-video",
    maxWidthClassName: "max-w-4xl",
  },
};

export const TEMPLATE_TO_COMPOSITION: Record<string, CompositionId> = {
  "9:16": "TakdiVideo-916",
  "1:1": "TakdiVideo-1x1",
  "16:9": "TakdiVideo-169",
};

export const COMPOSITION_TO_TEMPLATE = Object.fromEntries(
  Object.entries(TEMPLATE_TO_COMPOSITION).map(([templateKey, compositionId]) => [compositionId, templateKey]),
) as Record<CompositionId, string>;

export const PREVIEW_TEMPLATE_OPTIONS = Object.entries(TEMPLATE_TO_COMPOSITION).map(
  ([label, compositionId]) => ({
    label,
    compositionId,
  }),
);
