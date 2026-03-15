/** Debug-only global page navigation for quickly moving between major Takdi routes. */
import Link from "next/link";
import { isDebugGlobalNavEnabled } from "@/lib/debug-env";

const links = [
  { href: "/", label: "홈" },
  { href: "/projects", label: "프로젝트" },
  { href: "/workspace", label: "워크스페이스" },
  { href: "/settings", label: "설정" },
  { href: "/landing", label: "랜딩 초안" },
];

export function GlobalDebugNav() {
  if (!isDebugGlobalNavEnabled()) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[80] border-b border-[rgb(219_205_190_/_0.72)] bg-[rgb(247_241_233_/_0.9)] backdrop-blur">
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-4 py-2 text-sm font-medium text-[var(--takdi-text-muted)] transition hover:border-[rgb(212_184_166_/_0.86)] hover:text-[var(--takdi-text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800">
          Debug Nav On
        </div>
      </div>
    </div>
  );
}
