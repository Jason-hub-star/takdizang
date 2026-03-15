/** Server-side workspace hub queries for home and projects screens. */
import packageJson from "../../../package.json";
import { prisma } from "@/lib/prisma";
import { getWorkspaceId } from "@/lib/workspace-guard";
import type { RecentProjectListItem, SavedTemplateListItem } from "./project-filters";

export interface HomeFeedData {
  projects: RecentProjectListItem[];
  templates: SavedTemplateListItem[];
}

export interface WorkspaceActivityItem {
  id: string;
  label: string;
  detail: string;
  createdAt: string | Date;
  costEstimate: number | null;
  projectId: string | null;
  projectMode: string | null;
}

export interface HeaderSurfaceData {
  workspaceId: string;
  workspaceName: string;
  projects: RecentProjectListItem[];
  templates: SavedTemplateListItem[];
  recentActivity: WorkspaceActivityItem[];
}

export interface SettingsSummaryData {
  workspaceId: string;
  workspaceName: string;
  projectCount: number;
  templateCount: number;
  assetCount: number;
  monthlyEventCount: number;
  exportCount: number;
  totalEstimatedCost: number;
  recentActivity: WorkspaceActivityItem[];
  uploadsPath: string;
  databaseUrl: string;
  nextVersion: string;
  prismaVersion: string;
  remotionPreviewEnabled: boolean;
}

const EVENT_LABELS: Record<string, string> = {
  generation_start: "문안 생성 시작",
  image_generation_start: "이미지 생성 시작",
  model_compose_start: "모델 합성 시작",
  remove_bg_start: "배경 제거 시작",
  export_start: "내보내기 시작",
  export_complete: "내보내기 완료",
};

function parseProjectId(detail: string | null) {
  if (!detail) {
    return null;
  }

  try {
    const parsed = JSON.parse(detail) as { projectId?: string };
    return parsed.projectId ?? null;
  } catch {
    return null;
  }
}

export async function getHomeFeed(limit = 24): Promise<HomeFeedData> {
  const workspaceId = getWorkspaceId();

  const [projects, templates] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        status: true,
        mode: true,
        updatedAt: true,
      },
    }),
    prisma.composeTemplate.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        previewTitle: true,
        blockCount: true,
        sourceProjectId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return { projects, templates };
}

export async function getProjectsPageData(): Promise<HomeFeedData> {
  const workspaceId = getWorkspaceId();

  const [projects, templates] = await Promise.all([
    prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        mode: true,
        updatedAt: true,
      },
    }),
    prisma.composeTemplate.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        previewTitle: true,
        blockCount: true,
        sourceProjectId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return { projects, templates };
}

export async function getHeaderSurfaceData(): Promise<HeaderSurfaceData> {
  const workspaceId = getWorkspaceId();

  const [workspace, projects, templates, usageEvents] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true },
    }),
    prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        mode: true,
        updatedAt: true,
      },
    }),
    prisma.composeTemplate.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        previewTitle: true,
        blockCount: true,
        sourceProjectId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.usageLedger.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        eventType: true,
        detail: true,
        costEstimate: true,
        createdAt: true,
      },
    }),
  ]);

  const projectIds = [
    ...new Set(
      usageEvents.map((event) => parseProjectId(event.detail)).filter((value): value is string => Boolean(value)),
    ),
  ];
  const linkedProjects = projectIds.length > 0
    ? await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, name: true, mode: true },
      })
    : [];
  const projectById = new Map<string, (typeof linkedProjects)[number]>(
    linkedProjects.map((project) => [project.id, project]),
  );

  return {
    workspaceId,
    workspaceName: workspace?.name ?? "Default workspace",
    projects: projects.map((project) => ({
      ...project,
      updatedAt: project.updatedAt.toISOString(),
    })),
    templates: templates.map((template) => ({
      ...template,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    })),
    recentActivity: usageEvents.map((event) => {
      const projectId = parseProjectId(event.detail);
      const linkedProject = projectId ? projectById.get(projectId) : null;
      const projectName = linkedProject?.name ?? null;
      const detail = projectName ? `${projectName} 프로젝트` : "프로젝트 정보 없음";
      return {
        id: event.id,
        label: EVENT_LABELS[event.eventType] ?? event.eventType,
        detail,
        createdAt: event.createdAt.toISOString(),
        costEstimate: event.costEstimate,
        projectId,
        projectMode: linkedProject?.mode ?? null,
      };
    }),
  };
}

export async function getSettingsSummary(): Promise<SettingsSummaryData> {
  const workspaceId = getWorkspaceId();
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [projectCount, templateCount, assetCount] = await Promise.all([
    prisma.project.count({ where: { workspaceId } }),
    prisma.composeTemplate.count({ where: { workspaceId } }),
    prisma.asset.count({ where: { project: { workspaceId } } }),
  ]);

  const [monthlyEventCount, exportCount, costResult, usageEvents] = await Promise.all([
    prisma.usageLedger.count({
      where: {
        workspaceId,
        createdAt: { gte: monthStart },
      },
    }),
    prisma.usageLedger.count({ where: { workspaceId, eventType: "export_complete" } }),
    prisma.usageLedger.aggregate({ where: { workspaceId }, _sum: { costEstimate: true } }),
    prisma.usageLedger.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        eventType: true,
        detail: true,
        costEstimate: true,
        createdAt: true,
      },
    }),
  ]);

  const projectIds = [...new Set(usageEvents.map((event) => parseProjectId(event.detail)).filter((value): value is string => Boolean(value)))];
  const linkedProjects = projectIds.length > 0
    ? await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, name: true, mode: true },
      })
    : [];
  const projectById = new Map<string, (typeof linkedProjects)[number]>(
    linkedProjects.map((project) => [project.id, project]),
  );

  return {
    workspaceId,
    workspaceName: workspace?.name ?? "Default workspace",
    projectCount,
    templateCount,
    assetCount,
    monthlyEventCount,
    exportCount,
    totalEstimatedCost: costResult._sum.costEstimate ?? 0,
    recentActivity: usageEvents.map((event) => {
      const projectId = parseProjectId(event.detail);
      const linkedProject = projectId ? projectById.get(projectId) : null;
      const projectName = linkedProject?.name ?? null;
      const detail = projectName ? `${projectName} 프로젝트` : "프로젝트 정보 없음";
      return {
        id: event.id,
        label: EVENT_LABELS[event.eventType] ?? event.eventType,
        detail,
        createdAt: event.createdAt,
        costEstimate: event.costEstimate,
        projectId,
        projectMode: linkedProject?.mode ?? null,
      };
    }),
    uploadsPath: `${process.cwd()}\\uploads`,
    databaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://fpejnupyptyxwfhvmsop.supabase.co",
    nextVersion: packageJson.dependencies.next,
    prismaVersion: packageJson.dependencies["@supabase/supabase-js"] ?? "not-installed",
    remotionPreviewEnabled: true,
  };
}
