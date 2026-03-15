/** 동적 파이프라인 실행 엔진 — 엣지 기반 토폴로지 정렬 + 콜백 기반 실행 */

import type { Node, Edge } from "@xyflow/react";
import {
  startGenerate,
  pollGenerate,
  startGenerateImages,
  pollGenerateImages,
  startRender,
  startExport,
  pollExport,
  pollRenderStatus,
  startRemoveBg,
  pollRemoveBg,
  startModelCompose,
  pollModelCompose,
  type AsyncJobResponse,
  type JobPollResponse,
} from "./api-client";

export interface PipelineContext {
  ratio?: string;
  uploadedAssetId?: string;
  category?: string;
  manualSceneReady?: boolean;
  referenceAssetIds?: string[];
}

export interface NodeExecutor {
  start: (projectId: string, ctx?: PipelineContext) => Promise<AsyncJobResponse>;
  poll: (projectId: string, jobId: string) => Promise<JobPollResponse>;
  label: string;
}

export type NodeExecutorMap = Record<string, NodeExecutor | null>;

function createImmediateExecutor(label: string): NodeExecutor {
  return {
    start: async () => ({ jobId: `local-${label.replace(/\s+/g, "-")}`, status: "queued" }),
    poll: async (_projectId, jobId) => ({ job: { id: jobId, status: "done" } }),
    label,
  };
}

/** 노드 타입 → 실행 함수 매핑 (null = skip) */
export const NODE_EXECUTORS: NodeExecutorMap = {
  prompt: {
    start: (pid, ctx) => startGenerate(pid, { category: ctx?.category }),
    poll: pollGenerate,
    label: "프롬프트 처리",
  },
  "generate-images": {
    start: (pid, ctx) =>
      ctx?.manualSceneReady
        ? createImmediateExecutor("장면 준비 확인").start(pid, ctx)
        : startGenerateImages(pid, {
            aspectRatio: ctx?.ratio,
            referenceAssetIds: ctx?.referenceAssetIds,
          }),
    poll: pollGenerateImages,
    label: "이미지 생성",
  },
  render: {
    start: (pid, ctx) => startRender(pid, { templateKey: ctx?.ratio }),
    poll: pollRender,
    label: "영상/GIF 렌더",
  },
  export: {
    start: (pid) => startExport(pid),
    poll: pollExport,
    label: "내보내기",
  },
  bgm: createImmediateExecutor("배경음악 확인"),
  cuts: createImmediateExecutor("장면 편집 확인"),
  "upload-image": null,
  "remove-bg": {
    start: (pid, ctx) => startRemoveBg(pid, { assetId: ctx?.uploadedAssetId }),
    poll: pollRemoveBg,
    label: "배경 제거",
  },
  "model-compose": {
    start: (pid, ctx) => startModelCompose(pid, { assetId: ctx?.uploadedAssetId, aspectRatio: ctx?.ratio }),
    poll: pollModelCompose,
    label: "모델 합성",
  },
};

/** pollRenderStatus 래퍼 — jobId 기반 poll 인터페이스와 호환 */
function pollRender(projectId: string, _jobId: string): Promise<JobPollResponse> {
  return pollRenderStatus(projectId).then((res) => ({
    job: { id: res.jobId, status: res.status },
    artifact: res.artifact,
    artifacts: res.artifacts,
  }));
}

/** Kahn's algorithm 토폴로지 정렬 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    order.push(cur);
    for (const next of adj.get(cur) ?? []) {
      const newDeg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, newDeg);
      if (newDeg === 0) queue.push(next);
    }
  }

  if (order.length < nodeIds.size) {
    throw new Error("순환 참조가 감지되었습니다. 엣지 연결을 확인해 주세요.");
  }

  return order;
}

export interface StepTiming {
  nodeId: string;
  label: string;
  durationMs: number;
}

export interface PipelineCallbacks {
  onStepStart: (nodeId: string, label: string) => void;
  onStepDone: (nodeId: string, result: JobPollResponse) => void;
  onStepError: (nodeId: string, error: string) => void;
  onSkip: (nodeId: string, reason: string) => void;
  onEdgeActivate: (edgeId: string) => void;
  onEdgeDone: (edgeId: string) => void;
  onStepTiming?: (timing: StepTiming) => void;
  onPipelineDone?: (totalMs: number, timings: StepTiming[]) => void;
  shouldAbort: () => boolean;
  addLog: (msg: string, level?: "info" | "warn" | "error") => void;
}

/** poll until job is done */
async function pollUntilDone(
  projectId: string,
  jobId: string,
  pollFn: (projectId: string, jobId: string) => Promise<JobPollResponse>,
  shouldAbort: () => boolean,
): Promise<JobPollResponse> {
  const INTERVAL = 2000;
  const MAX_POLLS = 150;
  for (let i = 0; i < MAX_POLLS; i++) {
    if (shouldAbort()) throw new Error("중단됨");
    await new Promise((r) => setTimeout(r, INTERVAL));
    const res = await pollFn(projectId, jobId);
    const { status, error } = res.job;
    if (status === "done") return res;
    if (status === "failed") throw new Error(error ?? "작업 실패");
  }
  throw new Error("작업 시간 초과");
}

/** 동적 파이프라인 실행 — 토폴로지 순서대로 노드 실행 + 타이밍 측정 */
export async function executePipeline(
  projectId: string,
  nodes: Node[],
  edges: Edge[],
  callbacks: PipelineCallbacks,
  context?: PipelineContext,
  executors: NodeExecutorMap = NODE_EXECUTORS,
): Promise<void> {
  const order = topologicalSort(nodes, edges);
  const pipelineStart = performance.now();
  const timings: StepTiming[] = [];

  for (const nodeId of order) {
    if (callbacks.shouldAbort()) break;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const nodeType = (node.data as { nodeType: string }).nodeType;
    const executor = executors[nodeType] ?? null;

    // 이 노드로 들어오는 엣지 activate
    const inEdges = edges.filter((e) => e.target === nodeId);
    inEdges.forEach((e) => callbacks.onEdgeActivate(e.id));

    if (!executor) {
      callbacks.onSkip(nodeId, `${nodeType}은(는) 자동 실행을 지원하지 않습니다`);
      inEdges.forEach((e) => callbacks.onEdgeDone(e.id));
      continue;
    }

    const stepStart = performance.now();
    try {
      callbacks.onStepStart(nodeId, executor.label);
      const job = await executor.start(projectId, context);
      callbacks.addLog(`${executor.label} 작업 시작됨 (${job.jobId.slice(0, 8)}...)`, "info");

      const result = await pollUntilDone(projectId, job.jobId, executor.poll, callbacks.shouldAbort);
      const durationMs = Math.round(performance.now() - stepStart);
      const timing: StepTiming = { nodeId, label: executor.label, durationMs };
      timings.push(timing);
      callbacks.onStepTiming?.(timing);
      callbacks.addLog(`${executor.label} 완료 (${(durationMs / 1000).toFixed(1)}초)`, "info");
      callbacks.onStepDone(nodeId, result);
      inEdges.forEach((e) => callbacks.onEdgeDone(e.id));
    } catch (err) {
      const durationMs = Math.round(performance.now() - stepStart);
      timings.push({ nodeId, label: executor.label, durationMs });
      const msg = err instanceof Error ? err.message : "알 수 없는 오류";
      if (msg === "중단됨") {
        inEdges.forEach((e) => callbacks.onEdgeDone(e.id));
        break;
      }
      callbacks.onStepError(nodeId, msg);
      inEdges.forEach((e) => callbacks.onEdgeDone(e.id));
      throw err;
    }
  }

  const totalMs = Math.round(performance.now() - pipelineStart);
  callbacks.onPipelineDone?.(totalMs, timings);
}
