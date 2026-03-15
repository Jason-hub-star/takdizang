/** Runtime contract helpers for validating project modes and export artifact types. */
import type { ExportArtifactType, ProjectMode } from "@/types";

export const PROJECT_MODES: ProjectMode[] = [
  "compose",
  "shortform-video",
  "model-shot",
  "cutout",
  "brand-image",
  "gif-source",
  "freeform",
];

export const EXPORT_ARTIFACT_TYPES: ExportArtifactType[] = [
  "html",
  "single",
  "split",
  "card-news",
  "video",
  "gif",
  "thumbnail",
  "marketing-script",
];

export function isProjectMode(value: unknown): value is ProjectMode {
  return typeof value === "string" && PROJECT_MODES.includes(value as ProjectMode);
}

export function isExportArtifactType(value: unknown): value is ExportArtifactType {
  return typeof value === "string" && EXPORT_ARTIFACT_TYPES.includes(value as ExportArtifactType);
}
