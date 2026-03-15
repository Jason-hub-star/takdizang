import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PreviewShell } from "@/components/preview/preview-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { listProjectArtifacts, resolveProjectSections, resolveShortformInputProps } from "@/lib/project-media";
import { prisma } from "@/lib/prisma";
import { TEMPLATE_TO_COMPOSITION } from "@/components/preview/remotion-preview-config";
import type { ExportArtifactRecord } from "@/lib/api-client";
import type { ExportArtifactType } from "@/types";

function toClientArtifact(artifact: {
  id: string;
  type: string;
  filePath: string;
  metadata: string | null;
  createdAt: Date;
}): ExportArtifactRecord {
  return {
    ...artifact,
    type: artifact.type as ExportArtifactType,
    createdAt: artifact.createdAt.toISOString(),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });

  return {
    title: project ? `${project.name} | Preview | Takdi Studio` : "Preview | Takdi Studio",
    description: "Preview Remotion output for this Takdi Studio project.",
  };
}

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ templateKey?: string }>;
}) {
  const { id } = await params;
  const { templateKey: rawTemplateKey } = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, content: true, status: true, mode: true, briefText: true },
  });

  if (!project) {
    notFound();
  }

  if (project.status !== "generated" && project.status !== "exported") {
    return (
      <main className="takdi-shell min-h-screen px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="takdi-page-intro px-6 py-8 lg:px-8">
            <p className="takdi-kicker">Preview unavailable</p>
            <h1 className="takdi-display mt-4 max-w-[10ch]">생성이 완료된 뒤에 미리보기를 열 수 있습니다.</h1>
            <p className="takdi-lead mt-5">
              현재 프로젝트는 아직 결과물을 재생 가능한 상태가 아닙니다. 생성 흐름을 마친 뒤 다시 들어오면
              Remotion 플레이어와 숏폼 산출물 패널이 활성화됩니다.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StatusBadge status={project.status} />
              <Link href="/">
                <Button variant="outline" className="rounded-full border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.78)] text-[var(--takdi-text)] shadow-none hover:bg-[rgb(248_241_232_/_0.86)]">
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const templateKey =
    rawTemplateKey === "1:1" || rawTemplateKey === "16:9" ? rawTemplateKey : "9:16";

  const [resolvedSections, inputProps, artifacts] = await Promise.all([
    resolveProjectSections(project.id, project.content),
    resolveShortformInputProps(project.id, project.name, project.content, templateKey),
    listProjectArtifacts(project.id, ["thumbnail", "marketing-script"]),
  ]);

  const compositionId = TEMPLATE_TO_COMPOSITION[templateKey] ?? "TakdiVideo_916";
  const selectedImages = inputProps.selectedImages;
  const thumbnailArtifact = artifacts.find((artifact) => artifact.type === "thumbnail");
  const marketingScriptArtifact = artifacts.find((artifact) => artifact.type === "marketing-script");

  return (
    <main className="takdi-shell min-h-screen px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <section className="takdi-page-intro flex flex-col gap-5 px-6 py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="takdi-kicker">Preview studio</p>
            <h1 className="takdi-display mt-4 max-w-[11ch]">{project.name}</h1>
            <p className="takdi-lead mt-5">
              장면 수, 이미지 연결 상태, 비율별 플레이어를 한 자리에서 확인하고 바로 썸네일과 업로드 스크립트까지
              이어서 만듭니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            <Link href={`/projects/${project.id}/editor`}>
              <Button variant="outline" className="rounded-full border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.78)] text-[var(--takdi-text)] shadow-none hover:bg-[rgb(248_241_232_/_0.86)]">
                편집기로 이동
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-full border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.78)] text-[var(--takdi-text)] shadow-none hover:bg-[rgb(248_241_232_/_0.86)]">
                홈
              </Button>
            </Link>
          </div>
        </section>

        <PreviewShell
          projectId={project.id}
          initialCompositionId={compositionId}
          inputProps={inputProps}
          projectName={project.name}
          projectMode={project.mode}
          projectStatus={project.status}
          sectionCount={resolvedSections.sections.length}
          imageCount={selectedImages.length}
          posterSrc={selectedImages[0]}
          initialThumbnail={thumbnailArtifact ? toClientArtifact(thumbnailArtifact) : null}
          initialMarketingScript={marketingScriptArtifact ? toClientArtifact(marketingScriptArtifact) : null}
        />
      </div>
    </main>
  );
}
