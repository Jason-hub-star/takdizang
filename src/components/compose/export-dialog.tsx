/** 내보내기 다이얼로그 — 단일/분할 이미지 + HTML 내보내기 */
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Download, Loader2, FileArchive, Image, Code, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExportFormat, ExportMode } from "@/lib/block-export";
import { buildDefaultFilename, captureBlocksAsImage, captureBlocksAsSplitImages, exportToDownload } from "@/lib/block-export";
import { blocksToHtml } from "@/services/html-exporter";
import { toast } from "sonner";
import type { Block } from "@/types/blocks";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  platformName: string;
  captureRef: React.RefObject<HTMLElement | null>;
  platformWidth: number;
  blocks?: Block[];
}

export function ExportDialog({
  open,
  onClose,
  projectName,
  platformName,
  captureRef,
  platformWidth,
  blocks,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("jpg");
  const [mode, setMode] = useState<ExportMode>("single");
  const [htmlMode, setHtmlMode] = useState(false);
  const [filename, setFilename] = useState("");
  const [exporting, setExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 다이얼로그 열릴 때 기본 파일명 세팅
  useEffect(() => {
    if (open) {
      setFilename(buildDefaultFilename(projectName, platformName, format).replace(/\.\w+$/, ""));
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [open, projectName, platformName, format]);

  if (!open) return null;

  const handleExport = async () => {
    if (htmlMode) {
      handleHtmlExport();
      return;
    }

    if (!captureRef.current) {
      toast.error("미리보기를 로드할 수 없습니다. 페이지를 새로고침해주세요");
      return;
    }

    setExporting(true);
    try {
      if (mode === "split" || mode === "card-news") {
        // Split/card-news: capture each visible block element individually
        const container = captureRef.current;
        const blockEls = Array.from(
          container.querySelectorAll<HTMLElement>("[data-block-id]"),
        ).filter((el) => !el.closest("[data-hidden]"));

        if (blockEls.length === 0) {
          toast.error("내보낼 블록이 없습니다");
          return;
        }

        const captureWidth = mode === "card-news" ? 1080 : platformWidth;
        const zipBlob = await captureBlocksAsSplitImages(blockEls, {
          width: captureWidth,
          format,
          scale: 2,
        });
        const label = mode === "card-news" ? "카드뉴스" : "분할 이미지";
        exportToDownload(zipBlob, `${filename}.zip`);
        toast.success(`${label} ${blockEls.length}장 ZIP 다운로드 완료`);
      } else {
        const blob = await captureBlocksAsImage(captureRef.current, {
          width: platformWidth,
          format,
          scale: 2,
        });
        exportToDownload(blob, `${filename}.${format}`);
        toast.success("이미지 다운로드 완료");
      }
      onClose();
    } catch (err) {
      toast.error(`내보내기 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
    } finally {
      setExporting(false);
    }
  };

  const handleHtmlExport = () => {
    if (!blocks || blocks.length === 0) {
      toast.error("내보낼 블록이 없습니다");
      return;
    }
    const html = blocksToHtml(blocks, platformWidth);
    navigator.clipboard.writeText(html).then(
      () => toast.success("HTML 코드가 클립보드에 복사되었습니다"),
      () => {
        // Fallback: download as file
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        exportToDownload(blob, `${filename}.html`);
        toast.success("HTML 파일 다운로드 완료");
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#201A17]/35 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-96 rounded-[28px] p-6 ${WORKSPACE_SURFACE.panelStrong}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-sm font-semibold ${WORKSPACE_TEXT.title}`}>내보내기</h2>
          <button onClick={onClose} className={`${WORKSPACE_TEXT.muted} hover:text-[#4D433D]`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 내보내기 모드 */}
        <label className={`mb-1 block text-xs ${WORKSPACE_TEXT.body}`}>내보내기 방식</label>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setMode("single"); setHtmlMode(false); }}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition ${
              mode === "single" && !htmlMode
                ? WORKSPACE_CONTROL.accentTint
                : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
            }`}
          >
            <Image className="h-3.5 w-3.5" />
            단일 이미지
          </button>
          <button
            onClick={() => { setMode("split"); setHtmlMode(false); }}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition ${
              mode === "split" && !htmlMode
                ? WORKSPACE_CONTROL.accentTint
                : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
            }`}
          >
            <FileArchive className="h-3.5 w-3.5" />
            분할 (ZIP)
          </button>
          <button
            onClick={() => { setMode("card-news"); setHtmlMode(false); }}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition ${
              mode === "card-news" && !htmlMode
                ? WORKSPACE_CONTROL.accentTint
                : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            카드뉴스
          </button>
          <button
            onClick={() => setHtmlMode(true)}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium transition ${
              htmlMode
                ? WORKSPACE_CONTROL.accentTint
                : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            HTML
          </button>
        </div>

        {/* 파일명 */}
        <label className={`mb-1 block text-xs ${WORKSPACE_TEXT.body}`}>파일명</label>
        <div className="mb-4 flex items-center gap-1">
          <input
            ref={inputRef}
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className={`flex-1 rounded-2xl px-3 py-2 text-sm ${WORKSPACE_CONTROL.input}`}
          />
          <span className={`text-sm ${WORKSPACE_TEXT.muted}`}>
            .{htmlMode ? "html" : (mode === "split" || mode === "card-news") ? "zip" : format}
          </span>
        </div>

        {/* 포맷 선택 (이미지 모드만) */}
        {!htmlMode && (
          <>
            <label className={`mb-1 block text-xs ${WORKSPACE_TEXT.body}`}>포맷</label>
            <div className="mb-6 flex gap-2">
              {(["png", "jpg"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded border px-3 py-1.5 text-xs font-medium transition ${
                    format === f
                      ? WORKSPACE_CONTROL.accentTint
                      : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </>
        )}

        {htmlMode && (
          <p className={`mb-6 text-xs ${WORKSPACE_TEXT.muted}`}>
            인라인 스타일 HTML로 변환합니다. 쿠팡/네이버 상세페이지에 바로 붙여넣기 가능합니다.
          </p>
        )}

        {mode === "card-news" && !htmlMode && (
          <p className={`mb-6 text-xs ${WORKSPACE_TEXT.muted}`}>
            각 블록을 1080×1080 정방형 슬라이드로 변환합니다. 인스타그램/SNS 카드뉴스에 적합합니다.
          </p>
        )}

        {/* 내보내기 버튼 */}
        <Button
          onClick={handleExport}
          disabled={exporting || !filename.trim()}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl ${WORKSPACE_CONTROL.accentButton}`}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting
            ? "내보내는 중..."
            : htmlMode
              ? "HTML 복사"
              : mode === "split" || mode === "card-news"
                ? "ZIP 다운로드"
                : "이미지 다운로드"}
        </Button>
      </div>
    </div>
  );
}
