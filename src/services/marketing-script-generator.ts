/** Gemini-backed marketing script generation for shortform preview artifacts. */
import { GoogleGenAI } from "@google/genai";
import type { MarketingScript } from "@/types";

const MODEL = "gemini-2.5-flash";

const MARKETING_SCRIPT_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    hook: { type: "STRING" as const },
    body: { type: "STRING" as const },
    hashtags: {
      type: "ARRAY" as const,
      items: { type: "STRING" as const },
    },
  },
  required: ["hook", "body", "hashtags"],
};

export interface GenerateMarketingScriptOptions {
  apiKey?: string;
  projectName: string;
  briefText: string;
  sections: Array<{ headline: string; body: string }>;
  templateKey?: string;
}

export async function generateMarketingScriptWithGemini(
  options: GenerateMarketingScriptOptions,
): Promise<MarketingScript> {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildMarketingScriptPrompt(options),
    config: {
      responseMimeType: "application/json",
      responseSchema: MARKETING_SCRIPT_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text) as MarketingScript;
  if (!parsed.hook || !parsed.body || !Array.isArray(parsed.hashtags)) {
    throw new Error("Invalid marketing script response");
  }

  return {
    hook: parsed.hook.trim(),
    body: parsed.body.trim(),
    hashtags: parsed.hashtags.map((tag) => tag.trim()).filter(Boolean),
  };
}

export function formatMarketingScriptText(script: MarketingScript) {
  return [
    "[HOOK]",
    script.hook,
    "",
    "[BODY]",
    script.body,
    "",
    "[HASHTAGS]",
    script.hashtags.join(" "),
  ].join("\n");
}

function buildMarketingScriptPrompt(options: GenerateMarketingScriptOptions) {
  const slideSummary = options.sections
    .slice(0, 6)
    .map((section, index) => `${index + 1}. ${section.headline} - ${section.body}`)
    .join("\n");

  return [
    "당신은 한국어 SNS 마케팅 카피라이터입니다.",
    "숏폼 영상과 함께 업로드할 마케팅 스크립트를 JSON으로만 작성하세요.",
    "",
    "규칙:",
    "- hook: 1문장, 후킹 중심, 40자 이내 권장",
    "- body: 3~5문장, 자연스러운 단락 1개",
    "- hashtags: 8~12개, # 포함 문자열 배열",
    "- 한국어 중심으로 작성",
    "",
    `프로젝트명: ${options.projectName}`,
    `영상 비율: ${options.templateKey ?? "9:16"}`,
    "브리프:",
    options.briefText || "(브리프 없음)",
    "",
    "영상 섹션 요약:",
    slideSummary || "(섹션 없음)",
  ].join("\n");
}
