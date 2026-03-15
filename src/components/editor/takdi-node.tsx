/** React Flow 커스텀 노드 — Takdi 파이프라인 노드 + 인라인 미리보기 */
"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Sparkles,
  ImageIcon,
  Music,
  Scissors,
  Film,
  Download,
  Upload,
  Eraser,
  UserRound,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppImage } from "@/components/ui/app-image";
import { InlineLightbox } from "./inline-lightbox";
import { getUserFacingNodeStatus } from "@/lib/editor-surface";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

const ICONS: Record<string, React.ElementType> = {
  prompt: Sparkles,
  generate: Sparkles, // backward compat for saved projects
  "generate-images": ImageIcon,
  bgm: Music,
  cuts: Scissors,
  render: Film,
  export: Download,
  "upload-image": Upload,
  "remove-bg": Eraser,
  "model-compose": UserRound,
};

interface TakdiNodeData {
  label: string;
  nodeType: string;
  status?: string;
  previewText?: string;
  previewImages?: string[];
  [key: string]: unknown;
}

function TakdiNodeComponent({ data, selected }: NodeProps & { data: TakdiNodeData }) {
  const Icon = ICONS[data.nodeType] ?? Sparkles;
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const statusInfo = getUserFacingNodeStatus(data);

  return (
    <>
      <div
        className={`min-w-50 rounded-[24px] p-4 transition-all ${WORKSPACE_SURFACE.panelStrong} ${
          selected
            ? "border-[rgb(236_197_183_/_0.95)] ring-2 ring-[rgb(243_212_203_/_0.92)] shadow-[0_18px_38px_rgba(217,124,103,0.16)]"
            : "hover:border-[rgb(221_205_190_/_0.92)] hover:shadow-[0_16px_34px_rgba(55,40,30,0.1)]"
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-white/80 !bg-[var(--takdi-accent)] shadow-[0_0_0_3px_rgba(248,231,226,0.8)]"
        />

        <div className="flex items-center gap-2">
          <div className="takdi-overlay-icon flex h-7 w-7 items-center justify-center rounded-2xl">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className={`text-sm font-medium ${WORKSPACE_TEXT.title}`}>{data.label}</span>
        </div>

        {data.status && (
          <div className="mt-2">
            <StatusBadge status={data.status} label={statusInfo.label} tone={statusInfo.tone} />
          </div>
        )}

        {/* Inline preview: text */}
        {data.previewText && (
          <p className={`mt-2 max-w-[180px] text-xs leading-relaxed line-clamp-2 ${WORKSPACE_TEXT.body}`}>
            {data.previewText}
          </p>
        )}

        {/* Inline preview: image thumbnails */}
        {data.previewImages && data.previewImages.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-1">
            {data.previewImages.slice(0, 4).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <AppImage
                key={i}
                src={src}
                alt={`미리보기 ${i + 1}`}
                width={48}
                height={48}
                className="h-12 w-12 cursor-pointer rounded object-cover transition-opacity hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxSrc(src);
                }}
              />
            ))}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-white/80 !bg-[var(--takdi-accent)] shadow-[0_0_0_3px_rgba(248,231,226,0.8)]"
        />
      </div>

      {lightboxSrc && (
        <InlineLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}

export const TakdiNode = memo(TakdiNodeComponent);
