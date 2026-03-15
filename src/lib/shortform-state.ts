import type { Edge, Node } from "@xyflow/react";
import type {
  GenerationResultSection,
  ShortformCut,
  ShortformProjectState,
  ShortformRenderPreset,
  ShortformSceneAssignment,
} from "@/types";

export interface ProjectContentEnvelope {
  nodes?: Node[];
  edges?: Edge[];
  shortform?: ShortformProjectState;
  sections?: GenerationResultSection[];
}

export const DEFAULT_SHORTFORM_DURATION_MS = 3000;
export const SHORTFORM_RENDER_TEMPLATES: Array<ShortformRenderPreset["templateKey"]> = ["9:16", "1:1", "16:9"];

interface ShortformRenderArtifact {
  templateKey: ShortformRenderPreset["templateKey"];
  artifactId: string;
  filePath: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeSections(value: unknown): GenerationResultSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((section) => {
      if (!isRecord(section)) {
        return null;
      }

      const headline = typeof section.headline === "string" ? section.headline : "";
      const body = typeof section.body === "string" ? section.body : "";
      const imageSlot = typeof section.imageSlot === "string" ? section.imageSlot : "";
      const styleKey = typeof section.styleKey === "string" ? section.styleKey : "default";

      if (!headline && !body && !imageSlot) {
        return null;
      }

      return {
        headline,
        body,
        imageSlot: imageSlot || `slot-${Math.random().toString(36).slice(2, 8)}`,
        styleKey,
      };
    })
    .filter((section): section is GenerationResultSection => Boolean(section));
}

function normalizeSceneAssignments(value: unknown, sections: GenerationResultSection[]): ShortformSceneAssignment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const validSlots = new Set(sections.map((section) => section.imageSlot));
  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const imageSlot = typeof item.imageSlot === "string" ? item.imageSlot : "";
      const assetId = typeof item.assetId === "string" ? item.assetId : "";
      const filePath = typeof item.filePath === "string" ? item.filePath : "";
      const source = item.source === "generated" || item.source === "reference" ? item.source : "manual";

      if (!imageSlot || !assetId || !filePath || !validSlots.has(imageSlot)) {
        return null;
      }

      return { imageSlot, assetId, filePath, source };
    })
    .filter((item): item is ShortformSceneAssignment => Boolean(item));
}

function normalizeCuts(value: unknown, sections: GenerationResultSection[]): ShortformCut[] {
  const rawCuts = Array.isArray(value)
    ? value
        .map((item) => {
          if (!isRecord(item) || typeof item.imageSlot !== "string") {
            return null;
          }

          return {
            imageSlot: item.imageSlot,
            order: typeof item.order === "number" ? item.order : 0,
            durationMs: typeof item.durationMs === "number" ? item.durationMs : DEFAULT_SHORTFORM_DURATION_MS,
            enabled: typeof item.enabled === "boolean" ? item.enabled : true,
            transition: item.transition === "fade" ? "fade" : "cut",
          } satisfies ShortformCut;
        })
        .filter((item): item is ShortformCut => Boolean(item))
    : [];

  const bySlot = new Map(rawCuts.map((cut) => [cut.imageSlot, cut]));
  return sections.map((section, index) => ({
    imageSlot: section.imageSlot,
    order: bySlot.get(section.imageSlot)?.order ?? index,
    durationMs: bySlot.get(section.imageSlot)?.durationMs ?? DEFAULT_SHORTFORM_DURATION_MS,
    enabled: bySlot.get(section.imageSlot)?.enabled ?? true,
    transition: bySlot.get(section.imageSlot)?.transition ?? "cut",
  }));
}

function normalizeRenderPresets(value: unknown): ShortformRenderPreset[] {
  const presets: ShortformRenderPreset[] = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!isRecord(item)) {
          return [];
        }

        const templateKey = item.templateKey;
        if (templateKey !== "9:16" && templateKey !== "1:1" && templateKey !== "16:9") {
          return [];
        }

        return [{
          templateKey,
          enabled: typeof item.enabled === "boolean" ? item.enabled : true,
          artifactId: typeof item.artifactId === "string" ? item.artifactId : undefined,
          filePath: typeof item.filePath === "string" ? item.filePath : undefined,
        }];
      })
    : [];

  if (presets.length === 0) {
    return SHORTFORM_RENDER_TEMPLATES.map((templateKey) => ({ templateKey, enabled: true }));
  }

  const byKey = new Map(presets.map((preset) => [preset.templateKey, preset]));
  return SHORTFORM_RENDER_TEMPLATES.map((templateKey) => byKey.get(templateKey) ?? { templateKey, enabled: true });
}

export function createShortformState(sections: GenerationResultSection[] = []): ShortformProjectState {
  return {
    sections,
    sceneAssignments: [],
    referenceAssetIds: [],
    bgm: null,
    cuts: sections.map((section, index) => ({
      imageSlot: section.imageSlot,
      order: index,
      durationMs: DEFAULT_SHORTFORM_DURATION_MS,
      enabled: true,
      transition: "cut",
    })),
    renderPresets: SHORTFORM_RENDER_TEMPLATES.map((templateKey) => ({ templateKey, enabled: true })),
    generationMode: "demo",
  };
}

export function parseProjectContentEnvelope(content?: string | null): ProjectContentEnvelope | null {
  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as unknown;
    return isRecord(parsed) ? (parsed as ProjectContentEnvelope) : null;
  } catch {
    return null;
  }
}

export function getShortformStateFromContent(content?: string | null): ShortformProjectState | null {
  const envelope = parseProjectContentEnvelope(content);
  if (!envelope) {
    return null;
  }

  const sections = normalizeSections(envelope.shortform?.sections ?? envelope.sections);
  if (sections.length === 0) {
    return null;
  }

  const shortform = (isRecord(envelope.shortform) ? envelope.shortform : {}) as Record<string, unknown>;
  return {
    sections,
    sceneAssignments: normalizeSceneAssignments(shortform.sceneAssignments, sections),
    referenceAssetIds: Array.isArray(shortform.referenceAssetIds)
      ? shortform.referenceAssetIds.filter((value): value is string => typeof value === "string").slice(0, 3)
      : [],
    bgm:
      isRecord(shortform.bgm) &&
      typeof shortform.bgm.assetId === "string" &&
      typeof shortform.bgm.filePath === "string"
        ? {
            assetId: shortform.bgm.assetId,
            filePath: shortform.bgm.filePath,
            durationMs: typeof shortform.bgm.durationMs === "number" ? shortform.bgm.durationMs : null,
            bpm: typeof shortform.bgm.bpm === "number" ? shortform.bgm.bpm : null,
          }
        : null,
    cuts: normalizeCuts(shortform.cuts, sections),
    renderPresets: normalizeRenderPresets(shortform.renderPresets),
    generationMode: shortform.generationMode === "ai" ? "ai" : "demo",
  };
}

export function upsertShortformSections(
  current: ShortformProjectState | null,
  sections: GenerationResultSection[],
): ShortformProjectState {
  const base = current ?? createShortformState(sections);
  const nextCuts = normalizeCuts(base.cuts, sections);
  const validSlots = new Set(sections.map((section) => section.imageSlot));

  return {
    ...base,
    sections,
    sceneAssignments: base.sceneAssignments.filter((assignment) => validSlots.has(assignment.imageSlot)),
    cuts: nextCuts,
  };
}

export function serializeProjectContent(options: {
  nodes: Node[];
  edges: Edge[];
  shortform?: ShortformProjectState | null;
}) {
  const content: ProjectContentEnvelope = {
    nodes: options.nodes,
    edges: options.edges,
  };

  if (options.shortform) {
    content.shortform = options.shortform;
    content.sections = options.shortform.sections;
  }

  return JSON.stringify(content);
}

export function parseEditorGraph(content?: string | null) {
  const envelope = parseProjectContentEnvelope(content);
  if (!envelope || !Array.isArray(envelope.nodes) || !Array.isArray(envelope.edges)) {
    return null;
  }

  return {
    nodes: envelope.nodes as Node[],
    edges: envelope.edges as Edge[],
  };
}

export function hasSceneAssignmentsForAllSections(state: ShortformProjectState | null) {
  if (!state || state.sections.length === 0) {
    return false;
  }

  const assignedSlots = new Set(state.sceneAssignments.map((assignment) => assignment.imageSlot));
  return state.sections.every((section) => assignedSlots.has(section.imageSlot));
}

export function applyShortformRenderArtifacts(
  state: ShortformProjectState | null,
  artifacts: ShortformRenderArtifact[],
) {
  if (!state || artifacts.length === 0) {
    return state;
  }

  const byKey = new Map(artifacts.map((artifact) => [artifact.templateKey, artifact]));
  return {
    ...state,
    renderPresets: SHORTFORM_RENDER_TEMPLATES.map((templateKey) => {
      const existing = state.renderPresets.find((preset) => preset.templateKey === templateKey) ?? {
        templateKey,
        enabled: true,
      };
      const artifact = byKey.get(templateKey);
      if (!artifact) {
        return existing;
      }

      return {
        ...existing,
        enabled: true,
        artifactId: artifact.artifactId,
        filePath: artifact.filePath,
      };
    }),
  };
}
