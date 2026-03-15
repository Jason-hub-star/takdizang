import { describe, expect, it, vi } from "vitest";
import type { Edge, Node } from "@xyflow/react";
import { createSimulationExecutors, validateEditorGraph } from "../editor-graph";
import { executePipeline, type PipelineCallbacks } from "../pipeline-executor";

function makeNode(id: string, nodeType: string): Node {
  return {
    id,
    type: "takdi",
    position: { x: 0, y: 0 },
    data: { label: nodeType, nodeType },
  };
}

function makeEdge(source: string, target: string): Edge {
  return { id: `e-${source}-${target}`, source, target };
}

function makeCallbacks(): PipelineCallbacks & { steps: string[] } {
  const steps: string[] = [];
  return {
    steps,
    onStepStart: vi.fn((nodeId) => steps.push(nodeId)),
    onStepDone: vi.fn(),
    onStepError: vi.fn(),
    onSkip: vi.fn(),
    onEdgeActivate: vi.fn(),
    onEdgeDone: vi.fn(),
    shouldAbort: () => false,
    addLog: vi.fn(),
  };
}

describe("simulation executors", () => {
  it("runs guided graph with fake executors only", async () => {
    vi.useFakeTimers();

    const nodes = [
      makeNode("1", "upload-image"),
      makeNode("2", "prompt"),
      makeNode("3", "model-compose"),
      makeNode("4", "export"),
    ];
    const edges = [makeEdge("1", "2"), makeEdge("2", "3"), makeEdge("3", "4")];
    const validation = validateEditorGraph("model-shot", nodes, edges);

    expect(validation.valid).toBe(true);

    const callbacks = makeCallbacks();
    const promise = executePipeline(
      "proj-1",
      nodes,
      edges,
      callbacks,
      { uploadedAssetId: "asset-1" },
      createSimulationExecutors(),
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(callbacks.steps).toEqual(["2", "3", "4"]);

    vi.useRealTimers();
  });

  it("blocks duplicate guided graphs before simulation", () => {
    const nodes = [
      makeNode("1", "upload-image"),
      makeNode("2", "upload-image"),
      makeNode("3", "prompt"),
      makeNode("4", "model-compose"),
      makeNode("5", "export"),
    ];
    const edges = [makeEdge("1", "3"), makeEdge("3", "4"), makeEdge("4", "5")];
    const validation = validateEditorGraph("model-shot", nodes, edges);

    expect(validation.valid).toBe(false);
    expect(validation.issues.some((issue) => issue.code === "duplicate-node-type")).toBe(true);
  });
});
