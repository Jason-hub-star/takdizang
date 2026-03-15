"use client";

import { useState } from "react";
import { PREVIEW_TEMPLATE_OPTIONS } from "@/components/preview/remotion-preview-config";
import type { ExportArtifactRecord } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WORKSPACE_CONTROL, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import type { CompositionId, RemotionInputProps } from "@/types";
import { PreviewPlayerLoader } from "./preview-player-loader";
import { COMPOSITION_TO_TEMPLATE } from "./remotion-preview-config";
import { ShortformArtifactPanel } from "./shortform-artifact-panel";

export interface PreviewShellProps {
  projectId: string;
  initialCompositionId: CompositionId;
  inputProps: RemotionInputProps;
  projectName: string;
  projectMode: string | null;
  projectStatus: string;
  sectionCount: number;
  imageCount: number;
  posterSrc?: string;
  initialThumbnail: ExportArtifactRecord | null;
  initialMarketingScript: ExportArtifactRecord | null;
}

export function PreviewShell({
  projectId,
  initialCompositionId,
  inputProps,
  projectName,
  projectMode,
  projectStatus,
  sectionCount,
  imageCount,
  posterSrc,
  initialThumbnail,
  initialMarketingScript,
}: PreviewShellProps) {
  const [compositionId, setCompositionId] = useState<CompositionId>(initialCompositionId);
  const currentTemplateKey = COMPOSITION_TO_TEMPLATE[compositionId];

  return (
    <div className="space-y-6">
      <div className="takdi-panel-strong flex flex-wrap items-center justify-between gap-4 rounded-[1.8rem] px-5 py-4">
        <div>
          <p className="takdi-kicker">Preview runtime</p>
          <p className={`mt-2 text-sm font-semibold ${WORKSPACE_TEXT.title}`}>비율별 재생 플레이어</p>
          <p className={`mt-1 text-sm ${WORKSPACE_TEXT.body}`}>
            Status {projectStatus} · Sections {sectionCount} · Images {imageCount}
          </p>
        </div>
        <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.84)] p-1 shadow-sm">
          {PREVIEW_TEMPLATE_OPTIONS.map((option) => (
            <Button
              key={option.compositionId}
              type="button"
              size="sm"
              variant={compositionId === option.compositionId ? "default" : "ghost"}
              className={cn(
                "rounded-full px-4",
                compositionId === option.compositionId
                  ? "bg-[var(--takdi-accent)] text-white hover:bg-[var(--takdi-accent-strong)]"
                  : WORKSPACE_CONTROL.ghostButton,
              )}
              onClick={() => setCompositionId(option.compositionId)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <PreviewPlayerLoader
        compositionId={compositionId}
        inputProps={inputProps}
        projectName={projectName}
        sectionCount={sectionCount}
        imageCount={imageCount}
        posterSrc={posterSrc}
      />

      {projectMode === "shortform-video" ? (
        <ShortformArtifactPanel
          projectId={projectId}
          templateKey={currentTemplateKey}
          initialThumbnail={initialThumbnail}
          initialMarketingScript={initialMarketingScript}
        />
      ) : null}
    </div>
  );
}
