/** Sidebar + Header + Content 영역을 래핑하는 앱 공통 레이아웃 */
import { redirect } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { AuthError } from "@/lib/workspace-guard";
import { getHeaderSurfaceData } from "@/features/workspace-hub/home-feed";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const headerDataPromise = getHeaderSurfaceData();

  return (
    <AppLayoutInner headerDataPromise={headerDataPromise}>{children}</AppLayoutInner>
  );
}

async function AppLayoutInner({
  children,
  headerDataPromise,
}: AppLayoutProps & {
  headerDataPromise: ReturnType<typeof getHeaderSurfaceData>;
}) {
  let headerData;
  try {
    headerData = await headerDataPromise;
  } catch (err) {
    if (err instanceof AuthError) redirect("/login");
    throw err;
  }

  return (
    <div className="takdi-shell flex min-h-screen text-[var(--takdi-text)]">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader {...headerData} />
        <main className="takdi-main flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-5 pb-10 pt-8 lg:px-8 lg:pb-14 lg:pt-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
