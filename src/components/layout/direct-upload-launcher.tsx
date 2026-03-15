/** Shared direct-upload launcher with local staging before project creation. */
"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, ImageIcon, Loader2, Music, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createProject, updateContent, uploadAsset, uploadBgm } from "@/lib/api-client";
import { formatCreateProjectName } from "@/i18n/format";
import { useT } from "@/i18n/use-t";
import { getProjectStartDestination, START_MODE_DEFINITIONS } from "@/features/workspace-hub/start-modes";
import { WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface DirectUploadLauncherProps {
  open: boolean;
  onClose: () => void;
}

export function DirectUploadLauncher({ open, onClose }: DirectUploadLauncherProps) {
  const router = useRouter();
  const { messages } = useT();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [bgmFile, setBgmFile] = useState<File | null>(null);
  const [briefFile, setBriefFile] = useState<File | null>(null);
  const [submittingMode, setSubmittingMode] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submittingMode) {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, submittingMode]);

  const hasStagedFiles = imageFiles.length > 0 || Boolean(bgmFile) || Boolean(briefFile);

  const stagedSummary = useMemo(() => {
    const parts: string[] = [];
    if (imageFiles.length > 0) {
      parts.push(`이미지 ${imageFiles.length}개`);
    }
    if (bgmFile) {
      parts.push("BGM 1개");
    }
    if (briefFile) {
      parts.push("기획 TXT 1개");
    }
    return parts.join(" · ");
  }, [bgmFile, briefFile, imageFiles.length]);

  if (!open) {
    return null;
  }

  function resetState() {
    setImageFiles([]);
    setBgmFile(null);
    setBriefFile(null);
    setSubmittingMode(null);
  }

  function handleClose() {
    if (submittingMode) {
      return;
    }
    resetState();
    onClose();
  }

  async function handleStart(mode: (typeof START_MODE_DEFINITIONS)[number]) {
    if (!hasStagedFiles || submittingMode) {
      toast.message("이미지, BGM, TXT 중 하나 이상을 먼저 올려주세요.");
      return;
    }

    setSubmittingMode(mode.mode);
    try {
      const briefText = briefFile ? await briefFile.text() : "";
      const project = await createProject({
        name: formatCreateProjectName(messages, mode.label),
        mode: mode.mode,
        briefText,
      });

      if (briefText) {
        await updateContent(project.id, { briefText });
      }

      for (const file of imageFiles) {
        await uploadAsset(project.id, file, { sourceType: "uploaded" });
      }

      if (bgmFile) {
        await uploadBgm(project.id, bgmFile);
      }

      const destination = getProjectStartDestination(mode.mode);
      handleClose();
      router.push(`/projects/${project.id}/${destination}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : messages.modeCard.createProjectFailed);
      setSubmittingMode(null);
    }
  }

  return (
    <div
      className="takdi-overlay-backdrop fixed inset-0 z-[75] flex items-start justify-center px-6 pt-16"
      onClick={handleClose}
    >
      <div
        className="takdi-overlay-panel w-full max-w-5xl rounded-[32px] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-medium ${WORKSPACE_TEXT.accent}`}>Direct upload hub</p>
            <h2 className={`mt-2 text-3xl font-semibold tracking-[-0.03em] ${WORKSPACE_TEXT.title}`}>직접 업로드</h2>
            <p className={`mt-2 text-sm ${WORKSPACE_TEXT.body}`}>
              파일을 먼저 고른 뒤, 어떤 작업으로 이어갈지 선택합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="takdi-overlay-chip rounded-full p-2 transition hover:bg-white/88 hover:text-[var(--takdi-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="takdi-overlay-card rounded-[28px] p-5">
            <h3 className={`text-sm font-semibold ${WORKSPACE_TEXT.title}`}>파일 스테이징</h3>
            <p className={`mt-1 text-xs leading-5 ${WORKSPACE_TEXT.body}`}>
              이미지, 배경음악, 기획 TXT를 먼저 준비해 두면 모드 선택 직후 프로젝트가 생성됩니다.
            </p>

            <div className="mt-4 space-y-3">
              <label className="takdi-overlay-card-soft flex cursor-pointer items-center justify-between rounded-[22px] border border-dashed px-4 py-4 transition hover:border-[var(--takdi-accent)] hover:bg-white/92">
                <div className="flex items-center gap-3">
                  <div className="takdi-overlay-icon flex h-10 w-10 items-center justify-center rounded-2xl">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${WORKSPACE_TEXT.title}`}>이미지 업로드</p>
                    <p className={`text-xs ${WORKSPACE_TEXT.body}`}>
                      {imageFiles.length > 0 ? `${imageFiles.length}개 선택됨` : "여러 장 선택 가능"}
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => setImageFiles(Array.from(event.target.files ?? []))}
                />
                <Upload className={`h-4 w-4 ${WORKSPACE_TEXT.muted}`} />
              </label>

              <label className="takdi-overlay-card-soft flex cursor-pointer items-center justify-between rounded-[22px] border border-dashed px-4 py-4 transition hover:border-[var(--takdi-accent)] hover:bg-white/92">
                <div className="flex items-center gap-3">
                  <div className="takdi-overlay-icon flex h-10 w-10 items-center justify-center rounded-2xl">
                    <Music className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${WORKSPACE_TEXT.title}`}>배경음악 업로드</p>
                    <p className={`text-xs ${WORKSPACE_TEXT.body}`}>
                      {bgmFile ? bgmFile.name : "MP3 또는 WAV 1개"}
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="audio/mpeg,audio/wav"
                  className="hidden"
                  onChange={(event) => setBgmFile(event.target.files?.[0] ?? null)}
                />
                <Upload className={`h-4 w-4 ${WORKSPACE_TEXT.muted}`} />
              </label>

              <label className="takdi-overlay-card-soft flex cursor-pointer items-center justify-between rounded-[22px] border border-dashed px-4 py-4 transition hover:border-[var(--takdi-accent)] hover:bg-white/92">
                <div className="flex items-center gap-3">
                  <div className="takdi-overlay-icon flex h-10 w-10 items-center justify-center rounded-2xl">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${WORKSPACE_TEXT.title}`}>기획 TXT 업로드</p>
                    <p className={`text-xs ${WORKSPACE_TEXT.body}`}>
                      {briefFile ? briefFile.name : "브리프가 있으면 함께 전달"}
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={(event) => setBriefFile(event.target.files?.[0] ?? null)}
                />
                <Upload className={`h-4 w-4 ${WORKSPACE_TEXT.muted}`} />
              </label>
            </div>

            <div className="takdi-overlay-card-soft mt-4 rounded-[22px] px-4 py-3">
              <p className={`text-xs uppercase tracking-[0.16em] ${WORKSPACE_TEXT.muted}`}>현재 준비됨</p>
              <p className={`mt-2 text-sm ${WORKSPACE_TEXT.title}`}>
                {stagedSummary || "아직 선택된 파일이 없습니다."}
              </p>
            </div>
          </section>

          <section className="takdi-overlay-card rounded-[28px] p-5">
            <h3 className={`text-sm font-semibold ${WORKSPACE_TEXT.title}`}>이 파일로 시작할 작업</h3>
            <p className={`mt-1 text-xs leading-5 ${WORKSPACE_TEXT.body}`}>
              대상 작업을 고르면 같은 파일 세트를 해당 프로젝트에 연결합니다.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {START_MODE_DEFINITIONS.map((mode) => {
                const loading = submittingMode === mode.mode;

                return (
                  <button
                    key={mode.mode}
                    type="button"
                    onClick={() => void handleStart(mode)}
                    disabled={Boolean(submittingMode)}
                    className="takdi-overlay-card-soft group rounded-[22px] p-4 text-left transition hover:-translate-y-0.5 hover:border-[rgb(236_197_183_/_0.9)] hover:bg-white/92 disabled:opacity-60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-[15px] font-semibold tracking-[-0.02em] ${WORKSPACE_TEXT.title}`}>
                          {mode.label}
                        </p>
                        <p className={`mt-1 text-xs leading-5 ${WORKSPACE_TEXT.body}`}>{mode.description}</p>
                      </div>
                      {loading ? <Loader2 className={`h-4 w-4 animate-spin ${WORKSPACE_TEXT.accent}`} /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
