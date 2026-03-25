/** 모바일 전용 네비게이션 Sheet — md(768px) 미만에서만 표시. */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderOpen, Home, LogOut, Menu, Settings, User } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

interface UserProfile {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export function MobileNavSheet() {
  const pathname = usePathname();
  const router = useRouter();
  const { messages } = useT();
  const [open, setOpen] = useState(false);
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

  // 경로 변경 시 자동 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }, [router]);

  const navItems = [
    { href: "/", icon: Home, label: messages.common.actions.home, desc: "새 작업과 최근 흐름" },
    { href: "/projects", icon: FolderOpen, label: messages.common.actions.projects, desc: "프로젝트와 템플릿 관리" },
    { href: "/settings", icon: Settings, label: messages.common.actions.settings, desc: "계정과 워크스페이스 관리" },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--takdi-text-muted)] transition-colors hover:bg-[rgb(248_241_232_/_0.72)] hover:text-[var(--takdi-text)] md:hidden"
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-72 border-r border-[rgb(212_196_181_/_0.55)] bg-[rgb(239_231_220_/_0.96)] p-0 backdrop-blur-xl"
        >
          <SheetTitle className="sr-only">네비게이션</SheetTitle>

          <div className="flex h-full flex-col justify-between px-3 py-5">
            <div className="space-y-8">
              {/* 로고 */}
              <Link
                href="/"
                className="takdi-panel-strong flex items-center gap-3 rounded-[1.6rem] px-4 py-3"
                onClick={() => setOpen(false)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-[linear-gradient(135deg,#d97c67,#b96f46)] text-sm font-semibold text-white shadow-[var(--takdi-shadow-accent-lg)]">
                  T
                </span>
                <span className="min-w-0">
                  <strong className="block text-sm font-semibold text-[var(--takdi-text)]">Takdi Studio</strong>
                  <span className="mt-0.5 block truncate text-xs text-[var(--takdi-text-muted)]">
                    내부 영상 자동화 엔진
                  </span>
                </span>
              </Link>

              {/* 네비게이션 */}
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
                        "group flex items-center gap-3 rounded-[1.3rem] px-4 py-3 transition-all duration-200",
                        isActive
                          ? "border border-[rgb(236_197_183_/_0.9)] bg-[rgb(248_231_226_/_0.92)] text-[var(--takdi-accent-strong)] shadow-[0_14px_28px_rgba(217,124,103,0.14)]"
                          : "border border-transparent text-[var(--takdi-text-muted)] hover:border-[rgb(214_199_184_/_0.74)] hover:bg-[rgb(248_241_232_/_0.72)] hover:text-[var(--takdi-text)]",
                      )}
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
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{item.label}</span>
                        <span className="mt-0.5 block truncate text-xs text-[var(--takdi-text-subtle)]">
                          {item.desc}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* 하단: 프로필 + 로그아웃 */}
            <div className="space-y-3">
              <Link
                href="/workspace"
                className="takdi-panel-strong flex items-center gap-3 rounded-[1.35rem] px-4 py-3 text-[var(--takdi-text-muted)] transition-colors hover:text-[var(--takdi-text)]"
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
                <span className="min-w-0">
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
                  className="flex w-full items-center gap-3 rounded-[1.35rem] px-4 py-2.5 text-[var(--takdi-text-muted)] transition-colors hover:bg-[rgb(248_231_226_/_0.6)] hover:text-red-600"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <LogOut className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium">로그아웃</span>
                </button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
