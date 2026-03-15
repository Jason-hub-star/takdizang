/** BYOI image and BGM file upload component. */
"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAsset, uploadBgm } from "@/lib/api-client";

interface UploadedAssetPayload {
  id: string;
  filePath: string;
  type: "image" | "bgm";
  durationMs?: number | null;
  bpm?: number | null;
}

interface AssetUploadProps {
  projectId: string;
  allowImages?: boolean;
  allowBgm?: boolean;
  onUploadComplete?: (asset: UploadedAssetPayload) => void;
  onError?: (message: string) => void;
}

export function AssetUpload({
  projectId,
  allowImages = true,
  allowBgm = true,
  onUploadComplete,
  onError,
}: AssetUploadProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bgmInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"image" | "bgm" | null>(null);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !allowImages) {
        return;
      }

      setUploading("image");
      try {
        const res = await uploadAsset(projectId, file, { sourceType: "uploaded" });
        onUploadComplete?.({
          id: res.asset.id,
          filePath: res.asset.filePath,
          type: "image",
        });
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "이미지 업로드 실패");
      } finally {
        setUploading(null);
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      }
    },
    [allowImages, onError, onUploadComplete, projectId],
  );

  const handleBgmUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !allowBgm) {
        return;
      }

      setUploading("bgm");
      try {
        const res = await uploadBgm(projectId, file);
        onUploadComplete?.({
          id: res.asset.id,
          filePath: res.asset.filePath,
          type: "bgm",
          durationMs: (res.analysis as { durationMs?: number | null } | undefined)?.durationMs ?? null,
          bpm: (res.analysis as { bpm?: number | null } | undefined)?.bpm ?? null,
        });
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "BGM 업로드 실패");
      } finally {
        setUploading(null);
        if (bgmInputRef.current) {
          bgmInputRef.current.value = "";
        }
      }
    },
    [allowBgm, onError, onUploadComplete, projectId],
  );

  return (
    <div className="flex flex-col gap-3">
      {allowImages ? (
        <>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading !== null}
          >
            {uploading === "image" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            )}
            이미지 업로드
          </Button>
        </>
      ) : null}

      {allowBgm ? (
        <>
          <input
            ref={bgmInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleBgmUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs"
            onClick={() => bgmInputRef.current?.click()}
            disabled={uploading !== null}
          >
            {uploading === "bgm" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Music className="h-3.5 w-3.5" />
            )}
            배경음악 업로드
          </Button>
        </>
      ) : null}
    </div>
  );
}
