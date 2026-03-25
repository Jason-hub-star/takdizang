/** Minimal sidebar navigation for home, projects, and settings routes. */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderOpen, Home, LogOut, Settings, User } from "lucide-react";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

interface UserProfile {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { messages } = useT();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setProfile({
          email: user.email ?? "",
          displayName: user.user_metadata?.name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        });
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);
  const navItems = [
    { href: "/", icon: Home, label: messages.common.actions.home },
    { href: "/projects", icon: FolderOpen, label: messages.common.actions.projects },
    { href: "/settings", icon: Settings, label: messages.common.actions.settings },
  ];

  return (
    <aside className="hidden w-[5.4rem] shrink-0 border-r border-[rgb(212_196_181_/_0.55)] bg-[rgb(239_231_220_/_0.76)] px-3 py-5 backdrop-blur-xl md:flex lg:w-[17rem] lg:px-4">
      <div className="flex w-full flex-col justify-between">
        <div className="space-y-8">
          <Link
            href="/"
            className="takdi-panel-strong flex items-center gap-3 rounded-[1.6rem] px-3 py-3 lg:px-4"
            title={messages.layout.logoTitle}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-[linear-gradient(135deg,#d97c67,#b96f46)] text-sm font-semibold text-white shadow-[var(--takdi-shadow-accent-lg)]">
              T
            </span>
            <span className="hidden min-w-0 lg:block">
              <strong className="block text-sm font-semibold text-[var(--takdi-text)]">Takdi Studio</strong>
              <span className="mt-0.5 block truncate text-xs text-[var(--takdi-text-muted)]">
                내부 영상 자동화 엔진
              </span>
            </span>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-[1.3rem] px-3 py-3 transition-all duration-200 lg:px-4",
                    isActive
                      ? "border border-[rgb(236_197_183_/_0.9)] bg-[rgb(248_231_226_/_0.92)] text-[var(--takdi-accent-strong)] shadow-[0_14px_28px_rgba(217,124,103,0.14)]"
                      : "border border-transparent text-[var(--takdi-text-muted)] hover:border-[rgb(214_199_184_/_0.74)] hover:bg-[rgb(248_241_232_/_0.72)] hover:text-[var(--takdi-text)]",
                  )}
                  title={item.label}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border transition-colors",
                      isActive
                        ? "border-[rgb(236_197_183_/_0.95)] bg-white text-[var(--takdi-accent-strong)]"
                        : "border-[rgb(214_199_184_/_0.55)] bg-[rgb(255_255_255_/_0.52)] text-[var(--takdi-text-subtle)] group-hover:bg-white",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="hidden min-w-0 lg:block">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-[var(--takdi-text-subtle)]">
                      {item.href === "/"
                        ? "새 작업과 최근 흐름"
                        : item.href === "/projects"
                          ? "프로젝트와 템플릿 관리"
                          : "계정과 워크스페이스 관리"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          <Link
            href="/workspace"
            className="takdi-panel-strong flex items-center justify-center gap-3 rounded-[1.35rem] px-3 py-3 text-[var(--takdi-text-muted)] transition-colors hover:text-[var(--takdi-text)] lg:justify-start lg:px-4"
            title="워크스페이스 허브"
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full border border-[rgb(214_199_184_/_0.65)] object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgb(214_199_184_/_0.65)] bg-[rgb(255_255_255_/_0.84)]">
                <User className="h-4 w-4" />
              </span>
            )}
            <span className="hidden min-w-0 lg:block">
              <span className="block truncate text-sm font-semibold text-[var(--takdi-text)]">
                {profile?.displayName ?? "워크스페이스"}
              </span>
              <span className="block truncate text-xs text-[var(--takdi-text-subtle)]">
                {profile?.email ?? "운영 허브 열기"}
              </span>
            </span>
          </Link>

          {profile && (
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-[1.35rem] px-3 py-2.5 text-[var(--takdi-text-muted)] transition-colors hover:bg-[rgb(248_231_226_/_0.6)] hover:text-red-600 lg:justify-start lg:px-4"
              title="로그아웃"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                <LogOut className="h-4 w-4" />
              </span>
              <span className="hidden text-xs font-medium lg:block">로그아웃</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
