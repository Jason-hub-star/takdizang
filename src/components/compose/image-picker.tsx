/** 이미지 선택/교체 — 파일 업로드 + 프로젝트 에셋 팝오버 */
"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, ImageIcon, X, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { uploadAsset } from "@/lib/api-client";
import { AssetGrid } from "./shared/asset-grid";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

type Tab = "upload" | "assets";

interface ImagePickerProps {
  projectId: string;
  currentUrl: string;
  onImageChange: (url: string) => void;
}

export function ImagePicker({ projectId, currentUrl, onImageChange }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("upload");
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const result = await uploadAsset(projectId, file, { sourceType: "uploaded" });
        onImageChange(result.asset.filePath);
        setOpen(false);
      } catch {
        toast.error("이미지 업로드에 실패했습니다");
      } finally {
        setUploading(false);
      }
    },
    [projectId, onImageChange],
  );

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setOpen(false);
      setUrlInput("");
    }
  }, [urlInput, onImageChange]);

  const handleAssetSelect = useCallback(
    (filePath: string) => {
      onImageChange(filePath);
      setOpen(false);
    },
    [onImageChange],
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs ${WORKSPACE_CONTROL.subtleButton} shadow-none`}
      >
        <ImageIcon className="h-3.5 w-3.5" />
        {currentUrl ? "이미지 교체" : "이미지 추가"}
      </button>
    );
  }

  return (
    <div className={`rounded-[24px] p-3 ${WORKSPACE_SURFACE.panelStrong}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-xs font-medium ${WORKSPACE_TEXT.body}`}>이미지 선택</span>
        <button onClick={() => setOpen(false)} className={`${WORKSPACE_TEXT.muted} hover:text-[var(--takdi-text)]`}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tab switcher */}
      <div className={`mb-2 flex gap-1 rounded-2xl p-1 ${WORKSPACE_SURFACE.softInset}`}>
        <button
          onClick={() => setTab("upload")}
            className={`flex-1 rounded-2xl px-2 py-1.5 text-xs font-medium transition-colors ${
            tab === "upload" ? WORKSPACE_CONTROL.accentTint : WORKSPACE_TEXT.body
          }`}
        >
          <Upload className="mr-1 inline h-3 w-3" />
          업로드
        </button>
        <button
          onClick={() => setTab("assets")}
            className={`flex-1 rounded-2xl px-2 py-1.5 text-xs font-medium transition-colors ${
            tab === "assets" ? WORKSPACE_CONTROL.accentTint : WORKSPACE_TEXT.body
          }`}
        >
          <FolderOpen className="mr-1 inline h-3 w-3" />
          프로젝트 파일
        </button>
      </div>

      {tab === "upload" ? (
        <>
          {/* File upload */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`mb-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[rgb(213_204_195_/_0.92)] px-3 py-2 text-xs ${WORKSPACE_TEXT.body} hover:border-[var(--takdi-accent)] hover:text-[var(--takdi-accent-strong)]`}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "업로드 중..." : "파일 업로드"}
          </button>

          {/* URL input */}
          <div className="flex gap-1">
            <input
              type="text"
              placeholder="이미지 웹 주소 입력"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleUrlSubmit(); }}
              className={`flex-1 rounded-2xl px-3 py-1.5 text-xs ${WORKSPACE_CONTROL.input}`}
            />
            <button
              onClick={handleUrlSubmit}
              className={`rounded-2xl px-3 py-1.5 text-xs font-medium ${WORKSPACE_CONTROL.accentButton}`}
            >
              적용
            </button>
          </div>
        </>
      ) : (
        <div className="max-h-[240px] overflow-y-auto">
          <AssetGrid projectId={projectId} onSelect={handleAssetSelect} />
        </div>
      )}
    </div>
  );
}
