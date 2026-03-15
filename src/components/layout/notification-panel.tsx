"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { WorkspaceActivityItem } from "@/features/workspace-hub/home-feed";
import { getProjectDestination, type RecentProjectListItem } from "@/features/workspace-hub/project-filters";
import { WORKSPACE_CONTROL, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  activity: WorkspaceActivityItem[];
}

export function NotificationPanel({ open, onClose, activity }: NotificationPanelProps) {
  const router = useRouter();

  const projectMap = useMemo(
    () =>
      new Map(
        activity
          .filter((item): item is WorkspaceActivityItem & { projectId: string; projectMode: string | null } => Boolean(item.projectId))
          .map((item) => [
            item.projectId,
            {
              id: item.projectId,
              name: item.detail.replace(" 프로젝트", ""),
              status: "generated",
              mode: item.projectMode,
              updatedAt: item.createdAt,
            } satisfies RecentProjectListItem,
          ]),
      ),
    [activity],
  );

  if (!open) {
    return null;
  }

  function handleOpenItem(item: WorkspaceActivityItem) {
    if (item.projectId) {
      const project = projectMap.get(item.projectId);
      if (project) {
        onClose();
        router.push(getProjectDestination(project));
        return;
      }
    }

    toast.message("연결된 프로젝트 정보가 없습니다.");
  }

  return (
    <div className="takdi-overlay-backdrop fixed inset-0 z-[71]" onClick={onClose}>
      <aside
        className="takdi-overlay-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-none border-l border-l-[rgb(214_199_184_/_0.76)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[rgb(214_199_184_/_0.76)] px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-medium ${WORKSPACE_TEXT.accent}`}>Activity feed</p>
              <h2 className={`mt-1 text-xl font-semibold ${WORKSPACE_TEXT.title}`}>알림</h2>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.success("현재 표시된 항목을 확인했습니다.")}
              className={`rounded-2xl ${WORKSPACE_CONTROL.subtleButton} text-xs font-medium shadow-none`}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              모두 확인
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activity.length > 0 ? (
            <div className="space-y-3">
              {activity.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenItem(item)}
                  className="takdi-overlay-card flex w-full items-start gap-3 rounded-[24px] px-4 py-4 text-left transition hover:bg-white/90"
                >
                  <div className="takdi-overlay-icon mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-medium ${WORKSPACE_TEXT.title}`}>{item.label}</p>
                      <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 ${WORKSPACE_TEXT.muted}`} />
                    </div>
                    <p className={`mt-1 text-sm leading-6 ${WORKSPACE_TEXT.body}`}>{item.detail}</p>
                    <div className={`mt-2 flex items-center gap-2 text-xs ${WORKSPACE_TEXT.muted}`}>
                      <span>{new Date(item.createdAt).toLocaleString("ko-KR")}</span>
                      <span>·</span>
                      <span>{item.costEstimate != null ? `$${item.costEstimate.toFixed(2)}` : "비용 기록 없음"}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="takdi-overlay-card-soft flex h-full items-center justify-center rounded-[28px] border border-dashed p-10 text-center">
              <div>
                <p className={`text-sm font-medium ${WORKSPACE_TEXT.title}`}>새 알림이 없습니다</p>
                <p className={`mt-2 text-xs leading-5 ${WORKSPACE_TEXT.body}`}>
                  내보내기 완료, 생성 실패, 최근 작업 상태가 이곳에 표시됩니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
