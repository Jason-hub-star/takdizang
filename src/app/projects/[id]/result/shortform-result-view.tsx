/** Shortform result view for media artifacts and generated upload assets. */
"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Download, ExternalLink, Film, ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { parseArtifactMetadata, type ExportArtifactRecord, type MarketingScriptArtifactPayload } from "@/lib/api-client";

interface ShortformResultViewProps {
  projectId: string;
  projectName: string;
  artifacts: ExportArtifactRecord[];
}

export function ShortformResultView({
  projectId,
  projectName,
  artifacts,
}: ShortformResultViewProps) {
  const videoArtifacts = artifacts.filter((artifact) => artifact.type === "video" || artifact.type === "gif");
  const thumbnailArtifact = artifacts.find((artifact) => artifact.type === "thumbnail") ?? null;
  const marketingScriptArtifact = artifacts.find((artifact) => artifact.type === "marketing-script") ?? null;
  const scriptMetadata = marketingScriptArtifact
    ? parseArtifactMetadata<MarketingScriptArtifactPayload>(marketingScriptArtifact)
    : null;

  return (
    <div className="takdi-shell min-h-screen px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <section className="takdi-page-intro flex flex-col gap-5 px-6 py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="takdi-kicker">Shortform result</p>
            <h1 className="takdi-display mt-4 max-w-[11ch]">{projectName}</h1>
            <p className="takdi-lead mt-5">
              비율별 렌더 결과, 썸네일, 업로드용 마케팅 스크립트를 한 화면에서 검토하고 바로 다운로드할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/projects/${projectId}/preview`}
              className="inline-flex items-center gap-2 rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-4 py-2 text-sm font-medium text-[var(--takdi-text)] transition hover:bg-[rgb(248_241_232_/_0.88)]"
            >
              <ArrowLeft className="h-4 w-4" />
              미리보기로 돌아가기
            </Link>
          </div>
        </section>

        <section className="takdi-panel-strong rounded-[1.9rem] p-6">
          <p className="takdi-kicker">Media outputs</p>
          <h2 className="mt-3 text-lg font-semibold text-[var(--takdi-text)]">미디어 결과</h2>
          <p className="mt-2 text-sm text-[var(--takdi-text-muted)]">렌더 또는 생성이 완료된 산출물만 이 화면에 표시합니다.</p>

          {videoArtifacts.length > 0 ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {videoArtifacts.map((artifact) => (
                <div key={artifact.id} className="rounded-[1.6rem] border border-[rgb(232_219_206_/_0.9)] bg-[linear-gradient(160deg,rgba(252,250,247,0.96),rgba(255,255,255,0.76))] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(237_216_208_/_0.92)] bg-[rgb(250_236_231_/_0.96)] text-[var(--takdi-accent-strong)]">
                        <Film className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--takdi-text)]">
                          {artifact.type === "gif" ? "GIF 결과" : "영상 결과"}
                        </p>
                        <p className="text-xs text-[var(--takdi-text-muted)]">{new Date(artifact.createdAt).toLocaleString("ko-KR")}</p>
                      </div>
                    </div>
                    <a
                      href={artifact.filePath}
                      className="inline-flex items-center gap-1 rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-3 py-1.5 text-xs font-medium text-[var(--takdi-text)] transition hover:bg-[rgb(248_241_232_/_0.88)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      열기
                    </a>
                  </div>
                  <p className="mt-4 break-all text-xs leading-5 text-[var(--takdi-text-muted)]">{artifact.filePath}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-[var(--takdi-text-muted)]">아직 저장된 영상/GIF 결과가 없습니다.</p>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="takdi-panel-strong rounded-[1.9rem] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(237_216_208_/_0.92)] bg-[rgb(250_236_231_/_0.96)] text-[var(--takdi-accent-strong)]">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--takdi-text)]">썸네일</h2>
                <p className="text-xs text-[var(--takdi-text-muted)]">preview에서 생성한 최신 썸네일</p>
              </div>
            </div>

            {thumbnailArtifact ? (
              <div className="mt-5 space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailArtifact.filePath}
                  alt="생성된 썸네일"
                  className="aspect-square w-full rounded-[22px] border border-[rgb(214_199_184_/_0.82)] object-cover"
                />
                <a
                  href={thumbnailArtifact.filePath}
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-3 py-2 text-xs font-medium text-[var(--takdi-text)] transition hover:bg-[rgb(248_241_232_/_0.88)]"
                >
                  <Download className="h-3.5 w-3.5" />
                  썸네일 다운로드
                </a>
              </div>
            ) : (
              <p className="mt-5 text-sm text-[var(--takdi-text-muted)]">아직 생성된 썸네일이 없습니다.</p>
            )}
          </div>

          <div className="takdi-panel-strong rounded-[1.9rem] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(237_216_208_/_0.92)] bg-[rgb(250_236_231_/_0.96)] text-[var(--takdi-accent-strong)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--takdi-text)]">마케팅 스크립트</h2>
                <p className="text-xs text-[var(--takdi-text-muted)]">preview에서 생성한 최신 업로드 문구</p>
              </div>
            </div>

            {scriptMetadata ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] border border-[rgb(214_199_184_/_0.82)] bg-[linear-gradient(160deg,rgba(252,250,247,0.96),rgba(255,255,255,0.76))] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--takdi-text-subtle)]">Hook</p>
                  <p className="mt-2 text-sm font-medium text-[var(--takdi-text)]">{scriptMetadata.script.hook}</p>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--takdi-text-subtle)]">Body</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--takdi-text-muted)]">{scriptMetadata.script.body}</p>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--takdi-text-subtle)]">Hashtags</p>
                  <p className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--takdi-text-muted)]">
                    {scriptMetadata.script.hashtags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[rgb(255_255_255_/_0.82)] px-2.5 py-1">
                        {tag}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        [
                          scriptMetadata.script.hook,
                          "",
                          scriptMetadata.script.body,
                          "",
                          scriptMetadata.script.hashtags.join(" "),
                        ].join("\n"),
                      );
                      toast.success("스크립트를 복사했습니다.");
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-3 py-2 text-xs font-medium text-[var(--takdi-text)] transition hover:bg-[rgb(248_241_232_/_0.88)]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    복사
                  </button>
                  <a
                    href={marketingScriptArtifact?.filePath ?? "#"}
                    download
                    className="inline-flex items-center gap-2 rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.82)] px-3 py-2 text-xs font-medium text-[var(--takdi-text)] transition hover:bg-[rgb(248_241_232_/_0.88)]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    TXT 다운로드
                  </a>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-[var(--takdi-text-muted)]">아직 생성된 마케팅 스크립트가 없습니다.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
