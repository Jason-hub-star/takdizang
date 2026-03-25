"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecentProjectListItem, SavedTemplateListItem } from "@/features/workspace-hub/project-filters";
import type { WorkspaceActivityItem } from "@/features/workspace-hub/home-feed";
import { WORKSPACE_CONTROL } from "@/lib/workspace-surface";
import { DirectUploadLauncher } from "./direct-upload-launcher";
import { GlobalStartLauncher } from "./global-start-launcher";
import { GlobalSearchOverlay } from "./global-search-overlay";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { NotificationPanel } from "./notification-panel";

interface AppHeaderProps {
  workspaceName: string;
  projects: RecentProjectListItem[];
  templates: SavedTemplateListItem[];
  recentActivity: WorkspaceActivityItem[];
}

export function AppHeader({
  workspaceName,
  projects,
  templates,
  recentActivity,
}: AppHeaderProps) {
  const pathname = usePathname();
  const [startOpen, setStartOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setStartOpen(false);
    setUploadOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 shrink-0 border-b border-[rgb(212_196_181_/_0.55)] bg-[rgb(247_241_234_/_0.72)] px-5 py-4 backdrop-blur-2xl lg:px-8">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <MobileNavSheet />
            <div className="hidden min-w-0 lg:block">
              <p className="takdi-kicker">Takdi Workspace</p>
              <p className="mt-1 truncate text-sm text-[var(--takdi-text-muted)]">
                {workspaceName}의 최근 작업과 템플릿을 한 흐름으로 이어갑니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="takdi-panel-strong flex min-w-0 flex-1 items-center gap-3 rounded-[1.4rem] px-4 py-3 text-left text-sm text-[var(--takdi-text-subtle)] transition hover:border-[rgb(212_184_166_/_0.86)] hover:bg-[rgb(255_255_255_/_0.96)]"
            >
              <Search className="h-4 w-4 shrink-0 text-[var(--takdi-accent-strong)]" />
              <span className="min-w-0 flex-1 truncate">프로젝트, 템플릿, 작업 찾기</span>
              <span className={`hidden px-2.5 py-1 text-[11px] sm:inline-flex ${WORKSPACE_CONTROL.pill}`}>
                Ctrl K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className={`takdi-panel flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${WORKSPACE_CONTROL.ghostButton}`}
              title="알림"
            >
              <Bell className="h-5 w-5" />
            </button>

            <Link
              href="/workspace"
              className={`takdi-panel-strong flex h-11 w-11 items-center justify-center rounded-full transition-colors ${WORKSPACE_CONTROL.ghostButton}`}
              title={`${workspaceName} 워크스페이스`}
            >
              <User className="h-4 w-4" />
            </Link>

            <Button
              type="button"
              onClick={() => setStartOpen(true)}
              className="h-11 rounded-[1.15rem] bg-[var(--takdi-accent)] px-3 text-sm font-semibold tracking-[-0.01em] text-white shadow-[0_18px_34px_rgba(217,124,103,0.25)] hover:bg-[var(--takdi-accent-strong)] sm:px-5"
            >
              <Plus className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">새 작업 시작</span>
            </Button>
          </div>
        </div>
      </header>

      <GlobalStartLauncher
        open={startOpen}
        onClose={() => setStartOpen(false)}
        onDirectUpload={() => {
          setStartOpen(false);
          setUploadOpen(true);
        }}
      />
      <DirectUploadLauncher open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <GlobalSearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        workspaceName={workspaceName}
        projects={projects}
        templates={templates}
      />
      <NotificationPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        activity={recentActivity}
      />
    </>
  );
}
