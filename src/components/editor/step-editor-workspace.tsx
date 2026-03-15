"use client";

import { CheckCircle2, ChevronRight, Film, Music4, Sparkles } from "lucide-react";
import type { Node } from "@xyflow/react";
import { AppImage } from "@/components/ui/app-image";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSimpleModeSteps, getUserFacingNodeStatus } from "@/lib/editor-surface";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import type { NodeData } from "./node-canvas";
import type { ShortformProjectState } from "@/types";

interface StepEditorWorkspaceProps {
  mode: string;
  nodes: Node[];
  selectedNodeId: string | null;
  onSelectStep: (nodeId: string) => void;
  shortformState?: ShortformProjectState | null;
}

interface ResolvedStep {
  nodeId: string;
  nodeData: NodeData;
  statusInfo: ReturnType<typeof getUserFacingNodeStatus>;
  title: string;
  description: string;
  helpItems?: string[];
}

interface ShortformGroup {
  key: "required" | "editing" | "output";
  title: string;
  description: string;
  badge: string;
  accent: string;
  icon: typeof Sparkles;
  steps: ResolvedStep[];
  summary: string;
}

function getShortformSummary(
  key: ShortformGroup["key"],
  shortformState: ShortformProjectState | null | undefined,
  steps: ResolvedStep[],
) {
  if (key === "required") {
    const sectionCount = shortformState?.sections.length ?? 0;
    const assignedCount = shortformState?.sceneAssignments.length ?? 0;
    const referenceCount = shortformState?.referenceAssetIds.length ?? 0;
    const completed = steps.filter((step) => step.nodeData.status === "generated").length;
    return `${completed}/${Math.max(steps.length, 1)} 완료 · 장면 ${assignedCount}/${sectionCount} 연결 · 레퍼런스 ${referenceCount}/3`;
  }

  if (key === "editing") {
    const enabledCuts = shortformState?.cuts.filter((cut) => cut.enabled).length ?? 0;
    const hasBgm = shortformState?.bgm ? 1 : 0;
    return `선택 편집 · BGM ${hasBgm ? "준비됨" : "없음"} · 활성 장면 ${enabledCuts}개`;
  }

  const rendered = shortformState?.renderPresets.filter((preset) => preset.artifactId).length ?? 0;
  return `${rendered}/3 렌더 저장 · 결과 화면으로 이어집니다`;
}

function getGroupPreview(step: ResolvedStep[]) {
  return step
    .flatMap((item) => item.nodeData.previewImages ?? [])
    .find((value): value is string => typeof value === "string" && value.length > 0);
}

function pickGroupStep(group: ShortformGroup) {
  return (
    group.steps.find((step) => step.nodeData.status !== "generated")?.nodeId ??
    group.steps[0]?.nodeId ??
    null
  );
}

function ShortformWizard({
  selectedNodeId,
  onSelectStep,
  shortformState,
  groups,
}: {
  selectedNodeId: string | null;
  onSelectStep: (nodeId: string) => void;
  shortformState?: ShortformProjectState | null;
  groups: ShortformGroup[];
}) {
  const selectedGroupKey =
    groups.find((group) => group.steps.some((step) => step.nodeId === selectedNodeId))?.key ?? "required";

  return (
    <>
      <div className="max-w-3xl">
        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${WORKSPACE_TEXT.accent}`}>간단 모드</p>
        <h1 className={`mt-2 text-2xl font-semibold ${WORKSPACE_TEXT.title}`}>
          필수 2단계만 끝내면 프리뷰를 볼 수 있습니다.
        </h1>
        <p className={`mt-2 text-[13px] leading-5 ${WORKSPACE_TEXT.body}`}>
          AI 생성이 없어도 장면 이미지를 직접 연결해 진행할 수 있습니다. BGM과 장면 편집은 후속 편집이고,
          레퍼런스 이미지는 장면 준비 단계에서 선택적으로 추가합니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className={`rounded-full px-3 py-1 ${WORKSPACE_CONTROL.pill}`}>필수: 기획 정리, 장면 준비</span>
          <span className={`rounded-full px-3 py-1 ${WORKSPACE_CONTROL.pill}`}>선택: BGM, 장면 편집</span>
          <span className={`rounded-full px-3 py-1 ${WORKSPACE_CONTROL.pill}`}>출력: 렌더, 저장</span>
          <span className={`rounded-full px-3 py-1 ${WORKSPACE_CONTROL.pill}`}>
            생성 모드: {shortformState?.generationMode === "ai" ? "AI" : "데모"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {groups.map((group) => {
          const Icon = group.icon;
          const isSelected = selectedGroupKey === group.key;
          const previewImage = getGroupPreview(group.steps);

          return (
            <section
              key={group.key}
              className={`rounded-[28px] border p-5 transition ${
                isSelected
                  ? "border-[rgb(241_200_190_/_0.95)] bg-[linear-gradient(160deg,rgba(255,248,244,0.96),rgba(255,255,255,0.8))] shadow-[0_18px_42px_rgba(217,124,103,0.14)]"
                  : WORKSPACE_SURFACE.floating
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  const nextNodeId = pickGroupStep(group);
                  if (nextNodeId) {
                    onSelectStep(nextNodeId);
                  }
                }}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${group.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--takdi-text-subtle)]">{group.badge}</p>
                      <h2 className={`mt-2 text-lg font-semibold ${WORKSPACE_TEXT.title}`}>{group.title}</h2>
                    </div>
                  </div>
                  <ChevronRight className={`mt-1 h-4 w-4 ${WORKSPACE_TEXT.muted}`} />
                </div>

                <p className={`mt-3 text-sm leading-6 ${WORKSPACE_TEXT.body}`}>{group.description}</p>
                <p className={`mt-3 text-xs ${WORKSPACE_TEXT.muted}`}>{group.summary}</p>
              </button>

              {previewImage ? (
                <AppImage
                  src={previewImage}
                  alt={group.title}
                  width={320}
                  height={180}
                  className="mt-4 h-32 w-full rounded-[22px] border border-[rgb(241_232_222_/_0.92)] object-cover shadow-[0_12px_28px_rgba(55,40,30,0.08)]"
                />
              ) : null}

              <div className="mt-4 space-y-2">
                {group.steps.map((step, index) => {
                  const stepSelected = selectedNodeId === step.nodeId;
                  return (
                    <button
                      key={step.nodeId}
                      type="button"
                      onClick={() => onSelectStep(step.nodeId)}
                      className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                        stepSelected
                          ? "border-[rgb(236_197_183_/_0.95)] bg-[rgb(248_231_226_/_0.95)] shadow-[0_12px_24px_rgba(217,124,103,0.12)]"
                          : `${WORKSPACE_SURFACE.softInset} hover:border-[rgb(215_201_188_/_0.94)]`
                      }`}
                    >
                      <div className="min-w-0">
                        <div className={`flex items-center gap-2 text-[11px] font-medium ${WORKSPACE_TEXT.muted}`}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <span>{step.title}</span>
                        </div>
                        <p className={`mt-1 line-clamp-2 text-[13px] leading-5 ${WORKSPACE_TEXT.body}`}>{step.description}</p>
                        {stepSelected ? (
                          <div className="mt-2 space-y-1.5">
                            {step.helpItems?.slice(0, 2).map((item) => (
                              <div key={item} className={`flex items-start gap-2 text-[11px] leading-4 ${WORKSPACE_TEXT.body}`}>
                                <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${WORKSPACE_TEXT.accent}`} />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <StatusBadge
                        status={step.nodeData.status ?? "draft"}
                        label={step.statusInfo.label}
                        tone={step.statusInfo.tone}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export function StepEditorWorkspace({
  mode,
  nodes,
  selectedNodeId,
  onSelectStep,
  shortformState,
}: StepEditorWorkspaceProps) {
  const steps = getSimpleModeSteps(mode)
    .map((step) => {
      const node = nodes.find((candidate) => (candidate.data as NodeData).nodeType === step.nodeType);
      if (!node) return null;
      const nodeData = node.data as NodeData;
      return {
        nodeId: node.id,
        nodeData,
        statusInfo: getUserFacingNodeStatus(nodeData),
        title: step.title,
        description: step.description,
        helpItems: step.helpItems,
      } as ResolvedStep;
    })
    .filter((step): step is ResolvedStep => Boolean(step));

  if (mode === "shortform-video") {
    const requiredSteps = steps.filter((step) => step.nodeData.nodeType === "prompt" || step.nodeData.nodeType === "generate-images");
    const editingSteps = steps.filter((step) => step.nodeData.nodeType === "bgm" || step.nodeData.nodeType === "cuts");
    const outputSteps = steps.filter((step) => step.nodeData.nodeType === "render" || step.nodeData.nodeType === "export");

    const groups: ShortformGroup[] = [
      {
        key: "required",
        title: "기획 및 장면 준비",
        description: "브리프를 정리하고 장면 이미지 자동 생성 또는 직접 연결을 완료합니다.",
        badge: "필수",
        accent: "border border-[rgb(236_197_183_/_0.95)] bg-[rgb(248_231_226_/_0.95)] text-[var(--takdi-accent-strong)] shadow-[0_12px_24px_rgba(217,124,103,0.12)]",
        icon: Sparkles,
        steps: requiredSteps,
        summary: getShortformSummary("required", shortformState, requiredSteps),
      },
      {
        key: "editing",
        title: "편집 보강",
        description: "BGM을 준비하고 장면 순서와 길이를 조정해 프리뷰를 다듬습니다.",
        badge: "선택",
        accent: "border border-[rgb(213_223_206_/_0.95)] bg-[rgb(241_246_236_/_0.94)] text-[#607660]",
        icon: Music4,
        steps: editingSteps,
        summary: getShortformSummary("editing", shortformState, editingSteps),
      },
      {
        key: "output",
        title: "렌더 및 저장",
        description: "비율별 MP4를 렌더하고 결과 화면에서 영상, 썸네일, 스크립트를 확인합니다.",
        badge: "출력",
        accent: "border border-[rgb(210_221_233_/_0.95)] bg-[rgb(237_244_250_/_0.94)] text-[#59728B]",
        icon: Film,
        steps: outputSteps,
        summary: getShortformSummary("output", shortformState, outputSteps),
      },
    ];

    return (
      <div className={`relative flex h-full flex-col overflow-hidden rounded-[32px] p-6 ${WORKSPACE_SURFACE.panelStrong}`}>
        <ShortformWizard
          selectedNodeId={selectedNodeId}
          onSelectStep={onSelectStep}
          shortformState={shortformState}
          groups={groups}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex h-full flex-col overflow-hidden rounded-[32px] p-6 ${WORKSPACE_SURFACE.panelStrong}`}>
      <div className="max-w-3xl">
        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${WORKSPACE_TEXT.accent}`}>간단 모드</p>
        <h1 className={`mt-2 text-2xl font-semibold ${WORKSPACE_TEXT.title}`}>순서대로 확인하고 실행하면 됩니다.</h1>
        <p className={`mt-2 text-[13px] leading-5 ${WORKSPACE_TEXT.body}`}>
          현재 단계를 빠르게 확인하고 필요한 입력만 채우면 됩니다.
        </p>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-2">
        {steps.map((step, index) => {
          const isSelected = selectedNodeId === step.nodeId;
          const previewImage =
            Array.isArray(step.nodeData.previewImages) && typeof step.nodeData.previewImages[0] === "string"
              ? step.nodeData.previewImages[0]
              : null;

          return (
            <button
              key={step.nodeId}
              type="button"
              onClick={() => onSelectStep(step.nodeId)}
              className={`group flex min-h-[136px] flex-col rounded-[24px] border p-4 text-left transition ${
                isSelected
                  ? "border-[rgb(236_197_183_/_0.95)] bg-[rgb(248_231_226_/_0.9)] shadow-[0_10px_30px_rgba(217,124,103,0.14)]"
                  : `${WORKSPACE_SURFACE.floating} hover:border-[rgb(215_201_188_/_0.94)] hover:shadow-[0_8px_24px_rgba(55,40,30,0.08)]`
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`flex items-center gap-2 text-[11px] font-medium ${WORKSPACE_TEXT.muted}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span>{step.title}</span>
                  </div>
                  <h2 className={`mt-2 text-[17px] font-semibold leading-6 ${WORKSPACE_TEXT.title}`}>{step.title}</h2>
                  <p className={`mt-1.5 line-clamp-2 text-[13px] leading-5 ${WORKSPACE_TEXT.body}`}>{step.description}</p>
                </div>
                <StatusBadge
                  status={step.nodeData.status ?? "draft"}
                  label={step.statusInfo.label}
                  tone={step.statusInfo.tone}
                />
              </div>

              <div className="mt-3 flex flex-1 items-end justify-between gap-3">
                <div className="space-y-1.5">
                  {isSelected
                    ? step.helpItems?.slice(0, 2).map((item) => (
                        <div key={item} className={`flex items-start gap-2 text-[11px] leading-4 ${WORKSPACE_TEXT.body}`}>
                          <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${WORKSPACE_TEXT.accent}`} />
                          <span>{item}</span>
                        </div>
                      ))
                    : null}
                </div>

                {isSelected && previewImage ? (
                  <AppImage
                    src={previewImage}
                    alt={step.title}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-2xl border border-white/60 object-cover shadow-[0_10px_24px_rgba(55,40,30,0.08)]"
                  />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
