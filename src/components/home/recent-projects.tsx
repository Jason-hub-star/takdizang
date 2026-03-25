/** Filterable recent projects list with optional collapsible drawer and delete management. */
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUpRight, FolderOpen, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeleteConfirmDialog } from "@/components/home/delete-confirm-dialog";
import { ItemActionsMenu } from "@/components/home/item-actions-menu";
import { formatShowingProjects } from "@/i18n/format";
import { useT } from "@/i18n/use-t";
import {
  PROJECT_DATE_FILTERS,
  PROJECT_KIND_TABS,
  filterProjects,
  getAvailableProjectStatuses,
  getProjectDestination,
  type ProjectDateFilter,
  type ProjectKindTab,
  type ProjectStatusFilter,
  type RecentProjectListItem,
} from "@/features/workspace-hub/project-filters";
import { deleteProject } from "@/lib/api-client";
import { WORKSPACE_CONTROL } from "@/lib/workspace-surface";

type ManagementMode = "single" | "bulk";

interface RecentProjectsProps {
  projects: RecentProjectListItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  managementMode?: ManagementMode;
}

interface DeleteState {
  ids: string[];
  title: string;
  description: string;
  details: string[];
}

const MODE_LABEL_KEYS = {
  compose: "compose",
  "shortform-video": "shortformVideo",
  "model-shot": "modelShot",
  cutout: "cutout",
  "brand-image": "brandImage",
  "gif-source": "gifSource",
  freeform: "freeform",
} as const;

export function RecentProjects({
  projects,
  collapsible = false,
  defaultCollapsed = false,
  managementMode = "single",
}: RecentProjectsProps) {
  const router = useRouter();
  const { messages } = useT();
  const [items, setItems] = useState(projects);
  const [tab, setTab] = useState<ProjectKindTab>("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectStatusFilter>("all");
  const [dateRange, setDateRange] = useState<ProjectDateFilter>("any");
  const [collapsed, setCollapsed] = useState(collapsible ? defaultCollapsed : false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(projects);
  }, [projects]);

  const statusOptions = useMemo(() => getAvailableProjectStatuses(items), [items]);
  const filteredProjects = useMemo(
    () => filterProjects(items, { tab, query, status, dateRange }),
    [dateRange, items, query, status, tab],
  );
  const latestNames = items.slice(0, 3).map((project) => project.name).join(" · ");
  const selectedProjects = useMemo(
    () => items.filter((project) => selectedIds.includes(project.id)),
    [items, selectedIds],
  );

  function getModeLabel(mode: string | null | undefined) {
    if (!mode) {
      return messages.common.mode.editorFallback;
    }

    const key = MODE_LABEL_KEYS[mode as keyof typeof MODE_LABEL_KEYS];
    return key ? messages.common.mode[key] : mode;
  }

  function toggleSelection(projectId: string) {
    setSelectedIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId],
    );
  }

  function resetSelection() {
    setSelectionMode(false);
    setSelectedIds([]);
  }

  function buildSingleDeleteState(project: RecentProjectListItem): DeleteState {
    return {
      ids: [project.id],
      title: "프로젝트를 삭제할까요?",
      description: "삭제 후에는 최근 프로젝트 목록과 관련 산출물을 복구할 수 없습니다.",
      details: [
        `이름: ${project.name}`,
        `모드: ${getModeLabel(project.mode)}`,
        `마지막 수정: ${new Date(project.updatedAt).toLocaleDateString("ko-KR")}`,
      ],
    };
  }

  function buildBulkDeleteState(targets: RecentProjectListItem[]): DeleteState {
    const first = targets[0];
    return {
      ids: targets.map((project) => project.id),
      title: `${targets.length}개의 프로젝트를 삭제할까요?`,
      description: `${first?.name ?? "선택한 프로젝트"}${targets.length > 1 ? ` 외 ${targets.length - 1}개` : ""}를 영구 삭제합니다.`,
      details: [
        `선택 항목: ${targets.length}개`,
        "관련 업로드, 작업 기록, 내보내기 산출물도 함께 정리됩니다.",
      ],
    };
  }

  async function handleDeleteConfirmed() {
    if (!deleteState) {
      return;
    }

    const ids = deleteState.ids;

    startTransition(async () => {
      try {
        for (const [index, id] of ids.entries()) {
          setDeleteProgress({ current: index + 1, total: ids.length });
          await deleteProject(id);
        }

        setItems((current) => current.filter((project) => !ids.includes(project.id)));
        setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
        setDeleteState(null);
        setDeleteProgress(null);

        if (selectionMode && ids.length > 1) {
          resetSelection();
        }

        toast.success(ids.length === 1 ? "프로젝트를 삭제했습니다." : `${ids.length}개의 프로젝트를 삭제했습니다.`);
        router.refresh();
      } catch (error) {
        setDeleteProgress(null);
        toast.error(error instanceof Error ? error.message : "프로젝트 삭제에 실패했습니다.");
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="takdi-panel-strong flex flex-col items-center justify-center rounded-[1.8rem] p-8">
        <FolderOpen className="mb-3 h-8 w-8 text-[var(--takdi-text-subtle)]" />
        <p className="text-sm font-medium text-[var(--takdi-text)]">{messages.home.emptyProjectsTitle}</p>
        <p className="mt-1 text-xs text-[var(--takdi-text-muted)]">{messages.home.emptyProjectsDescription}</p>
      </div>
    );
  }

  return (
    <>
      <div className="takdi-panel-strong rounded-[1.9rem]">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => collapsible && setCollapsed((value) => !value)}
            className={`min-w-0 text-left ${collapsible ? "flex-1" : ""}`}
          >
            <div className="flex items-center gap-3">
              {collapsible ? (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgb(214_199_184_/_0.82)] bg-[rgb(248_241_232_/_0.88)] text-[var(--takdi-text-muted)]">
                  <ArrowDown className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`} />
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--takdi-text)]">최근 프로젝트 {items.length}개</p>
                <p className="mt-1 truncate text-xs text-[var(--takdi-text-muted)]">
                  {collapsed
                    ? latestNames || messages.home.emptyProjectsHint
                    : "검색, 상태, 날짜 필터로 최근 작업을 빠르게 다시 엽니다."}
                </p>
              </div>
            </div>
          </button>

          {managementMode === "bulk" ? (
            <Button
              type="button"
              variant={selectionMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                if (selectionMode) {
                  resetSelection();
                  return;
                }
                setSelectionMode(true);
              }}
              className="rounded-2xl border-[rgb(214_199_184_/_0.76)] bg-[rgb(255_255_255_/_0.76)] text-xs font-medium text-[var(--takdi-text)] shadow-none hover:bg-[rgb(248_241_232_/_0.9)]"
            >
              {selectionMode ? "선택 취소" : "선택"}
            </Button>
          ) : null}
        </div>

        {!collapsed ? (
          <>
            <div className="border-t border-[rgb(230_218_206_/_0.84)] px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="inline-flex w-fit rounded-full border border-[rgb(214_199_184_/_0.82)] bg-[rgb(246_241_235_/_0.88)] p-1">
                  {PROJECT_KIND_TABS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTab(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        tab === item
                          ? WORKSPACE_CONTROL.pillActive
                          : "text-[var(--takdi-text-muted)] hover:text-[var(--takdi-text)]"
                      }`}
                    >
                      {item === "all"
                        ? messages.common.filters.all
                        : item === "compose"
                          ? messages.common.mode.compose
                          : messages.common.filters.editor}
                    </button>
                  ))}
                </div>

                <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:justify-end">
                  <label className="flex w-full items-center gap-2 rounded-2xl border border-[rgb(214_199_184_/_0.82)] bg-[rgb(247_243_238_/_0.88)] px-3 py-2 text-sm text-[var(--takdi-text-subtle)] lg:max-w-xs">
                    <Search className="h-4 w-4" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={messages.common.filters.searchProjectName}
                      className="w-full bg-transparent text-sm text-[var(--takdi-text)] outline-none placeholder:text-[var(--takdi-text-subtle)]"
                    />
                  </label>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as ProjectStatusFilter)}
                    className="rounded-2xl border border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.82)] px-3 py-2 text-sm text-[var(--takdi-text-muted)]"
                  >
                    {statusOptions.map((value) => (
                      <option key={value} value={value}>
                        {value === "all" ? messages.common.status.all : messages.common.status[value]}
                      </option>
                    ))}
                  </select>

                  <select
                    value={dateRange}
                    onChange={(event) => setDateRange(event.target.value as ProjectDateFilter)}
                    className="rounded-2xl border border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.82)] px-3 py-2 text-sm text-[var(--takdi-text-muted)]"
                  >
                    {PROJECT_DATE_FILTERS.map((item) => (
                      <option key={item} value={item}>
                        {item === "any"
                          ? messages.common.filters.anyTime
                          : item === "today"
                            ? messages.common.filters.today
                            : item === "last7"
                              ? messages.common.filters.last7Days
                              : messages.common.filters.last30Days}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mt-3 text-xs text-[var(--takdi-text-subtle)]">
                {formatShowingProjects(messages, filteredProjects.length, items.length)}
              </p>
            </div>

            {selectionMode && selectedIds.length > 0 ? (
              <div className="sticky top-0 z-10 border-y border-[rgb(240_229_218_/_0.95)] bg-[rgb(255_247_241_/_0.96)] px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#7B4A41]">{selectedIds.length}개 선택됨</p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteState(buildBulkDeleteState(selectedProjects))}
                      className="rounded-2xl border-[var(--takdi-delete-border)] bg-[var(--takdi-delete-bg)] text-xs font-medium text-[var(--takdi-delete-text)] shadow-none hover:bg-[rgb(245_220_220_/_0.95)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetSelection}
                      className={`rounded-2xl text-xs ${WORKSPACE_CONTROL.ghostButton}`}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {filteredProjects.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-[var(--takdi-text)]">{messages.home.noProjectsMatchTitle}</p>
                <p className="mt-1 text-xs text-[var(--takdi-text-muted)]">{messages.home.noProjectsMatchDescription}</p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {filteredProjects.map((project) => {
                  const isSelected = selectedIds.includes(project.id);
                  const inBulkMode = managementMode === "bulk";

                  return (
                    <div
                      key={project.id}
                      className={`group flex flex-col gap-3 rounded-[1.4rem] border border-[rgb(232_219_206_/_0.9)] bg-[linear-gradient(160deg,rgba(252,250,247,0.96),rgba(255,255,255,0.74))] px-4 py-3 transition-all hover:-translate-y-0.5 hover:bg-white md:flex-row md:items-center md:justify-between ${
                        selectionMode && inBulkMode ? "cursor-pointer" : ""
                      } ${isSelected ? "border-[rgb(217_124_103_/_0.95)] bg-[rgb(255_247_241_/_0.96)] shadow-[0_14px_24px_rgba(217,124,103,0.12)]" : ""}`}
                      onClick={() => {
                        if (selectionMode && inBulkMode) {
                          toggleSelection(project.id);
                        }
                      }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {selectionMode && inBulkMode ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(project.id)}
                            onClick={(event) => event.stopPropagation()}
                            className="h-4 w-4 rounded border-[#D4C7B8] text-[var(--takdi-accent)] focus:ring-[var(--takdi-accent)]"
                            aria-label={`${project.name} 선택`}
                          />
                        ) : null}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[rgb(236_227_217_/_0.92)] bg-white text-[var(--takdi-text-subtle)]">
                          <FolderOpen className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--takdi-text)]">{project.name}</p>
                          <p className="mt-1 truncate text-xs text-[var(--takdi-text-muted)]">
                            {getModeLabel(project.mode)} · {new Date(project.updatedAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <StatusBadge status={project.status} className="rounded-full" />

                        {!selectionMode ? (
                          <>
                            <Link href={getProjectDestination(project)}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl border-[rgb(236_197_183_/_0.95)] bg-[rgb(248_231_226_/_0.9)] text-xs font-medium text-[var(--takdi-accent-strong)] shadow-none hover:bg-[rgb(246_223_215_/_0.95)]"
                              >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                {project.mode === "compose" ? messages.common.actions.openCompose : messages.common.actions.openEditor}
                              </Button>
                            </Link>

                            <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                              <ItemActionsMenu
                                label={`${project.name} 메뉴`}
                                actions={[
                                  {
                                    key: "open",
                                    label: project.mode === "compose" ? messages.common.actions.openCompose : messages.common.actions.openEditor,
                                    onSelect: () => router.push(getProjectDestination(project)),
                                  },
                                  {
                                    key: "delete",
                                    label: "삭제",
                                    destructive: true,
                                    onSelect: () => setDeleteState(buildSingleDeleteState(project)),
                                  },
                                ]}
                              />
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </div>

      <DeleteConfirmDialog
        open={deleteState !== null}
        title={deleteState?.title ?? ""}
        description={deleteState?.description ?? ""}
        details={deleteState?.details ?? []}
        pending={isPending}
        busyLabel={
          deleteProgress
            ? `${deleteProgress.current}/${deleteProgress.total} 삭제 중...`
            : "삭제 중..."
        }
        onClose={() => {
          if (!isPending) {
            setDeleteState(null);
            setDeleteProgress(null);
          }
        }}
        onConfirm={() => void handleDeleteConfirmed()}
      />
    </>
  );
}
