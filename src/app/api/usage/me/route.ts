import { prisma } from "@/lib/prisma";
import { getWorkspaceId } from "@/lib/workspace-guard";
import { jsonOk, jsonError } from "@/lib/api-response";

export async function GET() {
  try {
    const workspaceId = getWorkspaceId();

    const [totalEvents, generationCount, exportCount, costResult] = await Promise.all([
      prisma.usageLedger.count({ where: { workspaceId } }),
      prisma.usageLedger.count({ where: { workspaceId, eventType: "generation_start" } }),
      prisma.usageLedger.count({ where: { workspaceId, eventType: "export_complete" } }),
      prisma.usageLedger.aggregate({ where: { workspaceId }, _sum: { costEstimate: true } }),
    ]);

    const summary = {
      totalEvents,
      generationCount,
      exportCount,
      totalEstimatedCost: costResult._sum.costEstimate ?? 0,
    };

    return jsonOk({ workspaceId, summary });
  } catch (error) {
    console.error("GET /api/usage/me error:", error);
    return jsonError("Internal server error", 500);
  }
}
