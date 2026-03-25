/** Server-side workspace hub queries for home and projects screens. */
import packageJson from "../../../package.json";
import { prisma } from "@/lib/prisma";
import { getAuthContext, getWorkspaceId } from "@/lib/workspace-guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FREE_LIMITS, COST_ESTIMATES } from "@/lib/usage-guard";
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

function parseProjectId(detail: string | object | null) {
  if (!detail) {
    return null;
  }

  try {
    const parsed = typeof detail === "string" ? JSON.parse(detail) : detail;
    return (parsed as { projectId?: string }).projectId ?? null;
  } catch {
    return null;
  }
}

export async function getHomeFeed(limit = 24): Promise<HomeFeedData> {
  const workspaceId = await getWorkspaceId();

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
  const workspaceId = await getWorkspaceId();

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
  const workspaceId = await getWorkspaceId();

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
  const workspaceId = await getWorkspaceId();
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

// ── Settings page data (production) ──

export interface UsagePerTypeItem {
  eventType: string;
  label: string;
  used: number;
  limit: number;
  costPerUnit: number;
}

type ProviderStatus = "active" | "mock";

export interface SettingsPageData {
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    email: string;
    authProvider: string;
  };
  workspace: { id: string; name: string };
  stats: { projectCount: number; templateCount: number; assetCount: number };
  usage: {
    monthlyEventCount: number;
    exportCount: number;
    totalEstimatedCost: number;
    perType: UsagePerTypeItem[];
  };
  recentActivity: WorkspaceActivityItem[];
  providers: { kieAi: ProviderStatus; gemini: ProviderStatus; remotion: ProviderStatus };
}

const USAGE_LABELS: Record<string, string> = {
  generation_start: "문안 생성",
  image_generation_start: "이미지 생성",
  model_compose_start: "모델 합성",
  remove_bg_start: "배경 제거",
  scene_compose_start: "배경 바꾸기",
  marketing_script_start: "마케팅 스크립트",
  thumbnail_start: "썸네일 생성",
  export_start: "내보내기",
  block_text_generate: "블록 문구 생성",
  text_rewrite: "텍스트 다시쓰기",
};

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const { userId, workspaceId } = await getAuthContext();

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [workspace, profile, projectCount, templateCount, assetCount] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { id: true, name: true } }),
    prisma.profile.findFirst({ where: { id: userId } }),
    prisma.project.count({ where: { workspaceId } }),
    prisma.composeTemplate.count({ where: { workspaceId } }),
    prisma.asset.count({ where: { project: { workspaceId } } }),
  ]);

  const [monthlyEventCount, exportCount, costResult, usageEvents] = await Promise.all([
    prisma.usageLedger.count({ where: { workspaceId, createdAt: { gte: monthStart } } }),
    prisma.usageLedger.count({ where: { workspaceId, eventType: "export_complete" } }),
    prisma.usageLedger.aggregate({ where: { workspaceId }, _sum: { costEstimate: true } }),
    prisma.usageLedger.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, eventType: true, detail: true, costEstimate: true, createdAt: true },
    }),
  ]);

  // Per-type usage breakdown
  const perType: UsagePerTypeItem[] = [];
  for (const [eventType, limit] of Object.entries(FREE_LIMITS)) {
    const used = await prisma.usageLedger.count({
      where: { workspaceId, eventType, createdAt: { gte: monthStart } },
    });
    perType.push({
      eventType,
      label: USAGE_LABELS[eventType] ?? eventType,
      used,
      limit,
      costPerUnit: COST_ESTIMATES[eventType] ?? 0,
    });
  }

  // Recent activity with project names
  const projectIds = [...new Set(usageEvents.map((e) => parseProjectId(e.detail)).filter((v): v is string => Boolean(v)))];
  const linkedProjects: Array<{ id: string; name: string; mode: string }> = projectIds.length > 0
    ? await prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, name: true, mode: true } })
    : [];
  const projectById = new Map(linkedProjects.map((p) => [p.id, p]));

  // Provider status
  const kieAi: ProviderStatus = process.env.USE_MOCK === "true" || !process.env.KIE_API_KEY ? "mock" : "active";
  const gemini: ProviderStatus = process.env.USE_MOCK === "true" || !process.env.GEMINI_API_KEY ? "mock" : "active";
  const remotion: ProviderStatus = "active";

  return {
    profile: {
      displayName: profile?.displayName ?? user?.user_metadata?.name ?? null,
      avatarUrl: profile?.avatarUrl ?? user?.user_metadata?.avatar_url ?? null,
      email: user?.email ?? "",
      authProvider: user?.app_metadata?.provider ?? "email",
    },
    workspace: { id: workspaceId, name: workspace?.name ?? "Default workspace" },
    stats: { projectCount, templateCount, assetCount },
    usage: {
      monthlyEventCount,
      exportCount,
      totalEstimatedCost: costResult._sum.costEstimate ?? 0,
      perType,
    },
    recentActivity: usageEvents.map((event) => {
      const projectId = parseProjectId(event.detail);
      const linked = projectId ? projectById.get(projectId) : null;
      return {
        id: event.id,
        label: EVENT_LABELS[event.eventType] ?? event.eventType,
        detail: linked?.name ? `${linked.name} 프로젝트` : "프로젝트 정보 없음",
        createdAt: event.createdAt,
        costEstimate: event.costEstimate,
        projectId,
        projectMode: linked?.mode ?? null,
      };
    }),
    providers: { kieAi, gemini, remotion },
  };
}
