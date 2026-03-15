import { GoogleGenAI } from "@google/genai";

const MODEL = "imagen-4.0-generate-001";

export interface ImagenGenerateOptions {
  apiKey?: string;
  aspectRatio?: string;
  numberOfImages?: number;
  styleParams?: Record<string, string>;
}

export interface GeneratedImageResult {
  imageBytes: string;
  mimeType: string;
}

/**
 * Generate an image from a text prompt using Imagen API.
 * Accepts optional client-provided API key (falls back to server env).
 */
export async function generateImageWithImagen(
  prompt: string,
  options?: ImagenGenerateOptions
): Promise<GeneratedImageResult> {
  const apiKey = options?.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const ai = new GoogleGenAI({ apiKey });
  const finalPrompt = buildImagePrompt(prompt, options?.styleParams);

  const response = await callWithRetry(async () => {
    return ai.models.generateImages({
      model: MODEL,
      prompt: finalPrompt,
      config: {
        numberOfImages: options?.numberOfImages ?? 1,
        aspectRatio: options?.aspectRatio ?? "1:1",
      },
    });
  });

  const generated = response.generatedImages?.[0];
  if (!generated) {
    throw new Error("No images returned from Imagen");
  }

  if (generated.raiFilteredReason) {
    throw new Error(`Image filtered by safety: ${generated.raiFilteredReason}`);
  }

  const imageBytes = generated.image?.imageBytes;
  const mimeType = generated.image?.mimeType ?? "image/png";
  if (!imageBytes) {
    throw new Error("Empty image bytes from Imagen");
  }

  return { imageBytes, mimeType };
}

/** Build image prompt, appending style context if provided. */
function buildImagePrompt(
  basePrompt: string,
  styleParams?: Record<string, string>
): string {
  const parts = [basePrompt];
  if (styleParams && Object.keys(styleParams).length > 0) {
    parts.push(
      "Style: " +
        Object.entries(styleParams)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
    );
  }
  return parts.join("\n");
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
