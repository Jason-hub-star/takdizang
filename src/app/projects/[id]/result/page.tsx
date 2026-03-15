import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { BlockDocument } from "@/types/blocks";
import { listProjectArtifacts } from "@/lib/project-media";
import type { ExportArtifactRecord } from "@/lib/api-client";
import type { ExportArtifactType } from "@/types";
import { ResultView } from "./result-view";
import { ShortformResultView } from "./shortform-result-view";

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
    title: project ? `${project.name} | Result | Takdi Studio` : "Result | Takdi Studio",
    description: "Review the exported block result for this Takdi Studio project.",
  };
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ mobile?: string | string[] }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const mobilePreview = resolvedSearchParams?.mobile === "1";

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, content: true, mode: true },
  });

  if (!project) {
    notFound();
  }

  if (project.mode === "compose") {
    let doc: BlockDocument | null = null;
    if (project.content) {
      try {
        const parsed = JSON.parse(project.content);
        if (parsed.format === "blocks") {
          doc = parsed as BlockDocument;
        }
      } catch {
        // ignore invalid content
      }
    }

    if (!doc) {
      return (
        <div className="takdi-shell flex min-h-screen items-center justify-center px-6 py-10">
          <div className="takdi-page-intro max-w-2xl px-6 py-8 text-center lg:px-8">
            <p className="takdi-kicker">Result unavailable</p>
            <h1 className="takdi-display mt-4">상세페이지 문서를 찾지 못했습니다.</h1>
            <p className="takdi-lead mx-auto mt-5">
              아직 블록 문서가 저장되지 않았거나 프로젝트 데이터가 비어 있습니다. 편집 화면에서 저장한 뒤 다시
              결과 화면을 열어주세요.
            </p>
          </div>
        </div>
      );
    }

    return (
      <ResultView
        projectId={project.id}
        projectName={project.name}
        doc={doc}
        mobilePreview={mobilePreview}
      />
    );
  }

  const artifacts = await listProjectArtifacts(project.id, ["video", "gif", "thumbnail", "marketing-script"]);
  return (
    <ShortformResultView
      projectId={project.id}
      projectName={project.name}
      artifacts={artifacts.map(toClientArtifact)}
    />
  );
}
