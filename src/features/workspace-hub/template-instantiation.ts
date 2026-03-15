/** Server-side template instantiation helper for launching compose from a saved snapshot. */
import { prisma } from "@/lib/prisma";
import { createTemplateSnapshot } from "@/lib/compose-templates";
import { ensureWorkspaceScope, getWorkspaceId } from "@/lib/workspace-guard";
import type { BlockDocument } from "@/types/blocks";

export async function instantiateTemplateProject(templateId: string, customName?: string) {
  const workspaceId = getWorkspaceId();
  const template = await prisma.composeTemplate.findUnique({
    where: { id: templateId },
    select: {
      id: true,
      name: true,
      workspaceId: true,
      snapshot: true,
    },
  });

  if (!template) {
    return null;
  }

  ensureWorkspaceScope(template.workspaceId);

  const parsedSnapshot = JSON.parse(template.snapshot) as BlockDocument;
  const snapshot = createTemplateSnapshot(parsedSnapshot);
  const projectName = customName?.trim() || `${template.name} 상세페이지`;

  const project = await prisma.project.create({
    data: {
      workspaceId,
      name: projectName,
      mode: "compose",
      editorMode: "compose",
      content: JSON.stringify(snapshot),
    },
    select: {
      id: true,
      name: true,
      mode: true,
      status: true,
      updatedAt: true,
    },
  });

  return project;
}
