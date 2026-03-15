import { describe, expect, it } from "vitest";
import type { Edge, Node } from "@xyflow/react";
import { repairEditorGraph, validateEditorGraph } from "../editor-graph";

function makeNode(id: string, nodeType: string, extraData?: Record<string, unknown>): Node {
  return {
    id,
    type: "takdi",
    position: { x: 0, y: 0 },
    data: {
      label: nodeType,
      nodeType,
      ...extraData,
    },
  };
}

function makeEdge(source: string, target: string): Edge {
  return { id: `e-${source}-${target}`, source, target };
}

describe("editor-graph guided validation", () => {
  it("detects duplicate node types in model-shot", () => {
    const result = validateEditorGraph(
      "model-shot",
      [
        makeNode("1", "upload-image", { uploadedAssetId: "asset-1" }),
        makeNode("2", "upload-image", { uploadedAssetId: "asset-2" }),
        makeNode("3", "prompt", { briefText: "prompt" }),
        makeNode("4", "model-compose"),
        makeNode("5", "export"),
      ],
      [makeEdge("1", "3"), makeEdge("3", "4"), makeEdge("4", "5")],
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "duplicate-node-type")).toBe(true);
  });

  it("detects missing required steps in cutout", () => {
    const result = validateEditorGraph(
      "cutout",
      [makeNode("1", "upload-image"), makeNode("2", "export")],
      [makeEdge("1", "2")],
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "missing-node-type")).toBe(true);
  });

  it("detects invalid edges in brand-image", () => {
    const result = validateEditorGraph(
      "brand-image",
      [makeNode("1", "prompt"), makeNode("2", "generate-images"), makeNode("3", "export")],
      [makeEdge("1", "3"), makeEdge("3", "2")],
    );

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "invalid-edge")).toBe(true);
  });

  it("rejects duplicate parallel edges in guided mode", () => {
    const result = validateEditorGraph(
      "model-shot",
      [
        makeNode("1", "upload-image"),
        makeNode("2", "prompt"),
        makeNode("3", "model-compose"),
        makeNode("4", "export"),
      ],
      [
        makeEdge("1", "2"),
        { id: "e-1-2-duplicate", source: "1", target: "2" },
        makeEdge("2", "3"),
        makeEdge("3", "4"),
      ],
    );

    expect(result.valid).toBe(false);
    expect(
      result.issues.some(
        (issue) =>
          issue.code === "invalid-edge" &&
          issue.message.includes("중복"),
      ),
    ).toBe(true);
  });

  it("repairs guided graph back to one canonical pipeline", () => {
    const repaired = repairEditorGraph(
      "model-shot",
      [
        makeNode("1", "upload-image", { uploadedAssetId: "asset-1" }),
        makeNode("2", "upload-image", { uploadedAssetId: "asset-2" }),
        makeNode("3", "prompt", { briefText: "prompt body" }),
        makeNode("4", "model-compose", { previewImages: ["/a.jpg"] }),
        makeNode("5", "export"),
      ],
      [makeEdge("1", "3"), makeEdge("2", "3"), makeEdge("3", "4"), makeEdge("4", "5")],
    );

    expect(repaired.nodes).toHaveLength(4);
    expect(repaired.edges).toHaveLength(3);
    expect((repaired.nodes[0].data as { uploadedAssetId?: string }).uploadedAssetId).toBe("asset-1");
    expect((repaired.nodes[1].data as { briefText?: string }).briefText).toBe("prompt body");
  });

  it("leaves freeform graphs untouched", () => {
    const result = validateEditorGraph(
      "freeform",
      [makeNode("1", "prompt"), makeNode("2", "prompt"), makeNode("3", "export")],
      [makeEdge("1", "3"), makeEdge("2", "3")],
    );

    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.repairable).toBe(false);
  });
});
