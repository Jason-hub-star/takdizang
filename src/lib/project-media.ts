/** Server-side helpers for resolving sections, artifacts, and representative media for a project. */
import { prisma } from "@/lib/prisma";
import type {
  ExportArtifactType,
  GenerationResultSection,
  RemotionInputProps,
  ShortformCut,
  ShortformProjectState,
  ShortformRenderScene,
} from "@/types";
import {
  createShortformState,
  getShortformStateFromContent,
} from "@/lib/shortform-state";

export interface ResolvedProjectSections {
  sections: GenerationResultSection[];
  source: "content" | "generation-job" | "none";
}

export async function resolveProjectSections(
  projectId: string,
  projectContent?: string | null,
): Promise<ResolvedProjectSections> {
  const shortform = getShortformStateFromContent(projectContent);
  if (shortform?.sections.length) {
    return { sections: shortform.sections, source: "content" };
  }

  const jobs = await prisma.generationJob.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { output: true },
  });

  for (const job of jobs) {
    if (!job.output) {
      continue;
    }

    try {
      const parsed = JSON.parse(job.output) as { sections?: GenerationResultSection[] };
      if (Array.isArray(parsed.sections)) {
        return { sections: parsed.sections, source: "generation-job" };
      }
    } catch {
      // continue
    }
  }

  return { sections: [], source: "none" };
}

function buildFallbackCuts(
  state: ShortformProjectState | null,
  sections: GenerationResultSection[],
): ShortformCut[] {
  return (state ?? createShortformState(sections)).cuts
    .filter((cut) => sections.some((section) => section.imageSlot === cut.imageSlot))
    .sort((left, right) => left.order - right.order);
}

function buildSceneImageMap(state: ShortformProjectState | null, fallbackImagePaths: string[]) {
  const map = new Map<string, string>();
  state?.sceneAssignments.forEach((assignment) => {
    map.set(assignment.imageSlot, assignment.filePath);
  });

  return { map, fallbackImagePaths };
}

function toFrames(durationMs: number, fps = 30) {
  return Math.max(30, Math.round((durationMs / 1000) * fps));
}

export async function resolveShortformInputProps(
  projectId: string,
  projectName: string,
  projectContent: string | null | undefined,
  templateKey: "9:16" | "1:1" | "16:9",
): Promise<RemotionInputProps> {
  const [resolvedSections, imagePaths] = await Promise.all([
    resolveProjectSections(projectId, projectContent),
    resolveProjectImagePaths(projectId),
  ]);

  const state = getShortformStateFromContent(projectContent);
  const sections = resolvedSections.sections;
  const cuts = buildFallbackCuts(state, sections);
  const sceneImageMap = buildSceneImageMap(state, imagePaths);
  const availableFallbacks = [...sceneImageMap.fallbackImagePaths];

  const scenes = cuts
    .flatMap((cut): ShortformRenderScene[] => {
      const section = sections.find((candidate) => candidate.imageSlot === cut.imageSlot);
      if (!section) {
        return [];
      }

      const assignedImage = sceneImageMap.map.get(section.imageSlot) ?? availableFallbacks.shift();

      return [{
        imageSlot: section.imageSlot,
        headline: section.headline,
        body: section.body,
        imageSrc: assignedImage,
        durationMs: cut.durationMs,
        enabled: cut.enabled,
        transition: cut.transition,
      }];
    })
    .filter((scene) => scene.enabled);

  const selectedImages = scenes
    .map((scene) => scene.imageSrc)
    .filter((imageSrc): imageSrc is string => typeof imageSrc === "string" && imageSrc.length > 0);

  return {
    title: projectName,
    sections,
    selectedImages,
    scenes,
    bgmMetadata: state?.bgm
      ? {
          src: state.bgm.filePath,
          bpm: state.bgm.bpm ?? undefined,
          durationMs: state.bgm.durationMs ?? undefined,
        }
      : { src: "" },
    templateKey,
    totalDurationFrames: scenes.reduce((sum, scene) => sum + toFrames(scene.durationMs), 0),
  };
}

export async function resolveProjectImagePaths(projectId: string) {
  const assets = await prisma.asset.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: {
      filePath: true,
      mimeType: true,
      sourceType: true,
      createdAt: true,
    },
  });

  return assets
    .filter((asset) => asset.mimeType?.startsWith("image/"))
    .sort((left, right) => {
      if (left.sourceType === right.sourceType) {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      }
      if (left.sourceType === "generated") {
        return -1;
      }
      if (right.sourceType === "generated") {
        return 1;
      }
      return 0;
    })
    .map((asset) => asset.filePath);
}

export async function listProjectArtifacts(
  projectId: string,
  types?: ExportArtifactType[],
) {
  return prisma.exportArtifact.findMany({
    where: {
      projectId,
      ...(types ? { type: { in: types } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      filePath: true,
      metadata: true,
      createdAt: true,
    },
  });
}
