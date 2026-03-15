/** Provider registry — Kie-only image provider factory for Takdizang. */

import type { ImageGenerationProvider } from "./types";
import { KieProvider } from "./kie-provider";

export type ProviderKey = "kie";

const providers: Record<ProviderKey, () => ImageGenerationProvider> = {
  kie: () => new KieProvider(),
};

let cached: ImageGenerationProvider | null = null;
let cachedKey: string | null = null;

/**
 * Get the active image generation provider.
 */
export function getProvider(): ImageGenerationProvider {
  const key: ProviderKey = "kie";
  if (cached && cachedKey === key) return cached;

  const factory = providers[key];
  if (!factory) {
    throw new Error(
      `Unknown IMAGE_PROVIDER "${key}". Valid: ${Object.keys(providers).join(", ")}`,
    );
  }

  cached = factory();
  cachedKey = key;
  return cached;
}

/**
 * Get a specific provider by name (for explicit override).
 */
export function getProviderByName(name: ProviderKey): ImageGenerationProvider {
  const factory = providers[name];
  if (!factory) {
    throw new Error(
      `Unknown provider "${name}". Valid: ${Object.keys(providers).join(", ")}`,
    );
  }
  return factory();
}

/**
 * Provider name for GenerationJob.provider field.
 */
export function getProviderLabel(): string {
  return "kie-nano-banana-2";
}
