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
      className={`w-full p-6 ${selected ? "takdi-block takdi-block-selected takdi-block-selected-fill" : "takdi-block takdi-block-default"}`}
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
          <div className={`flex h-48 items-center justify-center bg-[var(--takdi-soft-bg)] ${WORKSPACE_TEXT.muted}`}>
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
                className="h-24 rounded-[var(--takdi-radius-sm)]"
                placeholderText="포스터 이미지 업로드"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
