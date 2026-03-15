/** Shared start-mode definitions used by home, global launcher, and direct upload entry. */
import type { ProjectMode } from "@/types";

export interface StartModeDefinition {
  mode: ProjectMode;
  label: string;
  description: string;
  editorMode: "flow" | "compose";
}

export const START_MODE_DEFINITIONS: StartModeDefinition[] = [
  {
    mode: "compose",
    label: "상세페이지 제작",
    description: "상품 소개와 판매 구조를 정리합니다",
    editorMode: "compose",
  },
  {
    mode: "shortform-video",
    label: "숏폼 영상",
    description: "기획과 이미지를 바탕으로 숏폼 영상을 만듭니다",
    editorMode: "flow",
  },
  {
    mode: "model-shot",
    label: "모델 촬영",
    description: "모델 컷을 빠르게 합성합니다",
    editorMode: "flow",
  },
  {
    mode: "cutout",
    label: "누끼",
    description: "배경을 정리하고 파일을 만듭니다",
    editorMode: "flow",
  },
  {
    mode: "brand-image",
    label: "브랜드 이미지",
    description: "브랜드 이미지를 제작합니다",
    editorMode: "flow",
  },
  {
    mode: "gif-source",
    label: "GIF",
    description: "움직이는 소스를 빠르게 만듭니다",
    editorMode: "flow",
  },
  {
    mode: "freeform",
    label: "자유 형식",
    description: "자유롭게 실험형 작업을 시작합니다",
    editorMode: "flow",
  },
];

export function getProjectStartDestination(mode: StartModeDefinition["mode"]) {
  return mode === "compose" ? "compose" : "editor";
}
