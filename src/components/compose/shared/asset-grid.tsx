/** AssetGrid - 프로젝트 에셋 썸네일 그리드 (공용) */
"use client";

import { useState, useEffect } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import { getProjectAssets, type AssetRecord } from "@/lib/api-client";
import { AppImage } from "@/components/ui/app-image";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

const SOURCE_LABELS: Record<string, string> = {
  uploaded: "업로드",
  "ai-generated": "AI 생성",
  cutout: "누끼",
  composed: "합성",
};

interface AssetGridProps {
  projectId: string;
  onSelect: (filePath: string) => void;
}

export function AssetGrid({ projectId, onSelect }: AssetGridProps) {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProjectAssets(projectId)
      .then((res) => {
        if (!cancelled) setAssets(res.assets);
      })
      .catch(() => {
        if (!cancelled) setAssets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [projectId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center rounded-2xl py-6 ${WORKSPACE_SURFACE.softInset}`}>
        <Loader2 className={`h-5 w-5 animate-spin ${WORKSPACE_TEXT.accent}`} />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={`rounded-2xl py-6 text-center text-xs ${WORKSPACE_SURFACE.softInset} ${WORKSPACE_TEXT.muted}`}>
        <ImageIcon className="mx-auto mb-1 h-6 w-6" />
        아직 파일이 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {assets
        .filter((a) => a.mimeType?.startsWith("image/"))
        .map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(asset.filePath)}
            className={`group relative aspect-square overflow-hidden rounded-[18px] border transition ${WORKSPACE_SURFACE.softInset} hover:border-[rgb(236_197_183_/_0.95)] hover:shadow-[0_10px_24px_rgba(217,124,103,0.12)]`}
          >
            <AppImage
              src={asset.previewPath ?? asset.filePath}
              alt=""
              fill
              sizes="(max-width: 768px) 33vw, 96px"
              className="object-cover"
            />
            <span className="absolute bottom-1 left-1 right-1 rounded-full border border-[rgb(84_64_50_/_0.18)] bg-[linear-gradient(135deg,#2b2420,#46362d)] px-2 py-1 text-[10px] text-white opacity-0 shadow-[0_12px_24px_rgba(40,26,18,0.22)] transition-opacity group-hover:opacity-100">
              {SOURCE_LABELS[asset.sourceType] || asset.sourceType}
            </span>
          </button>
        ))}
    </div>
  );
}
