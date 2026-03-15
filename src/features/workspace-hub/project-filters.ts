/** Shared project and template list types plus client-side filter helpers. */
export type ProjectKindTab = "all" | "compose" | "editor";
export type ProjectStatusFilter =
  | "all"
  | "draft"
  | "generating"
  | "generated"
  | "exported"
  | "failed";
export type ProjectDateFilter = "any" | "today" | "last7" | "last30";

export interface RecentProjectListItem {
  id: string;
  name: string;
  status: string;
  mode: string | null;
  updatedAt: string | Date;
}

export interface SavedTemplateListItem {
  id: string;
  name: string;
  previewTitle: string | null;
  blockCount: number;
  sourceProjectId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProjectFilterState {
  tab: ProjectKindTab;
  query: string;
  status: ProjectStatusFilter;
  dateRange: ProjectDateFilter;
}

export const PROJECT_KIND_TABS: ProjectKindTab[] = ["all", "compose", "editor"];

export const PROJECT_DATE_FILTERS: ProjectDateFilter[] = ["any", "today", "last7", "last30"];

export function isComposeProject(mode: string | null | undefined) {
  return mode === "compose";
}

export function getProjectDestination(project: RecentProjectListItem) {
  return isComposeProject(project.mode)
    ? `/projects/${project.id}/compose`
    : `/projects/${project.id}/editor`;
}

export function getAvailableProjectStatuses(projects: RecentProjectListItem[]) {
  const statuses = new Set<ProjectStatusFilter>(["all"]);
  for (const project of projects) {
    if (project.status === "draft" || project.status === "generating" || project.status === "generated" || project.status === "exported" || project.status === "failed") {
      statuses.add(project.status);
    }
  }
  return Array.from(statuses);
}

function matchesDateFilter(date: string | Date, filter: ProjectDateFilter) {
  if (filter === "any") {
    return true;
  }

  const target = new Date(date);
  if (Number.isNaN(target.getTime())) {
    return false;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "today") {
    return target >= startOfToday;
  }

  const days = filter === "last7" ? 7 : 30;
  const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return target >= threshold;
}

export function filterProjects(projects: RecentProjectListItem[], filters: ProjectFilterState) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return projects.filter((project) => {
    if (filters.tab === "compose" && !isComposeProject(project.mode)) {
      return false;
    }

    if (filters.tab === "editor" && isComposeProject(project.mode)) {
      return false;
    }

    if (filters.status !== "all" && project.status !== filters.status) {
      return false;
    }

    if (!matchesDateFilter(project.updatedAt, filters.dateRange)) {
      return false;
    }

    if (normalizedQuery && !project.name.toLowerCase().includes(normalizedQuery)) {
      return false;
    }

    return true;
  });
}

export function filterTemplates(templates: SavedTemplateListItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return templates;
  }

  return templates.filter((template) => {
    const haystack = `${template.name} ${template.previewTitle ?? ""}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
