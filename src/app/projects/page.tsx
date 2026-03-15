/** Full workspace explorer for projects and saved compose templates. */
import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/app-layout";
import { RecentProjects } from "@/components/home/recent-projects";
import { SavedTemplates } from "@/components/home/saved-templates";
import { getProjectsPageData } from "@/features/workspace-hub/home-feed";
import { getMessages } from "@/i18n/get-messages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "프로젝트 | Takdi Studio",
  description: "워크스페이스의 최근 프로젝트와 저장된 템플릿을 탐색합니다.",
};

export default async function ProjectsPage() {
  const { projects, templates } = await getProjectsPageData();
  const messages = getMessages();

  return (
    <AppLayout>
      <section className="takdi-page-intro grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <p className="takdi-kicker">Project explorer</p>
          <h1 className="takdi-display mt-4 max-w-[10ch]">{messages.projectsPage.title}</h1>
          <p className="takdi-lead mt-5">{messages.projectsPage.description}</p>
        </div>

        <div className="takdi-panel rounded-[1.7rem] p-5">
          <p className="takdi-stat-label">Browse faster</p>
          <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[var(--takdi-text)]">
            검색, 상태, 날짜 필터를 같은 선상에 모아 복귀 동선을 짧게 만들었습니다.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--takdi-text-muted)]">
            최근 프로젝트와 저장 템플릿을 같은 표면 언어로 맞춰 작업 전환 시 맥락이 끊기지 않도록 정리했습니다.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="takdi-kicker">Projects</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--takdi-text)]">
            {messages.projectsPage.explorerTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--takdi-text-muted)]">
            {messages.projectsPage.explorerDescription}
          </p>
        </div>
        <RecentProjects projects={projects} collapsible managementMode="bulk" />
      </section>

      <section className="space-y-4">
        <div>
          <p className="takdi-kicker">Templates</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--takdi-text)]">
            {messages.projectsPage.savedTemplatesTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--takdi-text-muted)]">
            {messages.projectsPage.savedTemplatesDescription}
          </p>
        </div>
        <SavedTemplates templates={templates} searchable collapsible managementMode="bulk" />
      </section>
    </AppLayout>
  );
}
