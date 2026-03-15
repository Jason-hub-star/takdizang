import { mkdir, readFile, rm } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { prisma } from "@/lib/prisma";
import { getWorkspaceId, ensureWorkspaceScope } from "@/lib/workspace-guard";
import { jsonOk, jsonError, jsonNotFound } from "@/lib/api-response";
import { resolveShortformInputProps } from "@/lib/project-media";
import {
  applyShortformRenderArtifacts,
  getShortformStateFromContent,
  parseEditorGraph,
  serializeProjectContent,
} from "@/lib/shortform-state";
import { getProjectUploadsDir } from "@/lib/runtime-paths";
import { uploadPublicPathBuffer } from "@/lib/supabase/storage";
import type { CompositionId, RemotionInputProps } from "@/types";

const TEMPLATE_TO_COMPOSITION: Record<string, CompositionId> = {
  "9:16": "TakdiVideo-916",
  "1:1": "TakdiVideo-1x1",
  "16:9": "TakdiVideo-169",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const workspaceId = getWorkspaceId();

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        workspaceId: true,
        status: true,
        mode: true,
        name: true,
        content: true,
      },
    });
    if (!project) return jsonNotFound("Project");

    try {
      ensureWorkspaceScope(project.workspaceId);
    } catch {
      return jsonError("Forbidden: workspace scope violation", 403);
    }

    if (project.status !== "generated" && project.status !== "exported") {
      return jsonError("Project must be in 'generated' or 'exported' status to render", 409);
    }

    const targets =
      project.mode === "shortform-video"
        ? (["9:16", "1:1", "16:9"] as const)
        : ([body.templateKey || "9:16"] as const);

    const job = await prisma.$transaction(async (tx) => {
      const renderJob = await tx.generationJob.create({
        data: {
          projectId: id,
          status: "queued",
          provider: "remotion",
          input: JSON.stringify({ targets }),
        },
      });

      await tx.usageLedger.create({
        data: {
          workspaceId,
          eventType: "render_start",
          detail: JSON.stringify({ projectId: id, jobId: renderJob.id, targets }),
        },
      });

      return renderJob;
    });

    processRender(job.id, project, workspaceId, targets).catch((error) => {
      console.error("Background render error:", error);
    });

    return jsonOk({ jobId: job.id, status: "queued" }, 202);
  } catch (error) {
    console.error("POST /api/projects/[id]/remotion/render error:", error);
    return jsonError("Internal server error", 500);
  }
}

async function processRender(
  jobId: string,
  project: { id: string; mode: string | null; name: string; content: string | null; workspaceId: string },
  workspaceId: string,
  targets: readonly string[],
) {
  try {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "running", startedAt: new Date() },
    });

    const renderDir = getProjectUploadsDir(project.id, "renders");
    await mkdir(renderDir, { recursive: true });

    const artifactIds: string[] = [];
    const renderArtifacts: Array<{
      templateKey: "9:16" | "1:1" | "16:9";
      artifactId: string;
      filePath: string;
    }> = [];
    for (const templateKey of targets) {
      const compositionId = TEMPLATE_TO_COMPOSITION[templateKey] ?? "TakdiVideo-916";
      const inputProps = await resolveShortformInputProps(
        project.id,
        project.name,
        project.content,
        templateKey as "9:16" | "1:1" | "16:9",
      );
      const absoluteInput = absolutizeInputProps(inputProps);
      const fileName = `${Date.now()}-${templateKey.replace(":", "x")}.mp4`;
      const outputPath = path.join(renderDir, fileName);
      const publicFilePath = `/uploads/${project.id}/renders/${fileName}`;
      await runRemotionRender(compositionId, outputPath, absoluteInput);
      await uploadPublicPathBuffer(publicFilePath, await readFile(outputPath), {
        contentType: "video/mp4",
      });
      await rm(outputPath, { force: true });

      const artifact = await prisma.exportArtifact.create({
        data: {
          projectId: project.id,
          type: "video",
          filePath: publicFilePath,
          metadata: JSON.stringify({ compositionId, templateKey }),
        },
      });
      artifactIds.push(artifact.id);
      if (templateKey === "9:16" || templateKey === "1:1" || templateKey === "16:9") {
        renderArtifacts.push({
          templateKey,
          artifactId: artifact.id,
          filePath: artifact.filePath,
        });
      }
    }

    const graph = parseEditorGraph(project.content);
    const nextShortformState = applyShortformRenderArtifacts(
      getShortformStateFromContent(project.content),
      renderArtifacts,
    );

    await prisma.$transaction(async (tx) => {
      if (project.mode === "shortform-video" && nextShortformState) {
        await tx.project.update({
          where: { id: project.id },
          data: {
            content: serializeProjectContent({
              nodes: graph?.nodes ?? [],
              edges: graph?.edges ?? [],
              shortform: nextShortformState,
            }),
          },
        });
      }

      await tx.generationJob.update({
        where: { id: jobId },
        data: {
          status: "done",
          output: JSON.stringify({ artifactIds }),
          doneAt: new Date(),
        },
      });

      await tx.usageLedger.create({
        data: {
          workspaceId,
          eventType: "render_complete",
          detail: JSON.stringify({ projectId: project.id, jobId, artifactIds }),
        },
      });
    });
  } catch (error) {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: "failed", error: String(error), doneAt: new Date() },
    });
  }
}

function absolutizeInputProps(inputProps: RemotionInputProps): RemotionInputProps {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
  const absolutize = (value?: string) => (value && value.startsWith("/") ? `${baseUrl}${value}` : value);

  return {
    ...inputProps,
    selectedImages: inputProps.selectedImages.map((value) => absolutize(value) ?? value),
    scenes: inputProps.scenes.map((scene) => ({
      ...scene,
      imageSrc: absolutize(scene.imageSrc),
    })),
    bgmMetadata: {
      ...inputProps.bgmMetadata,
      src: absolutize(inputProps.bgmMetadata.src) ?? inputProps.bgmMetadata.src,
    },
  };
}

function runRemotionRender(compositionId: CompositionId, outputPath: string, inputProps: RemotionInputProps) {
  const remotionArgs = [
    "remotion",
    "render",
    "src/remotion/index.ts",
    compositionId,
    outputPath,
    "--codec=h264",
    "--props",
    JSON.stringify(inputProps),
  ];
  const command = process.platform === "win32" ? "cmd.exe" : "npx";
  const args = process.platform === "win32" ? ["/c", "npx", ...remotionArgs] : remotionArgs;

  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr || `Remotion render failed with code ${code}`));
    });
  });
}
