/** 블록 → 이미지 내보내기 유틸 (html2canvas-pro 기반 클라이언트 사이드 캡처) */

export type ExportFormat = "png" | "jpg";
export type ExportMode = "single" | "split" | "card-news";

export interface CaptureOptions {
  width?: number;
  format?: ExportFormat;
  quality?: number;
  scale?: number;
}

/**
 * DOM 요소를 이미지 Blob으로 캡처한다.
 * html2canvas-pro는 내보내기 시에만 lazy import하여 초기 번들에서 제외.
 */
export async function captureBlocksAsImage(
  element: HTMLElement,
  opts: CaptureOptions = {},
): Promise<Blob> {
  const { format = "png", quality = 0.92, scale = 2 } = opts;

  const { default: html2canvas } = await import("html2canvas-pro");
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: opts.width,
    logging: false,
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("이미지를 만들 수 없습니다. 다시 시도해주세요"));
      },
      format === "jpg" ? "image/jpeg" : "image/png",
      quality,
    );
  });
}

/**
 * Blob을 브라우저 다운로드로 내보낸다.
 */
export function exportToDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 블록별 개별 이미지 캡처 → ZIP 파일로 묶어 반환.
 * 각 블록 요소를 순서대로 캡처하여 001.png, 002.png, ... 형식으로 저장.
 */
export async function captureBlocksAsSplitImages(
  blockElements: HTMLElement[],
  opts: CaptureOptions = {},
): Promise<Blob> {
  const { format = "png", quality = 0.92, scale = 2 } = opts;
  const { default: JSZip } = await import("jszip");
  const { default: html2canvas } = await import("html2canvas-pro");

  const zip = new JSZip();
  const ext = format === "jpg" ? "jpg" : "png";
  const mimeType = format === "jpg" ? "image/jpeg" : "image/png";

  for (let i = 0; i < blockElements.length; i++) {
    const el = blockElements[i];
    const canvas = await html2canvas(el, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: opts.width,
      logging: false,
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("캡처 실패"))),
        mimeType,
        quality,
      );
    });

    const num = String(i + 1).padStart(3, "0");
    zip.file(`${num}.${ext}`, blob);
  }

  return zip.generateAsync({ type: "blob" });
}

/**
 * 기본 파일명 생성: {프로젝트명}_{플랫폼}_{YYYYMMDD}
 */
export function buildDefaultFilename(
  projectName: string,
  platform: string,
  format: ExportFormat,
): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const safeName = projectName.replace(/[/\\?%*:|"<>]/g, "_").trim() || "export";
  return `${safeName}_${platform}_${date}.${format}`;
}
