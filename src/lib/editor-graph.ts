import type { Edge, Node } from "@xyflow/react";
import {
  MODE_NODE_CONFIG,
  NODE_TYPE_LABELS,
  type FlowNodeType,
} from "@/lib/constants";
import { getModeSurfaceConfig, isGuidedMode } from "@/lib/editor-surface";

export type EditorGraphIssueCode =
  | "duplicate-node-type"
  | "missing-node-type"
  | "disallowed-node-type"
  | "invalid-edge"
  | "missing-edge";

export interface EditorGraphIssue {
  code: EditorGraphIssueCode;
  message: string;
  nodeType?: FlowNodeType;
  nodeIds?: string[];
  edgeId?: string;
}

export interface EditorGraphValidationResult {
  valid: boolean;
  issues: EditorGraphIssue[];
  repairable: boolean;
  repairedSnapshot: { nodes: Node[]; edges: Edge[] } | null;
}

function makeNodeId(nodeType: FlowNodeType, index: number): string {
  return `guided-${nodeType}-${index + 1}`;
}

function collectNodesByType(nodes: Node[]) {
  const map = new Map<FlowNodeType, Node[]>();
  for (const node of nodes) {
    const nodeType = (node.data as { nodeType?: string }).nodeType as FlowNodeType | undefined;
    if (!nodeType) {
      continue;
    }
    const group = map.get(nodeType) ?? [];
    group.push(node);
    map.set(nodeType, group);
  }
  return map;
}

function createGuidedSnapshot(mode: string, sourceNodes: Node[]): { nodes: Node[]; edges: Edge[] } {
  const config = MODE_NODE_CONFIG[mode] ?? MODE_NODE_CONFIG.freeform;
  const pipeline = config.initialPipeline;
  const byType = collectNodesByType(sourceNodes);
  const startX = 100;
  const gapX = 300;

  const nodes: Node[] = pipeline.map((nodeType, index) => {
    const sourceNode = byType.get(nodeType)?.[0];
    const sourceData = (sourceNode?.data as Record<string, unknown> | undefined) ?? {};

    return {
      id: makeNodeId(nodeType, index),
      type: "takdi",
      position: sourceNode?.position ?? { x: startX + index * gapX, y: 100 },
      data: {
        label: NODE_TYPE_LABELS[nodeType],
        ...sourceData,
        nodeType,
      },
    };
  });

  const edges: Edge[] = pipeline.slice(1).map((_, index) => ({
    id: `guided-e${index + 1}-${index + 2}`,
    source: nodes[index].id,
    target: nodes[index + 1].id,
  }));

  return { nodes, edges };
}

function expectedEdgePairs(mode: string) {
  const stepOrder = getModeSurfaceConfig(mode).stepOrder ?? [];
  const pairs = new Set<string>();
  for (let index = 0; index < stepOrder.length - 1; index += 1) {
    pairs.add(`${stepOrder[index]}->${stepOrder[index + 1]}`);
  }
  return pairs;
}

export function repairEditorGraph(mode: string, nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  if (!isGuidedMode(mode)) {
    return { nodes, edges };
  }
  return createGuidedSnapshot(mode, nodes);
}

export function validateEditorGraph(mode: string, nodes: Node[], edges: Edge[]): EditorGraphValidationResult {
  if (!isGuidedMode(mode)) {
    return {
      valid: true,
      issues: [],
      repairable: false,
      repairedSnapshot: null,
    };
  }

  const config = MODE_NODE_CONFIG[mode] ?? MODE_NODE_CONFIG.freeform;
  const allowedTypes = new Set(config.allowedNodes);
  const stepOrder = getModeSurfaceConfig(mode).stepOrder ?? config.initialPipeline;
  const byType = collectNodesByType(nodes);
  const issues: EditorGraphIssue[] = [];

  for (const node of nodes) {
    const nodeType = (node.data as { nodeType?: string }).nodeType as FlowNodeType | undefined;
    if (!nodeType || !allowedTypes.has(nodeType)) {
      issues.push({
        code: "disallowed-node-type",
        message: "허용되지 않은 단계가 포함되어 있습니다.",
        nodeIds: [node.id],
      });
    }
  }

  for (const nodeType of stepOrder) {
    const matchingNodes = byType.get(nodeType) ?? [];
    if (matchingNodes.length === 0) {
      issues.push({
        code: "missing-node-type",
        message: `${NODE_TYPE_LABELS[nodeType]} 단계가 없습니다.`,
        nodeType,
      });
      continue;
    }

    if (matchingNodes.length > 1) {
      issues.push({
        code: "duplicate-node-type",
        message: `${NODE_TYPE_LABELS[nodeType]} 단계는 1개만 사용할 수 있습니다.`,
        nodeType,
        nodeIds: matchingNodes.map((node) => node.id),
      });
    }
  }

  const expectedPairs = expectedEdgePairs(mode);
  const seenPairs = new Set<string>();

  for (const edge of edges) {
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    const sourceType = (sourceNode?.data as { nodeType?: string } | undefined)?.nodeType as FlowNodeType | undefined;
    const targetType = (targetNode?.data as { nodeType?: string } | undefined)?.nodeType as FlowNodeType | undefined;
    const pairKey = sourceType && targetType ? `${sourceType}->${targetType}` : null;

    if (!pairKey || !expectedPairs.has(pairKey)) {
      issues.push({
        code: "invalid-edge",
        message: "가이드형 모드에서는 단계 순서 외의 연결을 사용할 수 없습니다.",
        edgeId: edge.id,
      });
      continue;
    }

    if (seenPairs.has(pairKey)) {
      issues.push({
        code: "invalid-edge",
        message: "가이드형 모드에서는 동일한 단계 연결을 중복해서 사용할 수 없습니다.",
        edgeId: edge.id,
      });
      continue;
    }

    seenPairs.add(pairKey);
  }

  for (const expectedPair of expectedPairs) {
    if (!seenPairs.has(expectedPair)) {
      const [sourceType, targetType] = expectedPair.split("->") as [FlowNodeType, FlowNodeType];
      issues.push({
        code: "missing-edge",
        message: `${NODE_TYPE_LABELS[sourceType]} → ${NODE_TYPE_LABELS[targetType]} 연결이 누락되었습니다.`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    repairable: true,
    repairedSnapshot: createGuidedSnapshot(mode, nodes),
  };
}

export interface SimulationNodeExecutor {
  start: () => Promise<{ jobId: string; status: string }>;
  poll: () => Promise<{ job: { id: string; status: string }; assets?: { filePath: string }[] }>;
  label: string;
}

export function createSimulationExecutors() {
  const doneJob = { job: { id: "sim-job", status: "done" as const } };

  return {
    prompt: {
      label: "프롬프트 처리",
      start: async () => ({ jobId: "sim-prompt", status: "queued" }),
      poll: async () => doneJob,
    },
    "generate-images": {
      label: "이미지 생성",
      start: async () => ({ jobId: "sim-images", status: "queued" }),
      poll: async () => ({ ...doneJob, assets: [{ filePath: "/sim/generated.jpg" }] }),
    },
    render: {
      label: "렌더링",
      start: async () => ({ jobId: "sim-render", status: "queued" }),
      poll: async () => doneJob,
    },
    export: {
      label: "내보내기",
      start: async () => ({ jobId: "sim-export", status: "queued" }),
      poll: async () => doneJob,
    },
    bgm: null,
    cuts: null,
    "upload-image": null,
    "remove-bg": {
      label: "배경 제거",
      start: async () => ({ jobId: "sim-remove-bg", status: "queued" }),
      poll: async () => ({ ...doneJob, assets: [{ filePath: "/sim/remove-bg.png" }] }),
    },
    "model-compose": {
      label: "모델 합성",
      start: async () => ({ jobId: "sim-model-compose", status: "queued" }),
      poll: async () => ({ ...doneJob, assets: [{ filePath: "/sim/model-compose.jpg" }] }),
    },
  };
}
