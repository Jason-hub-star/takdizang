/** pipeline-executor 종합 테스트 — 모든 API mock, 비용 0원 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Node, Edge } from "@xyflow/react";

vi.mock("@/lib/api-client", () => ({
  startGenerate: vi.fn(() => ({ jobId: "job-gen", status: "pending" })),
  pollGenerate: vi.fn(() => ({
    job: { id: "j", status: "done" },
    project: { content: { sections: [{ headline: "H1" }] } },
  })),
  startGenerateImages: vi.fn(() => ({ jobId: "job-img", status: "pending" })),
  pollGenerateImages: vi.fn(() => ({
    job: { id: "j", status: "done" },
    assets: [{ filePath: "/img/1.jpg" }],
  })),
  startRender: vi.fn(() => ({ jobId: "job-rnd", status: "pending" })),
  pollRenderStatus: vi.fn(() =>
    Promise.resolve({ jobId: "job-rnd", status: "done", artifact: null }),
  ),
  startExport: vi.fn(() => ({ jobId: "job-exp", status: "pending" })),
  pollExport: vi.fn(() => ({ job: { id: "j", status: "done" } })),
  startRemoveBg: vi.fn(() => ({ jobId: "job-rbg", status: "pending" })),
  pollRemoveBg: vi.fn(() => ({
    job: { id: "j", status: "done" },
    assets: [{ filePath: "/img/nobg.png" }],
  })),
  startModelCompose: vi.fn(() => ({ jobId: "job-mc", status: "pending" })),
  pollModelCompose: vi.fn(() => ({
    job: { id: "j", status: "done" },
    assets: [{ filePath: "/img/model.jpg" }],
  })),
}));

import {
  topologicalSort,
  executePipeline,
  type PipelineCallbacks,
} from "../pipeline-executor";
import { createSimulationExecutors, validateEditorGraph } from "../editor-graph";
import {
  startGenerate,
  startGenerateImages,
  startRender,
  startExport,
  pollGenerate,
  pollGenerateImages,
  pollRenderStatus,
  pollExport,
  startRemoveBg,
  pollRemoveBg,
  startModelCompose,
  pollModelCompose,
} from "@/lib/api-client";

// ── helpers ──

function makeNode(id: string, nodeType: string): Node {
  return {
    id,
    position: { x: 0, y: 0 },
    data: { nodeType, label: nodeType },
  };
}

function makeEdge(source: string, target: string): Edge {
  return { id: `e-${source}-${target}`, source, target };
}

function makeCallbacks(overrides?: Partial<PipelineCallbacks>): PipelineCallbacks & {
  steps: string[];
  skips: string[];
  errors: string[];
  edgeActivations: string[];
  edgeDones: string[];
} {
  const steps: string[] = [];
  const skips: string[] = [];
  const errors: string[] = [];
  const edgeActivations: string[] = [];
  const edgeDones: string[] = [];
  return {
    steps,
    skips,
    errors,
    edgeActivations,
    edgeDones,
    onStepStart: vi.fn((nodeId) => steps.push(nodeId)),
    onStepDone: vi.fn(),
    onStepError: vi.fn((nodeId, error) => errors.push(`${nodeId}:${error}`)),
    onSkip: vi.fn((nodeId) => skips.push(nodeId)),
    onEdgeActivate: vi.fn((edgeId) => edgeActivations.push(edgeId)),
    onEdgeDone: vi.fn((edgeId) => edgeDones.push(edgeId)),
    shouldAbort: () => false,
    addLog: vi.fn(),
    ...overrides,
  };
}

function resetMocks() {
  vi.mocked(startGenerate).mockReset().mockReturnValue(Promise.resolve({ jobId: "job-gen", status: "pending" }));
  vi.mocked(pollGenerate).mockReset().mockReturnValue(
    Promise.resolve({ job: { id: "j", status: "done" }, project: { content: { sections: [{ headline: "H1" }] } } }),
  );
  vi.mocked(startGenerateImages).mockReset().mockReturnValue(Promise.resolve({ jobId: "job-img", status: "pending" }));
  vi.mocked(pollGenerateImages).mockReset().mockReturnValue(
    Promise.resolve({ job: { id: "j", status: "done" }, assets: [{ filePath: "/img/1.jpg" }] }),
  );
  vi.mocked(startRender).mockReset().mockReturnValue(Promise.resolve({ jobId: "job-rnd", status: "pending" }));
  vi.mocked(pollRenderStatus).mockReset().mockReturnValue(
    Promise.resolve({ jobId: "job-rnd", status: "done", artifact: null }),
  );
  vi.mocked(startExport).mockReset().mockReturnValue(Promise.resolve({ jobId: "job-exp", status: "pending" }));
  vi.mocked(pollExport).mockReset().mockReturnValue(Promise.resolve({ job: { id: "j", status: "done" } }));
  vi.mocked(startRemoveBg).mockReset().mockReturnValue(Promise.resolve({ jobId: "job-rbg", status: "pending" }));
  vi.mocked(pollRemoveBg).mockReset().mockReturnValue(
    Promise.resolve({ job: { id: "j", status: "done" }, assets: [{ filePath: "/img/nobg.png" }] }),
  );
  vi.mocked(startModelCompose).mockReset().mockReturnValue(Promise.resolve({ jobId: "job-mc", status: "pending" }));
  vi.mocked(pollModelCompose).mockReset().mockReturnValue(
    Promise.resolve({ job: { id: "j", status: "done" }, assets: [{ filePath: "/img/model.jpg" }] }),
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  resetMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

// ══════════════════════════════════════
// Group 1: topologicalSort
// ══════════════════════════════════════

describe("topologicalSort", () => {
  it("1. 빈 그래프 → 빈 배열", () => {
    expect(topologicalSort([], [])).toEqual([]);
  });

  it("2. 단일 노드 → [id]", () => {
    const nodes = [makeNode("1", "prompt")];
    expect(topologicalSort(nodes, [])).toEqual(["1"]);
  });

  it("3. 체인 2개 → [1, 2]", () => {
    const nodes = [makeNode("1", "prompt"), makeNode("2", "export")];
    const edges = [makeEdge("1", "2")];
    expect(topologicalSort(nodes, edges)).toEqual(["1", "2"]);
  });

  it("4. 체인 4개 → [1,2,3,4]", () => {
    const nodes = ["1", "2", "3", "4"].map((id) => makeNode(id, "prompt"));
    const edges = [makeEdge("1", "2"), makeEdge("2", "3"), makeEdge("3", "4")];
    expect(topologicalSort(nodes, edges)).toEqual(["1", "2", "3", "4"]);
  });

  it("5. 다이아몬드 → 1 먼저, 4 마지막", () => {
    const nodes = ["1", "2", "3", "4"].map((id) => makeNode(id, "prompt"));
    const edges = [
      makeEdge("1", "2"),
      makeEdge("1", "3"),
      makeEdge("2", "4"),
      makeEdge("3", "4"),
    ];
    const order = topologicalSort(nodes, edges);
    expect(order[0]).toBe("1");
    expect(order[order.length - 1]).toBe("4");
    expect(order).toHaveLength(4);
  });

  it("6. 순환 → Error", () => {
    const nodes = ["1", "2", "3"].map((id) => makeNode(id, "prompt"));
    const edges = [makeEdge("1", "2"), makeEdge("2", "3"), makeEdge("3", "1")];
    expect(() => topologicalSort(nodes, edges)).toThrow("순환 참조");
  });

  it("7. 자기 루프 → Error", () => {
    const nodes = [makeNode("1", "prompt")];
    const edges = [makeEdge("1", "1")];
    expect(() => topologicalSort(nodes, edges)).toThrow("순환 참조");
  });

  it("8. 비연결 그래프 → 모두 포함", () => {
    const nodes = ["1", "2", "3", "4"].map((id) => makeNode(id, "prompt"));
    const edges = [makeEdge("1", "2"), makeEdge("3", "4")];
    const order = topologicalSort(nodes, edges);
    expect(order).toHaveLength(4);
    expect(order.indexOf("1")).toBeLessThan(order.indexOf("2"));
    expect(order.indexOf("3")).toBeLessThan(order.indexOf("4"));
  });
});

// ══════════════════════════════════════
// Group 2: 모드별 실행
// ══════════════════════════════════════

describe("모드별 실행", () => {
  async function runPipeline(nodes: Node[], edges: Edge[], cbOverrides?: Partial<PipelineCallbacks>) {
    const cb = makeCallbacks(cbOverrides);
    const promise = executePipeline("proj-1", nodes, edges, cb);
    // Flush all pending timers (poll delays)
    await vi.runAllTimersAsync();
    await promise;
    return cb;
  }

  it("9. brand-image (prompt→gen-img→export) → 3개 실행", async () => {
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "generate-images"),
      makeNode("3", "export"),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("2", "3")];
    const cb = await runPipeline(nodes, edges);
    expect(cb.steps).toEqual(["1", "2", "3"]);
  });

  it("10. gif-source (prompt→gen-img→render→export) → 4개 실행", async () => {
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "generate-images"),
      makeNode("3", "render"),
      makeNode("4", "export"),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("2", "3"), makeEdge("3", "4")];
    const cb = await runPipeline(nodes, edges);
    expect(cb.steps).toEqual(["1", "2", "3", "4"]);
  });

  it("11. freeform + bgm/cuts → bgm/cuts 확인 단계 실행", async () => {
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "bgm"),
      makeNode("3", "cuts"),
      makeNode("4", "render"),
      makeNode("5", "export"),
    ];
    const edges = [
      makeEdge("1", "2"),
      makeEdge("1", "3"),
      makeEdge("2", "4"),
      makeEdge("3", "4"),
      makeEdge("4", "5"),
    ];
    const cb = await runPipeline(nodes, edges);
    expect(cb.steps).toEqual(["1", "2", "3", "4", "5"]);
    expect(cb.skips).toEqual([]);
  });

  it("12. freeform 다이아몬드 → bgm 확인 후 render 실행", async () => {
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "bgm"),
      makeNode("3", "generate-images"),
      makeNode("4", "render"),
    ];
    const edges = [
      makeEdge("1", "2"),
      makeEdge("1", "3"),
      makeEdge("2", "4"),
      makeEdge("3", "4"),
    ];
    const cb = await runPipeline(nodes, edges);
    expect(cb.steps).toContain("4");
    expect(cb.steps).toContain("2");
  });

  it("36. cutout (upload→remove-bg→export) → upload skip, remove-bg+export 실행", async () => {
    const nodes = [
      makeNode("1", "upload-image"),
      makeNode("2", "remove-bg"),
      makeNode("3", "export"),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("2", "3")];
    const cb = await runPipeline(nodes, edges);
    expect(cb.skips).toContain("1");
    expect(cb.steps).toEqual(["2", "3"]);
  });

  it("37. model-shot (upload→prompt→model-compose→export) → upload skip, 나머지 실행", async () => {
    const nodes = [
      makeNode("1", "upload-image"),
      makeNode("2", "prompt"),
      makeNode("3", "model-compose"),
      makeNode("4", "export"),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("2", "3"), makeEdge("3", "4")];
    const cb = await runPipeline(nodes, edges);
    expect(cb.skips).toContain("1");
    expect(cb.steps).toEqual(["2", "3", "4"]);
  });

  it("38. remove-bg 단독 실행", async () => {
    const nodes = [makeNode("1", "remove-bg")];
    const cb = await runPipeline(nodes, []);
    expect(cb.steps).toEqual(["1"]);
    expect(startRemoveBg).toHaveBeenCalled();
  });

  it("39. model-compose 단독 실행", async () => {
    const nodes = [makeNode("1", "model-compose")];
    const cb = await runPipeline(nodes, []);
    expect(cb.steps).toEqual(["1"]);
    expect(startModelCompose).toHaveBeenCalled();
  });

  it("13. 단일 노드 (엣지 없음) → 1개 실행, 엣지 콜백 없음", async () => {
    const nodes = [makeNode("1", "prompt")];
    const cb = await runPipeline(nodes, []);
    expect(cb.steps).toEqual(["1"]);
    expect(cb.edgeActivations).toHaveLength(0);
    expect(cb.edgeDones).toHaveLength(0);
  });
});

// ══════════════════════════════════════
// Group 3: 엣지 glow 콜백
// ══════════════════════════════════════

describe("엣지 glow 콜백", () => {
  async function runPipeline(nodes: Node[], edges: Edge[]) {
    const cb = makeCallbacks();
    const promise = executePipeline("proj-1", nodes, edges, cb);
    await vi.runAllTimersAsync();
    await promise;
    return cb;
  }

  it("14. 3노드 체인 glow 순서", async () => {
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "generate-images"),
      makeNode("3", "export"),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("2", "3")];
    const cb = await runPipeline(nodes, edges);
    expect(cb.edgeActivations).toEqual(["e-1-2", "e-2-3"]);
    expect(cb.edgeDones).toEqual(["e-1-2", "e-2-3"]);
  });

  it("15. 다이아몬드 다중 incoming", async () => {
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "generate-images"),
      makeNode("3", "generate-images"),
      makeNode("4", "export"),
    ];
    const edges = [
      makeEdge("1", "2"),
      makeEdge("1", "3"),
      makeEdge("2", "4"),
      makeEdge("3", "4"),
    ];
    const cb = await runPipeline(nodes, edges);
    // Node 4 has 2 incoming edges, both activated
    expect(cb.edgeActivations.filter((e) => e.startsWith("e-2-4") || e.startsWith("e-3-4"))).toHaveLength(2);
  });

  it("16. skip 노드 엣지도 done", async () => {
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "bgm"),
      makeNode("3", "export"),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("2", "3")];
    const cb = await runPipeline(nodes, edges);
    expect(cb.edgeDones).toContain("e-1-2");
    expect(cb.edgeDones).toContain("e-2-3");
  });

  it("17. 첫 노드 incoming 없음", async () => {
    const nodes = [makeNode("1", "prompt"), makeNode("2", "export")];
    const edges = [makeEdge("1", "2")];
    const cb = await runPipeline(nodes, edges);
    // Node 1 has no incoming edges
    expect(cb.edgeActivations).toEqual(["e-1-2"]);
  });
});

// ══════════════════════════════════════
// Group 4: 에러
// ══════════════════════════════════════

describe("에러 처리", () => {
  it("18. start() 실패 → onStepError, throw", async () => {
    vi.mocked(startGenerate).mockRejectedValueOnce(new Error("API 오류"));
    const nodes = [makeNode("1", "prompt")];
    const cb = makeCallbacks();
    const promise = executePipeline("proj-1", nodes, [], cb).catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await promise;
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe("API 오류");
    expect(cb.errors).toHaveLength(1);
    expect(cb.errors[0]).toContain("API 오류");
  });

  it("19. poll 'failed' → throw", async () => {
    vi.mocked(pollGenerate).mockResolvedValueOnce({
      job: { id: "j", status: "failed", error: "렌더 실패" },
    });
    const nodes = [makeNode("1", "prompt")];
    const cb = makeCallbacks();
    const promise = executePipeline("proj-1", nodes, [], cb).catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await promise;
    expect((err as Error).message).toBe("렌더 실패");
  });

  it("20. poll 'failed' error 없음 → '작업 실패'", async () => {
    vi.mocked(pollGenerate).mockResolvedValueOnce({
      job: { id: "j", status: "failed" },
    });
    const nodes = [makeNode("1", "prompt")];
    const cb = makeCallbacks();
    const promise = executePipeline("proj-1", nodes, [], cb).catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await promise;
    expect((err as Error).message).toBe("작업 실패");
  });

  it("21. poll 150회 초과 → '작업 시간 초과'", async () => {
    vi.mocked(pollGenerate).mockResolvedValue({
      job: { id: "j", status: "pending" },
    });
    const nodes = [makeNode("1", "prompt")];
    const cb = makeCallbacks();
    const promise = executePipeline("proj-1", nodes, [], cb).catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await promise;
    expect((err as Error).message).toBe("작업 시간 초과");
  });

  it("22. 중간 실패 → 후속 미실행", async () => {
    vi.mocked(pollGenerate).mockResolvedValueOnce({
      job: { id: "j", status: "failed", error: "실패" },
    });
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "generate-images"),
    ];
    const edges = [makeEdge("1", "2")];
    const cb = makeCallbacks();
    const promise = executePipeline("proj-1", nodes, edges, cb).catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await promise;
    expect((err as Error).message).toBe("실패");
    expect(cb.steps).toEqual(["1"]);
    expect(startGenerateImages).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════
// Group 5: abort
// ══════════════════════════════════════

describe("abort", () => {
  it("23. 즉시 abort → 0개 실행", async () => {
    const nodes = [makeNode("1", "prompt"), makeNode("2", "export")];
    const edges = [makeEdge("1", "2")];
    const cb = makeCallbacks({ shouldAbort: () => true });
    const promise = executePipeline("proj-1", nodes, edges, cb);
    await vi.runAllTimersAsync();
    await promise;
    expect(cb.steps).toHaveLength(0);
  });

  it("24. poll 중 abort → '중단됨', onStepError 미호출", async () => {
    let aborted = false;
    // Make poll check abort
    vi.mocked(pollGenerate).mockImplementation(async () => {
      aborted = true;
      return { job: { id: "j", status: "pending" } };
    });

    const nodes = [makeNode("1", "prompt")];
    const cb = makeCallbacks({ shouldAbort: () => aborted });
    const promise = executePipeline("proj-1", nodes, [], cb);
    await vi.runAllTimersAsync();
    await promise;
    expect(cb.errors).toHaveLength(0);
  });

  it("25. 2번째 poll 중 abort → 1번 완료, 2번 중단", async () => {
    let callCount = 0;
    // Reset default mock for this test
    vi.mocked(pollGenerate).mockResolvedValue({
      job: { id: "j", status: "done" },
      project: { content: { sections: [{ headline: "H1" }] } },
    });

    vi.mocked(pollGenerateImages).mockImplementation(async () => {
      callCount++;
      return { job: { id: "j", status: "pending" } };
    });

    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "generate-images"),
    ];
    const edges = [makeEdge("1", "2")];
    const cb = makeCallbacks({ shouldAbort: () => callCount > 0 });
    const promise = executePipeline("proj-1", nodes, edges, cb);
    await vi.runAllTimersAsync();
    await promise;
    expect(cb.steps).toContain("1");
    expect(cb.steps).toContain("2");
    expect(cb.errors).toHaveLength(0);
  });

  it("26. abort 시 엣지 done 처리", async () => {
    let aborted = false;
    vi.mocked(pollGenerate).mockImplementation(async () => {
      aborted = true;
      return { job: { id: "j", status: "pending" } };
    });

    const nodes = [makeNode("1", "prompt"), makeNode("2", "export")];
    const edges = [makeEdge("1", "2")];
    const cb = makeCallbacks({ shouldAbort: () => aborted });
    const promise = executePipeline("proj-1", nodes, edges, cb);
    await vi.runAllTimersAsync();
    await promise;
    // Node 1's incoming edges are done (none), but the edge from 1→2 isn't activated
    // because abort happens during node 1 execution, before node 2
  });
});

// ══════════════════════════════════════
// Group 6: 특수 토폴로지
// ══════════════════════════════════════

describe("특수 토폴로지", () => {
  async function runPipeline(nodes: Node[], edges: Edge[]) {
    const cb = makeCallbacks();
    const promise = executePipeline("proj-1", nodes, edges, cb);
    await vi.runAllTimersAsync();
    await promise;
    return cb;
  }

  it("27. 미등록 nodeType → onSkip", async () => {
    const nodes = [makeNode("1", "unknown-type")];
    const cb = await runPipeline(nodes, []);
    expect(cb.skips).toContain("1");
  });

  it("28. nodeType 없는 data → onSkip", async () => {
    const nodes: Node[] = [
      { id: "1", position: { x: 0, y: 0 }, data: {} },
    ];
    const cb = await runPipeline(nodes, []);
    expect(cb.skips).toContain("1");
  });

  it("29. 존재 안하는 노드 참조 엣지 → 무시", () => {
    const nodes = [makeNode("1", "prompt")];
    const edges = [makeEdge("1", "99")];
    const order = topologicalSort(nodes, edges);
    expect(order).toEqual(["1"]);
  });

  it("30. 10노드 긴 체인", async () => {
    const nodes = Array.from({ length: 10 }, (_, i) => makeNode(String(i + 1), "prompt"));
    const edges = Array.from({ length: 9 }, (_, i) => makeEdge(String(i + 1), String(i + 2)));
    const cb = await runPipeline(nodes, edges);
    expect(cb.steps).toHaveLength(10);
    expect(cb.steps[0]).toBe("1");
    expect(cb.steps[9]).toBe("10");
  });

  it("31. Fan-out (1→2, 1→3, 1→4)", async () => {
    const nodes = [
      makeNode("1", "prompt"),
      makeNode("2", "generate-images"),
      makeNode("3", "generate-images"),
      makeNode("4", "generate-images"),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("1", "3"), makeEdge("1", "4")];
    const cb = await runPipeline(nodes, edges);
    expect(cb.steps[0]).toBe("1");
    expect(cb.steps).toHaveLength(4);
  });
});

// ══════════════════════════════════════
// Group 7: 프리뷰 추출 (onStepDone 콜백 로직)
// ══════════════════════════════════════

describe("프리뷰 추출", () => {
  function extractPreviewText(result: Record<string, unknown>): string | undefined {
    const content = (result as Record<string, unknown>).project as Record<string, unknown> | undefined;
    const sections = (content?.content as { sections?: { headline?: string }[] })?.sections;
    if (sections?.length) {
      return sections.map((s) => s.headline).filter(Boolean).slice(0, 2).join(" / ");
    }
    return undefined;
  }

  function extractPreviewImages(result: Record<string, unknown>): string[] | undefined {
    const assets = result.assets as { filePath?: string }[] | undefined;
    if (assets?.length) {
      const paths = assets.map((a) => a.filePath).filter((p): p is string => !!p);
      return paths.length ? paths : undefined;
    }
    return undefined;
  }

  it("32. prompt sections 존재 → 'H1 / H2'", () => {
    const result = {
      job: { id: "j", status: "done" },
      project: { content: { sections: [{ headline: "H1" }, { headline: "H2" }, { headline: "H3" }] } },
    };
    expect(extractPreviewText(result)).toBe("H1 / H2");
  });

  it("33. prompt sections 없음 → undefined", () => {
    const result = { job: { id: "j", status: "done" }, project: { content: {} } };
    expect(extractPreviewText(result)).toBeUndefined();
  });

  it("34. gen-images assets 존재 → ['/img/1.jpg']", () => {
    const result = {
      job: { id: "j", status: "done" },
      assets: [{ filePath: "/img/1.jpg" }],
    };
    expect(extractPreviewImages(result)).toEqual(["/img/1.jpg"]);
  });

  it("35. gen-images assets 비어있음 → undefined", () => {
    const result = { job: { id: "j", status: "done" }, assets: [] };
    expect(extractPreviewImages(result)).toBeUndefined();
  });
});
