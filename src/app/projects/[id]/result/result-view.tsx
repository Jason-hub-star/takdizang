/** Result screen for compose exports with preview and image download. */
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BlockPreview } from "@/components/compose/block-preview";
import { ComposeProvider } from "@/components/compose/compose-context";
import { buildDefaultFilename, captureBlocksAsImage, exportToDownload } from "@/lib/block-export";
import { WORKSPACE_TEXT } from "@/lib/workspace-surface";
import type { BlockDocument } from "@/types/blocks";

interface ResultViewProps {
  projectId: string;
  projectName: string;
  doc: BlockDocument;
  mobilePreview?: boolean;
}

export function ResultView({
  projectId,
  projectName,
  doc,
  mobilePreview,
}: ResultViewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const previewWidth = mobilePreview ? 375 : doc.platform.width;

  const handleDownload = async () => {
    if (!previewRef.current) {
      return;
    }

    setDownloading(true);
    try {
      const blob = await captureBlocksAsImage(previewRef.current, {
        width: previewWidth,
        format: "jpg",
        scale: 2,
      });
      const filename = buildDefaultFilename(projectName, doc.platform.name || "export", "jpg");
      exportToDownload(blob, filename);
      toast.success("이미지 다운로드 완료");
    } catch (error) {
      toast.error(`다운로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ComposeProvider projectId={projectId} theme={doc.theme}>
      <div className="takdi-shell min-h-screen px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">
          <header className="takdi-page-intro flex flex-col gap-5 px-6 py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div>
              <p className="takdi-kicker">Compose result</p>
              <h1 className="takdi-display mt-4 max-w-[11ch]">{projectName}</h1>
              <p className="takdi-lead mt-5">
                상세페이지 결과물을 실제 출력 폭으로 검토하고, 바로 이미지로 내려받거나 편집 화면으로 복귀할 수 있습니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[rgb(214_199_184_/_0.82)] bg-[rgb(248_241_232_/_0.84)] px-3 py-1 text-[11px] text-[var(--takdi-text-subtle)]">
                {doc.platform.name} ({previewWidth}px 너비)
              </span>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--takdi-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--takdi-accent-strong)] disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                이미지 다운로드
              </button>
              <Link
                href={`/projects/${projectId}/compose`}
                className="inline-flex items-center gap-2 rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-4 py-2 text-sm font-medium text-[var(--takdi-text)] transition hover:bg-[rgb(248_241_232_/_0.88)]"
              >
                <Edit className="h-4 w-4" />
                편집
              </Link>
              <Link
                href={`/projects/${projectId}/compose`}
                className="inline-flex items-center gap-2 rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-4 py-2 text-sm font-medium text-[var(--takdi-text-muted)] transition hover:bg-[rgb(248_241_232_/_0.88)]"
              >
                <ArrowLeft className="h-4 w-4" />
                편집으로 돌아가기
              </Link>
            </div>
          </header>

          <section className="takdi-panel-strong rounded-[1.9rem] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="takdi-kicker">Rendered page</p>
                <p className={`mt-2 text-sm ${WORKSPACE_TEXT.body}`}>모바일 미리보기 여부에 따라 실제 검토 폭이 달라집니다.</p>
              </div>
              {mobilePreview ? (
                <span className="rounded-full border border-[rgb(236_197_183_/_0.9)] bg-[rgb(248_231_226_/_0.92)] px-3 py-1 text-[11px] text-[var(--takdi-accent-strong)]">
                  Mobile preview
                </span>
              ) : null}
            </div>

            <BlockPreview
              ref={previewRef}
              blocks={doc.blocks}
              platformWidth={doc.platform.width}
              theme={doc.theme}
              mobilePreview={mobilePreview}
            />
          </section>
        </div>
      </div>
    </ComposeProvider>
  );
}
