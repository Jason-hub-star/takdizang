/** AssetGrid - 프로젝트 또는 워크스페이스 에셋 썸네일 그리드 (공용) */
"use client";

import { useState, useEffect } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import {
  getProjectAssets,
  getWorkspaceAssets,
  type AssetRecord,
  type WorkspaceAssetGroup,
} from "@/lib/api-client";
import { AppImage } from "@/components/ui/app-image";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

const SOURCE_LABELS: Record<string, string> = {
  uploaded: "업로드",
  "ai-generated": "AI 생성",
  cutout: "누끼",
  composed: "합성",
};

const MODE_LABELS: Record<string, string> = {
  compose: "상세페이지",
  "shortform-video": "숏폼",
  "model-shot": "모델컷",
  cutout: "누끼",
  "brand-image": "브랜드",
  "gif-source": "GIF",
  freeform: "자유형식",
};

interface AssetGridProps {
  projectId: string;
  scope?: "project" | "workspace";
  onSelect: (filePath: string) => void;
}

export function AssetGrid({ projectId, scope = "project", onSelect }: AssetGridProps) {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [groups, setGroups] = useState<WorkspaceAssetGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (scope === "workspace") {
      getWorkspaceAssets()
        .then((res) => {
          if (!cancelled) setGroups(res.groups);
        })
        .catch(() => {
          if (!cancelled) setGroups([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
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
    }

    return () => { cancelled = true; };
  }, [projectId, scope]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center rounded-2xl py-6 ${WORKSPACE_SURFACE.softInset}`}>
        <Loader2 className={`h-5 w-5 animate-spin ${WORKSPACE_TEXT.accent}`} />
      </div>
    );
  }

  if (scope === "workspace") {
    if (groups.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="space-y-4">
        {groups.map((group) => {
          const imageAssets = group.assets.filter((a) => a.mimeType?.startsWith("image/"));
          if (imageAssets.length === 0) return null;

          return (
            <div key={group.projectId}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${WORKSPACE_TEXT.accent}`}>
                  {MODE_LABELS[group.projectMode ?? ""] ?? "기타"}
                </span>
                <span className={`truncate text-xs font-medium ${WORKSPACE_TEXT.body}`}>
                  {group.projectName}
                </span>
                <span className={`text-[10px] ${WORKSPACE_TEXT.muted}`}>
                  {imageAssets.length}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {imageAssets.map((asset) => (
                  <AssetThumbnail key={asset.id} asset={asset} onSelect={onSelect} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (assets.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {assets
        .filter((a) => a.mimeType?.startsWith("image/"))
        .map((asset) => (
          <AssetThumbnail key={asset.id} asset={asset} onSelect={onSelect} />
        ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className={`rounded-2xl py-6 text-center text-xs ${WORKSPACE_SURFACE.softInset} ${WORKSPACE_TEXT.muted}`}>
      <ImageIcon className="mx-auto mb-1 h-6 w-6" />
      아직 파일이 없습니다
    </div>
  );
}

function AssetThumbnail({
  asset,
  onSelect,
}: {
  asset: AssetRecord;
  onSelect: (filePath: string) => void;
}) {
  return (
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
  );
}
