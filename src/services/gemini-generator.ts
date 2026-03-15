import { GoogleGenAI } from "@google/genai";
import type { GenerationResult } from "@/types";
import { PERSUASION_SEQUENCES } from "@/lib/constants";

const MODEL = "gemini-2.5-flash";

const GENERATION_RESULT_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    sections: {
      type: "ARRAY" as const,
      items: {
        type: "OBJECT" as const,
        properties: {
          headline: { type: "STRING" as const },
          body: { type: "STRING" as const },
          imageSlot: { type: "STRING" as const },
          styleKey: { type: "STRING" as const },
        },
        required: ["headline", "body", "imageSlot", "styleKey"],
      },
    },
  },
  required: ["sections"],
};

export interface GeminiGenerateOptions {
  apiKey?: string;
  mode?: string;
  maxSections?: number;
  category?: string;
}

/**
 * Generate structured sections from brief text using Gemini API.
 * Accepts optional client-provided API key (falls back to server env).
 */
export async function generateWithGemini(
  briefText: string,
  options?: GeminiGenerateOptions
): Promise<GenerationResult> {
  const apiKey = options?.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(briefText, options?.mode, options?.maxSections, options?.category);

  const response = await callWithRetry(async () => {
    return ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: GENERATION_RESULT_SCHEMA,
      },
    });
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed: GenerationResult = JSON.parse(text);

  // Validate sections exist
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error("Invalid response structure: missing sections array");
  }

  return parsed;
}

const CATEGORY_INSTRUCTIONS: Record<string, string> = {
  fashion: [
    "- Emphasize material quality, fit, and styling tips.",
    "- Include size/measurement guidance in body text.",
    "- Use lifestyle-oriented, aspirational language.",
    "- Suggest outfit coordination ideas.",
  ].join("\n"),
  beauty: [
    "- Highlight key ingredients and their benefits.",
    "- Include usage steps and recommended routine.",
    "- Use scientific yet accessible language.",
    "- Mention skin type suitability.",
  ].join("\n"),
  food: [
    "- Emphasize taste, freshness, and origin.",
    "- Include storage and serving suggestions.",
    "- Use sensory language (taste, aroma, texture).",
    "- Mention nutritional highlights if relevant.",
  ].join("\n"),
  baby: [
    "- Prioritize safety certifications and materials.",
    "- Use warm, reassuring parent-friendly language.",
    "- Include age/stage suitability information.",
    "- Mention wash/care instructions.",
  ].join("\n"),
  electronics: [
    "- Lead with key specs and performance metrics.",
    "- Compare with previous generation if applicable.",
    "- Include compatibility and setup information.",
    "- Use clear, technical yet accessible language.",
  ].join("\n"),
  home: [
    "- Emphasize dimensions, materials, and assembly.",
    "- Include room/space suitability suggestions.",
    "- Mention maintenance and care tips.",
    "- Use cozy, lifestyle-oriented language.",
  ].join("\n"),
};

function buildPrompt(
  briefText: string,
  mode?: string,
  maxSections?: number,
  category?: string,
): string {
  const sectionCount = maxSections ?? 5;
  const modeLabel = mode ?? "freeform";
  const categoryInstructions = category ? CATEGORY_INSTRUCTIONS[category] : undefined;

  // Determine styleKey sequence from persuasion mapping
  const sequence = category
    ? (PERSUASION_SEQUENCES[category] ?? PERSUASION_SEQUENCES.default)
    : PERSUASION_SEQUENCES.default;
  const styleKeyHint = sequence.slice(0, sectionCount).join(", ");

  const lines = [
    "You are an e-commerce product detail page content specialist.",
    "Analyze the provided product brief and structure it into detail page sections.",
    "",
    "Requirements:",
    `- Generate up to ${sectionCount} sections.`,
    `- Each section must have: headline (concise, attention-grabbing), body (persuasive copy, 50-150 chars), imageSlot (slot-1, slot-2, ...), styleKey (one of the block types below).`,
    `- Use these styleKey values in order for optimal persuasion flow: ${styleKeyHint}`,
    "- Write in the same language as the brief text.",
    `- Content mode: ${modeLabel}`,
  ];

  if (categoryInstructions) {
    lines.push("", `Category-specific guidelines (${category}):`, categoryInstructions);
  }

  lines.push("", "Product brief:", briefText);

  return lines.join("\n");
}

/** Retry once on rate limit (429). */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 1
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 429 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}
