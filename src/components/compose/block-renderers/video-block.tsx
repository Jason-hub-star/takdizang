/** 영상 블록 — VideoUploadZone (mp4/gif) + 포스터 이미지 */
"use client";

import type { VideoBlock } from "@/types/blocks";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { VideoUploadZone, ImageUploadZone } from "../shared";

interface Props {
  block: VideoBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<VideoBlock>) => void;
  readOnly?: boolean;
}

export function VideoBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const mediaType = block.mediaType ?? "mp4";

  return (
    <div
      className={`w-full rounded-[28px] border p-6 transition-colors ${
        selected
          ? "border-[rgb(236_197_183_/_0.95)] bg-[rgb(255_249_245_/_0.96)] shadow-[0_16px_36px_rgba(217,124,103,0.12)]"
          : `${WORKSPACE_SURFACE.panel} hover:border-[rgb(215_201_188_/_0.94)]`
      }`}
      onClick={onSelect}
    >
      {readOnly ? (
        block.videoUrl ? (
          mediaType === "gif" ? (
            <img src={block.videoUrl} alt="" className="w-full rounded object-cover" />
          ) : (
            <video src={block.videoUrl} poster={block.posterUrl} controls className="w-full rounded" />
          )
        ) : (
          <div className={`flex h-48 items-center justify-center bg-[rgb(248_241_232_/_0.72)] ${WORKSPACE_TEXT.muted}`}>
            <p className="text-sm">영상을 추가하세요</p>
          </div>
        )
      ) : (
        <>
          <VideoUploadZone
            videoUrl={block.videoUrl}
            posterUrl={block.posterUrl}
            onVideoChange={(url) => onUpdate({ videoUrl: url })}
            mediaType={mediaType}
          />
          {mediaType === "mp4" && block.videoUrl && (
            <div className="mt-3">
              <p className={`mb-1 text-xs font-medium ${WORKSPACE_TEXT.muted}`}>포스터 이미지</p>
              <ImageUploadZone
                imageUrl={block.posterUrl}
                onImageChange={(url) => onUpdate({ posterUrl: url })}
                className="h-24 rounded-[20px]"
                placeholderText="포스터 이미지 업로드"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
