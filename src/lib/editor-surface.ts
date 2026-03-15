import type { FlowNodeType } from "@/lib/constants";

export type EditorViewMode = "simple" | "expert";
export type EditorEditingPolicy = "guided-readonly" | "guided-limited" | "freeform";

export interface StepPresentationConfig {
  nodeType: FlowNodeType;
  title: string;
  description: string;
  helpItems?: string[];
}

export interface UserFacingNodeStatus {
  label: string;
  tone: "idle" | "working" | "done" | "error";
}

export interface ModeSurfaceConfig {
  defaultViewMode: EditorViewMode;
  allowSimpleMode: boolean;
  stepOrder?: FlowNodeType[];
  editingPolicy: EditorEditingPolicy;
  cardinality?: Partial<Record<FlowNodeType, number>>;
  allowDuplicateTypes: boolean;
  allowEdgeEditing: boolean;
  allowNodeDuplication: boolean;
  allowNodeInsertion: boolean;
}

export interface SurfaceNodeDataLike {
  nodeType?: string;
  status?: string;
  briefText?: unknown;
  uploadedAssetId?: unknown;
  previewImages?: unknown;
}

export const MODE_SURFACE_CONFIG: Record<string, ModeSurfaceConfig> = {
  "shortform-video": {
    defaultViewMode: "simple",
    allowSimpleMode: true,
    stepOrder: ["prompt", "generate-images", "bgm", "cuts", "render", "export"],
    editingPolicy: "guided-readonly",
    cardinality: {
      prompt: 1,
      "generate-images": 1,
      bgm: 1,
      cuts: 1,
      render: 1,
      export: 1,
    },
    allowDuplicateTypes: false,
    allowEdgeEditing: false,
    allowNodeDuplication: false,
    allowNodeInsertion: false,
  },
  "model-shot": {
    defaultViewMode: "simple",
    allowSimpleMode: true,
    stepOrder: ["upload-image", "prompt", "model-compose", "export"],
    editingPolicy: "guided-readonly",
    cardinality: {
      "upload-image": 1,
      prompt: 1,
      "model-compose": 1,
      export: 1,
    },
    allowDuplicateTypes: false,
    allowEdgeEditing: false,
    allowNodeDuplication: false,
    allowNodeInsertion: false,
  },
  cutout: {
    defaultViewMode: "simple",
    allowSimpleMode: true,
    stepOrder: ["upload-image", "remove-bg", "export"],
    editingPolicy: "guided-readonly",
    cardinality: {
      "upload-image": 1,
      "remove-bg": 1,
      export: 1,
    },
    allowDuplicateTypes: false,
    allowEdgeEditing: false,
    allowNodeDuplication: false,
    allowNodeInsertion: false,
  },
  "brand-image": {
    defaultViewMode: "simple",
    allowSimpleMode: true,
    stepOrder: ["prompt", "generate-images", "export"],
    editingPolicy: "guided-readonly",
    cardinality: {
      prompt: 1,
      "generate-images": 1,
      export: 1,
    },
    allowDuplicateTypes: false,
    allowEdgeEditing: false,
    allowNodeDuplication: false,
    allowNodeInsertion: false,
  },
  freeform: {
    defaultViewMode: "expert",
    allowSimpleMode: false,
    editingPolicy: "freeform",
    allowDuplicateTypes: true,
    allowEdgeEditing: true,
    allowNodeDuplication: true,
    allowNodeInsertion: true,
  },
  "gif-source": {
    defaultViewMode: "expert",
    allowSimpleMode: false,
    editingPolicy: "freeform",
    allowDuplicateTypes: true,
    allowEdgeEditing: true,
    allowNodeDuplication: true,
    allowNodeInsertion: true,
  },
};

const DEFAULT_SURFACE_CONFIG: ModeSurfaceConfig = {
  defaultViewMode: "expert",
  allowSimpleMode: false,
  editingPolicy: "freeform",
  allowDuplicateTypes: true,
  allowEdgeEditing: true,
  allowNodeDuplication: true,
  allowNodeInsertion: true,
};

const MODE_STEP_CONFIGS: Partial<Record<string, StepPresentationConfig[]>> = {
  "shortform-video": [
    {
      nodeType: "prompt",
      title: "기획 정리",
      description: "제품명, 타깃, 셀링포인트, CTA를 기준으로 영상 카피를 정리합니다.",
      helpItems: [
        "브리프 TXT를 올렸다면 내용을 다듬어 핵심 문장을 확인하세요.",
        "첫 문장은 후킹, 마지막 문장은 CTA가 되도록 적는 편이 안정적입니다.",
      ],
    },
    {
      nodeType: "generate-images",
      title: "장면 이미지 생성",
      description: "정리된 카피를 바탕으로 장면용 이미지를 생성합니다.",
      helpItems: [
        "대표 컷이 있다면 직접 업로드 후 참고 이미지로 활용할 수 있습니다.",
      ],
    },
    {
      nodeType: "bgm",
      title: "배경음악 준비",
      description: "영상에 사용할 BGM을 업로드하거나 선택합니다.",
    },
    {
      nodeType: "cuts",
      title: "장면 편집",
      description: "장면 순서와 전환 타이밍을 확인합니다.",
    },
    {
      nodeType: "render",
      title: "영상 렌더",
      description: "선택한 비율 기준으로 숏폼 영상을 렌더링합니다.",
    },
    {
      nodeType: "export",
      title: "산출물 저장",
      description: "영상 결과를 저장하고 미리보기/결과 화면으로 이어집니다.",
    },
  ],
  "model-shot": [
    {
      nodeType: "upload-image",
      title: "원본 이미지 업로드",
      description: "모델 합성에 사용할 원본 이미지를 올립니다.",
      helpItems: [
        "권장 이미지 수: 대표 컷 1장",
        "배경/구도 가이드: 피사체가 중앙에 보이도록 촬영",
        "허용 포맷: JPG, PNG, WEBP",
      ],
    },
    {
      nodeType: "prompt",
      title: "촬영 지시 입력",
      description: "원하는 모델 착장, 분위기, 장소, 소품을 자연어로 입력합니다.",
      helpItems: [
        "의상, 표정, 조명, 배경을 함께 적으면 결과가 안정적입니다.",
        "짧은 키워드보다 문장형 지시가 더 잘 동작합니다.",
      ],
    },
    {
      nodeType: "model-compose",
      title: "모델 합성",
      description: "업로드한 이미지를 기반으로 모델 촬영 컷을 생성합니다.",
    },
    {
      nodeType: "export",
      title: "내보내기",
      description: "완성된 결과를 저장 가능한 파일로 정리합니다.",
    },
  ],
  cutout: [
    {
      nodeType: "upload-image",
      title: "원본 이미지 업로드",
      description: "배경 제거에 사용할 원본 이미지를 올립니다.",
      helpItems: [
        "권장 이미지 수: 대표 컷 1장",
        "배경/구도 가이드: 상품 외곽이 또렷한 사진 권장",
        "허용 포맷: JPG, PNG, WEBP",
      ],
    },
    {
      nodeType: "remove-bg",
      title: "배경 제거",
      description: "피사체를 유지하고 배경만 자동으로 제거합니다.",
    },
    {
      nodeType: "export",
      title: "내보내기",
      description: "누끼가 적용된 결과 파일을 저장합니다.",
    },
  ],
  "brand-image": [
    {
      nodeType: "prompt",
      title: "브랜드 지시 입력",
      description: "제품 분위기, 타깃, 강조 포인트를 입력합니다.",
      helpItems: [
        "배경 톤, 소품, 제품 강조점을 함께 적으면 결과가 좋아집니다.",
      ],
    },
    {
      nodeType: "generate-images",
      title: "이미지 생성",
      description: "입력한 지시를 바탕으로 브랜드 이미지를 만듭니다.",
    },
    {
      nodeType: "export",
      title: "내보내기",
      description: "생성된 이미지를 저장 가능한 파일로 정리합니다.",
    },
  ],
};

const FALLBACK_STEP_CONFIGS: StepPresentationConfig[] = [
  {
    nodeType: "prompt",
    title: "작업 단계",
    description: "현재 단계의 설정을 확인합니다.",
  },
];

export function getModeSurfaceConfig(mode: string): ModeSurfaceConfig {
  return MODE_SURFACE_CONFIG[mode] ?? DEFAULT_SURFACE_CONFIG;
}

export function isGuidedMode(mode: string): boolean {
  return getModeSurfaceConfig(mode).editingPolicy !== "freeform";
}

export function getMaxCountForNodeType(mode: string, nodeType: FlowNodeType): number | null {
  const cardinality = getModeSurfaceConfig(mode).cardinality;
  if (!cardinality) {
    return null;
  }
  return cardinality[nodeType] ?? null;
}

export function getStepPresentation(mode: string, nodeType: string): StepPresentationConfig | undefined {
  return (MODE_STEP_CONFIGS[mode] ?? FALLBACK_STEP_CONFIGS).find((step) => step.nodeType === nodeType);
}

export function getSimpleModeSteps(mode: string): StepPresentationConfig[] {
  return MODE_STEP_CONFIGS[mode] ?? [];
}

export function getViewModeStorageKey(mode: string) {
  return `takdi-editor-view:${mode}`;
}

function hasPromptValue(nodeData?: SurfaceNodeDataLike | null) {
  return typeof nodeData?.briefText === "string" && nodeData.briefText.trim().length > 0;
}

function hasUploadedAsset(nodeData?: SurfaceNodeDataLike | null) {
  return typeof nodeData?.uploadedAssetId === "string" && nodeData.uploadedAssetId.length > 0;
}

export function getUserFacingNodeStatus(nodeData?: SurfaceNodeDataLike | null): UserFacingNodeStatus {
  const nodeType = nodeData?.nodeType;
  const rawStatus = nodeData?.status;

  if (nodeType === "upload-image") {
    return hasUploadedAsset(nodeData)
      ? { label: "업로드 완료", tone: "done" }
      : { label: "업로드 필요", tone: "idle" };
  }

  if (nodeType === "prompt") {
    return hasPromptValue(nodeData)
      ? { label: "입력 완료", tone: "done" }
      : { label: "입력 필요", tone: "idle" };
  }

  if (nodeType === "export") {
    if (rawStatus === "generating" || rawStatus === "running") {
      return { label: "내보내는 중", tone: "working" };
    }
    if (rawStatus === "exported" || rawStatus === "done") {
      return { label: "내보내기 완료", tone: "done" };
    }
    if (rawStatus === "failed" || rawStatus === "error") {
      return { label: "오류", tone: "error" };
    }
    return { label: "저장 전", tone: "idle" };
  }

  if (nodeType === "model-compose") {
    if (rawStatus === "generating" || rawStatus === "running") {
      return { label: "합성 중", tone: "working" };
    }
    if (rawStatus === "generated" || rawStatus === "done") {
      return { label: "합성 완료", tone: "done" };
    }
    if (rawStatus === "failed" || rawStatus === "error") {
      return { label: "오류", tone: "error" };
    }
    return { label: "실행 전", tone: "idle" };
  }

  if (nodeType === "remove-bg") {
    if (rawStatus === "generating" || rawStatus === "running") {
      return { label: "배경 제거 중", tone: "working" };
    }
    if (rawStatus === "generated" || rawStatus === "done") {
      return { label: "배경 제거 완료", tone: "done" };
    }
    if (rawStatus === "failed" || rawStatus === "error") {
      return { label: "오류", tone: "error" };
    }
    return { label: "실행 전", tone: "idle" };
  }

  if (nodeType === "generate-images") {
    if (rawStatus === "generating" || rawStatus === "running") {
      return { label: "생성 중", tone: "working" };
    }
    if (rawStatus === "generated" || rawStatus === "done") {
      return { label: "생성 완료", tone: "done" };
    }
    if (rawStatus === "failed" || rawStatus === "error") {
      return { label: "오류", tone: "error" };
    }
    return { label: "실행 전", tone: "idle" };
  }

  if (nodeType === "render") {
    if (rawStatus === "generating" || rawStatus === "running") {
      return { label: "렌더링 중", tone: "working" };
    }
    if (rawStatus === "generated" || rawStatus === "done") {
      return { label: "렌더링 완료", tone: "done" };
    }
    if (rawStatus === "failed" || rawStatus === "error") {
      return { label: "오류", tone: "error" };
    }
    return { label: "실행 전", tone: "idle" };
  }

  if (nodeType === "bgm") {
    const bgmValue = (nodeData as { filePath?: unknown } | undefined)?.filePath;
    return typeof bgmValue === "string" && bgmValue.length > 0
      ? { label: "설정 완료", tone: "done" }
      : { label: "설정 전", tone: "idle" };
  }

  if (nodeType === "cuts") {
    if (rawStatus === "generated" || rawStatus === "done") {
      return { label: "편집 완료", tone: "done" };
    }
    return { label: "확인 전", tone: "idle" };
  }

  if (rawStatus === "failed" || rawStatus === "error") {
    return { label: "오류", tone: "error" };
  }
  if (rawStatus === "generated" || rawStatus === "done" || rawStatus === "exported") {
    return { label: "완료", tone: "done" };
  }
  if (rawStatus === "generating" || rawStatus === "running") {
    return { label: "진행 중", tone: "working" };
  }
  return { label: "준비 전", tone: "idle" };
}
