/** Shortform preview artifact actions for thumbnail and marketing script generation. */
"use client";

import { useMemo, useState } from "react";
import { Copy, Download, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  type JobPollResponse,
  parseArtifactMetadata,
  pollGenerateMarketingScript,
  pollGenerateThumbnail,
  startGenerateMarketingScript,
  startGenerateThumbnail,
  type ExportArtifactRecord,
  type MarketingScriptArtifactPayload,
} from "@/lib/api-client";
import { WORKSPACE_CONTROL, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface ShortformArtifactPanelProps {
  projectId: string;
  templateKey: string;
  initialThumbnail: ExportArtifactRecord | null;
  initialMarketingScript: ExportArtifactRecord | null;
}

export function ShortformArtifactPanel({
  projectId,
  templateKey,
  initialThumbnail,
  initialMarketingScript,
}: ShortformArtifactPanelProps) {
  const [thumbnailArtifact, setThumbnailArtifact] = useState(initialThumbnail);
  const [marketingScriptArtifact, setMarketingScriptArtifact] = useState(initialMarketingScript);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  const scriptMetadata = useMemo(
    () => (marketingScriptArtifact ? parseArtifactMetadata<MarketingScriptArtifactPayload>(marketingScriptArtifact) : null),
    [marketingScriptArtifact],
  );

  async function pollJob(
    poll: () => Promise<JobPollResponse & { artifact?: ExportArtifactRecord }>,
  ) {
    for (let index = 0; index < 150; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await poll();
      if (result.job.status === "done") {
        return result.artifact ?? null;
      }
      if (result.job.status === "failed") {
        throw new Error(result.job.error ?? "아티팩트 생성에 실패했습니다.");
      }
    }

    throw new Error("아티팩트 생성 시간이 초과되었습니다.");
  }

  async function handleGenerateThumbnail() {
    setThumbnailLoading(true);
    try {
      const job = await startGenerateThumbnail(projectId, { templateKey });
      const artifact = await pollJob(() => pollGenerateThumbnail(projectId, job.jobId));
      setThumbnailArtifact(artifact);
      toast.success("썸네일을 생성했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "썸네일 생성 실패");
    } finally {
      setThumbnailLoading(false);
    }
  }

  async function handleGenerateScript() {
    setScriptLoading(true);
    try {
      const job = await startGenerateMarketingScript(projectId, { templateKey });
      const artifact = await pollJob(() => pollGenerateMarketingScript(projectId, job.jobId));
      setMarketingScriptArtifact(artifact);
      toast.success("마케팅 스크립트를 생성했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "마케팅 스크립트 생성 실패");
    } finally {
      setScriptLoading(false);
    }
  }

  const hashtags = scriptMetadata?.script.hashtags ?? [];

  return (
    <section className="takdi-panel-strong rounded-[1.9rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="takdi-kicker">Shortform assets</p>
          <p className={`mt-3 text-sm font-semibold ${WORKSPACE_TEXT.title}`}>숏폼 산출물</p>
          <p className={`mt-1 text-xs leading-5 ${WORKSPACE_TEXT.body}`}>
            현재 미리보기 비율을 기준으로 썸네일과 업로드용 스크립트를 생성합니다.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] ${WORKSPACE_CONTROL.pill}`}>
          {templateKey}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.6rem] border border-[rgb(232_219_206_/_0.9)] bg-[linear-gradient(160deg,rgba(252,250,247,0.96),rgba(255,255,255,0.76))] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(237_216_208_/_0.92)] bg-[rgb(250_236_231_/_0.96)] text-[var(--takdi-accent-strong)]">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${WORKSPACE_TEXT.title}`}>썸네일 생성</p>
                <p className={`text-xs ${WORKSPACE_TEXT.body}`}>1:1 대표 이미지 1장을 만듭니다.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleGenerateThumbnail()}
              disabled={thumbnailLoading}
              className="rounded-full bg-[var(--takdi-accent)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--takdi-accent-strong)] disabled:opacity-60"
            >
              {thumbnailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : thumbnailArtifact ? "다시 생성" : "생성"}
            </button>
          </div>

          {thumbnailArtifact ? (
            <div className="mt-4 space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailArtifact.filePath}
                alt="생성된 썸네일"
                className="aspect-square w-full rounded-[18px] border border-[rgb(214_199_184_/_0.82)] object-cover"
              />
              <a
                href={thumbnailArtifact.filePath}
                download
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${WORKSPACE_CONTROL.subtleButton}`}
              >
                <Download className="h-3.5 w-3.5" />
                썸네일 다운로드
              </a>
            </div>
          ) : (
            <p className={`mt-4 text-xs leading-5 ${WORKSPACE_TEXT.body}`}>
              아직 생성된 썸네일이 없습니다.
            </p>
          )}
        </div>

        <div className="rounded-[1.6rem] border border-[rgb(232_219_206_/_0.9)] bg-[linear-gradient(160deg,rgba(252,250,247,0.96),rgba(255,255,255,0.76))] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgb(237_216_208_/_0.92)] bg-[rgb(250_236_231_/_0.96)] text-[var(--takdi-accent-strong)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${WORKSPACE_TEXT.title}`}>마케팅 스크립트 생성</p>
                <p className={`text-xs ${WORKSPACE_TEXT.body}`}>후킹 문구와 본문, 해시태그를 만듭니다.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleGenerateScript()}
              disabled={scriptLoading}
              className="rounded-full bg-[var(--takdi-accent)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--takdi-accent-strong)] disabled:opacity-60"
            >
              {scriptLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : marketingScriptArtifact ? "다시 생성" : "생성"}
            </button>
          </div>

          {scriptMetadata ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-[18px] border border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.82)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--takdi-text-subtle)]">Hook</p>
                <p className="mt-2 text-sm font-medium text-[var(--takdi-text)]">{scriptMetadata.script.hook}</p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--takdi-text-subtle)]">Body</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--takdi-text-muted)]">{scriptMetadata.script.body}</p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--takdi-text-subtle)]">Hashtags</p>
                <p className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--takdi-text-muted)]">
                  {hashtags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[rgb(248_241_232_/_0.84)] px-2.5 py-1">
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
                      [scriptMetadata.script.hook, "", scriptMetadata.script.body, "", hashtags.join(" ")].join("\n"),
                    );
                    toast.success("스크립트를 클립보드에 복사했습니다.");
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${WORKSPACE_CONTROL.subtleButton}`}
                >
                  <Copy className="h-3.5 w-3.5" />
                  스크립트 복사
                </button>
                <a
                  href={marketingScriptArtifact?.filePath ?? "#"}
                  download
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${WORKSPACE_CONTROL.subtleButton}`}
                >
                  <Download className="h-3.5 w-3.5" />
                  TXT 다운로드
                </a>
              </div>
            </div>
          ) : (
            <p className={`mt-4 text-xs leading-5 ${WORKSPACE_TEXT.body}`}>
              아직 생성된 마케팅 스크립트가 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
