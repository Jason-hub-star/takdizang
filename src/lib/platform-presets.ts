/** 이커머스 플랫폼 출력 규격 프리셋 */

export interface PlatformPreset {
  name: string;
  label: string;
  width: number;
  maxHeight: number;
  format: "jpg" | "png";
}

export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  coupang: {
    name: "coupang",
    label: "쿠팡",
    width: 780,
    maxHeight: 3000,
    format: "jpg",
  },
  naver: {
    name: "naver",
    label: "네이버",
    width: 860,
    maxHeight: 5000,
    format: "png",
  },
};

export function getPlatformPreset(name: string): PlatformPreset {
  return PLATFORM_PRESETS[name] ?? PLATFORM_PRESETS.coupang;
}
