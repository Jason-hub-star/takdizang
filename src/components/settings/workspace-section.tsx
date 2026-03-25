/** 워크스페이스 탭 — 이름 편집, ID, 통계, 멤버 placeholder */
"use client";

import { useCallback, useState } from "react";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n/use-t";
import { updateWorkspaceName } from "@/lib/api-client";
import { InlineEdit } from "@/components/shared/inline-edit";
import { SummaryCard } from "@/components/shared/summary-card";
import type { SettingsPageData } from "@/features/workspace-hub/home-feed";

export function WorkspaceSection({ data }: { data: SettingsPageData }) {
  const { messages } = useT();
  const m = messages.settingsPage.workspaceSection;
  const sm = messages.settingsPage;

  const [wsName, setWsName] = useState(data.workspace.name);

  const handleNameSave = useCallback(
    async (newName: string) => {
      try {
        const { workspace } = await updateWorkspaceName({ name: newName });
        setWsName(workspace.name);
        toast.success(m.workspaceUpdated);
      } catch {
        toast.error(m.workspaceUpdateFailed);
        throw new Error();
      }
    },
    [m],
  );

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(data.workspace.id);
    toast.success("ID를 복사했어요.");
  }, [data.workspace.id]);

  return (
    <div className="space-y-8">
      {/* 워크스페이스 정보 */}
      <div className="takdi-panel-strong rounded-[1.9rem] p-6">
        <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.sectionTitle}</h3>
        <div className="mt-6 space-y-5">
          <div>
            <p className="takdi-stat-label">{m.workspaceName}</p>
            <div className="mt-1">
              <InlineEdit
                value={wsName}
                onSave={handleNameSave}
                placeholder={m.workspaceNamePlaceholder}
                className="text-base font-semibold text-[var(--takdi-text)]"
              />
            </div>
          </div>
          <div>
            <p className="takdi-stat-label">{m.workspaceId}</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="rounded-lg bg-[rgb(248_241_232_/_0.8)] px-2.5 py-1 text-xs text-[var(--takdi-text-muted)]">
                {data.workspace.id}
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--takdi-text-subtle)] hover:bg-[rgb(248_241_232_/_0.72)] hover:text-[var(--takdi-text)]"
                title="ID 복사"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-[var(--takdi-text-subtle)]">{m.workspaceIdDescription}</p>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.stats}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <SummaryCard
            title={sm.projects}
            value={String(data.stats.projectCount)}
            description={sm.projectCountDescription}
          />
          <SummaryCard
            title={sm.savedTemplates}
            value={String(data.stats.templateCount)}
            description={sm.templateCountDescription}
          />
          <SummaryCard
            title={sm.assets}
            value={String(data.stats.assetCount)}
            description={sm.assetCountDescription}
          />
        </div>
      </div>

      {/* 멤버 관리 placeholder */}
      <div className="takdi-panel rounded-[1.9rem] border-dashed p-6">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-[var(--takdi-text-subtle)]" />
          <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.members}</h3>
        </div>
        <p className="mt-2 text-sm text-[var(--takdi-text-muted)]">{m.membersComingSoon}</p>
      </div>
    </div>
  );
}
