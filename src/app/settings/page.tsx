/** 설정 페이지 — 계정, 사용량, 워크스페이스, AI 프로바이더 관리 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthError } from "@/lib/workspace-guard";
import { getSettingsPageData } from "@/features/workspace-hub/home-feed";
import { getMessages } from "@/i18n/get-messages";
import { SettingsShell } from "@/components/settings/settings-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "설정 | Takdi Studio",
  description: "계정과 워크스페이스를 관리해요.",
};

export default async function SettingsPage() {
  let data;
  try {
    data = await getSettingsPageData();
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }
  const messages = getMessages();

  return (
    <AppLayout>
      <section className="takdi-page-intro px-6 py-7 lg:px-8">
        <h1 className="takdi-display mt-4 max-w-[9ch]">{messages.settingsPage.title}</h1>
        <p className="takdi-lead mt-5">{messages.settingsPage.description}</p>
      </section>

      <SettingsShell data={data} />
    </AppLayout>
  );
}
