import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getShortformStateFromContent, parseEditorGraph } from "@/lib/shortform-state";
import Loading from "./loading";

const NodeEditorShell = dynamic(
  () => import("@/components/editor/node-editor-shell").then((module) => module.NodeEditorShell),
  { loading: () => <Loading /> },
);

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
    title: project ? `${project.name} | Pipeline Editor | Takdi Studio` : "Pipeline Editor | Takdi Studio",
    description: "Edit the Takdi Studio automation pipeline for this project.",
  };
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, mode: true, briefText: true, content: true },
  });

  if (!project) {
    notFound();
  }

  const initialGraph = parseEditorGraph(project.content);
  const initialShortformState = getShortformStateFromContent(project.content);

  return (
    <NodeEditorShell
      projectId={project.id}
      projectName={project.name}
      mode={project.mode ?? "freeform"}
      initialBriefText={project.briefText ?? ""}
      initialGraph={initialGraph}
      initialShortformState={initialShortformState}
    />
  );
}
