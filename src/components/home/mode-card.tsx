/** Home mode selection card component. */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Clapperboard,
  UserRound,
  Scissors,
  ImageIcon,
  Film,
  Sparkles,
  LayoutPanelTop,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { formatCreateProjectName } from "@/i18n/format";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { createProject } from "@/lib/api-client";
import type { ProjectMode } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  compose: LayoutPanelTop,
  "model-shot": UserRound,
  cutout: Scissors,
  "brand-image": ImageIcon,
  "gif-source": Film,
  freeform: Sparkles,
};

export function getModeIcon(mode: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    ...ICON_MAP,
    "shortform-video": Clapperboard,
  };
  return iconMap[mode] ?? Sparkles;
}

const NAVIGATION_FALLBACK_MS = 4000;

const CARD_STYLES: Record<string, { iconWrap: string; icon: string; surface: string; kicker: string }> = {
  compose: {
    iconWrap: "border-[rgb(236_200_170_/_0.95)] bg-[rgb(252_239_225_/_0.96)]",
    icon: "text-[#B56B3B]",
    surface:
      "bg-[linear-gradient(160deg,rgba(255,252,247,0.95),rgba(249,235,219,0.8))]",
    kicker: "Detail page",
  },
  "shortform-video": {
    iconWrap: "border-[rgb(241_197_186_/_0.95)] bg-[rgb(248_231_226_/_0.96)]",
    icon: "text-[var(--takdi-accent-strong)]",
    surface:
      "bg-[linear-gradient(160deg,rgba(255,252,247,0.96),rgba(248,232,229,0.82))]",
    kicker: "Shortform",
  },
  "model-shot": {
    iconWrap: "border-[rgb(222_209_188_/_0.95)] bg-[rgb(245_239_227_/_0.95)]",
    icon: "text-[#7C634D]",
    surface:
      "bg-[linear-gradient(160deg,rgba(255,252,247,0.96),rgba(242,236,228,0.84))]",
    kicker: "Model shot",
  },
  cutout: {
    iconWrap: "border-[rgb(221_212_196_/_0.95)] bg-[rgb(245_240_233_/_0.96)]",
    icon: "text-[#6C6559]",
    surface:
      "bg-[linear-gradient(160deg,rgba(255,252,247,0.96),rgba(242,239,235,0.82))]",
    kicker: "Cutout",
  },
  freeform: {
    iconWrap: "border-[rgb(241_200_190_/_0.95)] bg-[rgb(248_231_226_/_0.95)]",
    icon: "text-[var(--takdi-accent-strong)]",
    surface:
      "bg-[linear-gradient(160deg,rgba(249,243,236,0.96),rgba(241,229,219,0.84))]",
    kicker: "Freeform",
  },
  default: {
    iconWrap: "border-[rgb(230_213_207_/_0.92)] bg-[rgb(248_230_225_/_0.94)]",
    icon: "text-[var(--takdi-accent-strong)]",
    surface:
      "bg-[linear-gradient(160deg,rgba(255,252,247,0.95),rgba(246,240,232,0.78))]",
    kicker: "Automation",
  },
};

interface ModeCardProps {
  mode: ProjectMode;
  label: string;
  description: string;
  editorMode?: "flow" | "compose";
  className?: string;
}

export function ModeCard({
  mode,
  label,
  description,
  editorMode,
  className,
}: ModeCardProps) {
  const Icon = getModeIcon(mode);
  const style = CARD_STYLES[mode] ?? CARD_STYLES.default;
  const router = useRouter();
  const pathname = usePathname();
  const { messages } = useT();
  const [loading, setLoading] = useState(false);
  const pendingTargetRef = useRef<string | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const pendingTarget = pendingTargetRef.current;
    if (!pendingTarget) {
      return;
    }

    if (pathname === pendingTarget) {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      pendingTargetRef.current = null;
      setLoading(false);
      console.timeEnd(`[ModeCard] navigation:${mode}`);
    }
  }, [mode, pathname]);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  async function handleClick() {
    if (loading) return;

    const createProjectLabel = `[ModeCard] createProject:${mode}`;
    const navigationLabel = `[ModeCard] navigation:${mode}`;

    setLoading(true);
    console.time(createProjectLabel);

    try {
      const project = await createProject({
        name: formatCreateProjectName(messages, label),
        mode,
        briefText: "",
      });
      console.timeEnd(createProjectLabel);

      const target = editorMode === "compose"
        ? `/projects/${project.id}/compose`
        : `/projects/${project.id}/editor`;

      pendingTargetRef.current = target;
      console.time(navigationLabel);

      if (process.env.NODE_ENV === "production") {
        console.info(`[ModeCard] prefetch:${mode}`, target);
        router.prefetch(target);
      } else {
        console.info(`[ModeCard] skip prefetch in dev:${mode}`, target);
      }

      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
      fallbackTimerRef.current = setTimeout(() => {
        if (pendingTargetRef.current === target && window.location.pathname !== target) {
          console.warn(`[ModeCard] navigation fallback:${mode}`, target);
          window.location.assign(target);
        }
      }, NAVIGATION_FALLBACK_MS);

      console.info(`[ModeCard] push:${mode}`, target);
      router.push(target);
    } catch {
      console.timeEnd(createProjectLabel);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      pendingTargetRef.current = null;
      toast.error(messages.modeCard.createProjectFailed);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "group relative flex min-h-[168px] min-w-0 flex-col overflow-hidden rounded-[1.8rem] border border-[rgb(219_206_191_/_0.92)] p-6",
        "shadow-[0_18px_36px_rgba(80,54,34,0.06)]",
        "transition-all duration-200 hover:-translate-y-1 hover:border-[rgb(208_190_171_/_0.98)] hover:shadow-[0_24px_48px_rgba(80,54,34,0.09)]",
        style.surface,
        "text-left",
        className,
      )}
    >
      <div className="absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.55))]" />
      <div className="relative flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <p className="takdi-kicker">{style.kicker}</p>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--takdi-text-subtle)] transition group-hover:text-[var(--takdi-accent-strong)]" />
        </div>

        <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border transition-colors",
            style.iconWrap,
          )}
        >
          {loading ? (
            <Loader2 className={cn("h-4 w-4 animate-spin", style.icon)} />
          ) : (
            <Icon className={cn("h-4 w-4", style.icon)} />
          )}
        </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-[17px] font-semibold tracking-[-0.035em] text-[var(--takdi-text)]">
              {label}
            </p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--takdi-text-muted)]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
