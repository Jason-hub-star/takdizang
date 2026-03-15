"use client";

import { type ComponentType, useState } from "react";
import { ImageIcon, PlayCircle, RefreshCw } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompositionId, RemotionInputProps } from "@/types";
import { COMPOSITIONS } from "./remotion-preview-config";
import type { RemotionPlayerRuntimeProps } from "./remotion-player-runtime";

interface PreviewPlayerLoaderProps {
  compositionId: CompositionId;
  inputProps: RemotionInputProps;
  projectName: string;
  sectionCount: number;
  imageCount: number;
  posterSrc?: string;
}

export function PreviewPlayerLoader({
  compositionId,
  inputProps,
  projectName,
  sectionCount,
  imageCount,
  posterSrc,
}: PreviewPlayerLoaderProps) {
  const [RuntimeComponent, setRuntimeComponent] =
    useState<ComponentType<RemotionPlayerRuntimeProps> | null>(null);
  const [hasRequestedRuntime, setHasRequestedRuntime] = useState(false);
  const [isLoadingRuntime, setIsLoadingRuntime] = useState(false);
  const [runtimeLoadError, setRuntimeLoadError] = useState<string | null>(null);

  const composition = COMPOSITIONS[compositionId];

  const loadRuntime = async () => {
    if (RuntimeComponent) {
      setHasRequestedRuntime(true);
      setRuntimeLoadError(null);
      return;
    }

    setIsLoadingRuntime(true);
    setRuntimeLoadError(null);

    try {
      const module = await import("./remotion-player-runtime");
      setRuntimeComponent(() => module.RemotionPlayerRuntime);
      setHasRequestedRuntime(true);
    } catch {
      setRuntimeLoadError("미리보기 런타임을 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoadingRuntime(false);
    }
  };

  if (hasRequestedRuntime && RuntimeComponent) {
    return <RuntimeComponent compositionId={compositionId} inputProps={inputProps} />;
  }

  const actionLabel = isLoadingRuntime ? "런타임 준비 중..." : "미리보기 로드";
  const statusLabel = runtimeLoadError
    ? "미리보기 런타임 로드 실패"
    : isLoadingRuntime
      ? "Loading preview runtime"
      : "Player는 재생 요청 시점에만 로드됩니다.";

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "mx-auto w-full overflow-hidden rounded-[2rem] border border-[rgb(214_199_184_/_0.78)] bg-[rgb(34_28_24_/_0.96)] shadow-[0_24px_80px_-32px_rgba(40,26,18,0.62)]",
          composition.maxWidthClassName,
        )}
      >
        <div className="border-b border-white/10 px-4 py-3 text-xs text-[rgb(234_224_214_/_0.78)]">
          {projectName} · {composition.label} preview shell
        </div>
        <div className={cn("relative w-full bg-[#241d19]", composition.aspectClassName)}>
          {posterSrc ? (
            <>
              <AppImage
                src={posterSrc}
                alt={`${projectName} representative preview`}
                fill
                className="object-cover opacity-70"
                sizes="(max-width: 768px) 100vw, 640px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18120f] via-[#18120f]/60 to-[#18120f]/10" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,124,103,0.32),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(198,161,85,0.2),transparent_26%),linear-gradient(160deg,#241d19_5%,#120d0a_100%)]" />
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-full border border-white/15 bg-white/10 p-3 text-white backdrop-blur">
              {runtimeLoadError ? (
                <RefreshCw className="size-6" />
              ) : posterSrc ? (
                <PlayCircle className="size-6" />
              ) : (
                <ImageIcon className="size-6" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">{statusLabel}</p>
              <p className="text-xs text-[rgb(234_224_214_/_0.78)]">
                Sections {sectionCount} · Images {imageCount} · Ratio {composition.label}
              </p>
            </div>
            <Button
              type="button"
              onClick={loadRuntime}
              disabled={isLoadingRuntime}
              className="rounded-full bg-[var(--takdi-accent)] px-5 text-white hover:bg-[var(--takdi-accent-strong)]"
            >
              {runtimeLoadError ? "다시 시도" : actionLabel}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[var(--takdi-text-subtle)]">
        첫 진입에서는 shell만 렌더링하고, 클릭 시 `@remotion/player`와 선택한 composition을
        불러옵니다.
      </p>
    </div>
  );
}
