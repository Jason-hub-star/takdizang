/** 배경 합성 템플릿 라이브러리 — 카테고리별 장면 프롬프트 */

export interface SceneTemplate {
  id: string;
  label: string;
  prompt: string;
  category: string;
}

export interface SceneCategory {
  id: string;
  label: string;
}

export const SCENE_CATEGORIES: SceneCategory[] = [
  { id: "studio", label: "스튜디오" },
  { id: "lifestyle", label: "라이프스타일" },
  { id: "nature", label: "자연/야외" },
  { id: "seasonal", label: "시즌/이벤트" },
  { id: "minimal", label: "미니멀" },
  { id: "luxury", label: "프리미엄" },
];

export const SCENE_TEMPLATES: SceneTemplate[] = [
  // Studio
  { id: "studio-white", label: "화이트 스튜디오", prompt: "clean white photography studio background, soft even lighting, professional product photography setup", category: "studio" },
  { id: "studio-gray", label: "그레이 스튜디오", prompt: "neutral gray photography studio background, soft studio lighting, clean minimal backdrop", category: "studio" },
  { id: "studio-gradient", label: "그라디언트 배경", prompt: "smooth gradient background from light gray to white, soft studio lighting, professional product shot", category: "studio" },
  { id: "studio-shadow", label: "그림자 연출", prompt: "white surface with soft natural shadow, window light casting gentle shadows, clean product photography", category: "studio" },

  // Lifestyle
  { id: "life-table", label: "테이블 위", prompt: "modern wooden table surface, cozy home interior background, soft natural window light, lifestyle product photography", category: "lifestyle" },
  { id: "life-kitchen", label: "주방", prompt: "bright modern kitchen countertop, clean marble surface, warm natural light, lifestyle setting", category: "lifestyle" },
  { id: "life-desk", label: "데스크 위", prompt: "clean modern desk workspace, minimal office setting, soft warm light, organized aesthetic", category: "lifestyle" },
  { id: "life-bathroom", label: "욕실", prompt: "modern clean bathroom counter, white marble surface, spa-like atmosphere, soft lighting", category: "lifestyle" },

  // Nature
  { id: "nature-garden", label: "정원", prompt: "lush green garden background, soft bokeh flowers, natural sunlight, outdoor product photography", category: "nature" },
  { id: "nature-beach", label: "해변", prompt: "sandy beach background, ocean waves in distance, golden hour warm sunlight, summer atmosphere", category: "nature" },
  { id: "nature-forest", label: "숲", prompt: "forest floor with moss and leaves, dappled sunlight through trees, natural green background", category: "nature" },
  { id: "nature-sky", label: "하늘", prompt: "clear blue sky background with soft white clouds, bright natural daylight, clean airy feeling", category: "nature" },

  // Seasonal
  { id: "season-spring", label: "봄 꽃", prompt: "spring cherry blossom petals background, soft pink flowers, gentle warm light, seasonal spring mood", category: "seasonal" },
  { id: "season-summer", label: "여름 바다", prompt: "tropical summer setting, turquoise water, palm leaves, bright vibrant sunlight, vacation mood", category: "seasonal" },
  { id: "season-autumn", label: "가을 단풍", prompt: "autumn fallen leaves background, warm orange and red tones, golden afternoon light, cozy fall atmosphere", category: "seasonal" },
  { id: "season-winter", label: "겨울 눈", prompt: "winter snow scene background, soft white snow, cool blue tones, gentle snowfall, holiday atmosphere", category: "seasonal" },
  { id: "season-holiday", label: "홀리데이", prompt: "festive holiday decoration background, warm golden lights, red and green accents, gift wrapping ribbon", category: "seasonal" },

  // Minimal
  { id: "min-pastel", label: "파스텔 톤", prompt: "soft pastel colored background, light pink and beige tones, minimal clean composition, gentle lighting", category: "minimal" },
  { id: "min-concrete", label: "콘크리트", prompt: "raw concrete texture background, industrial minimalist aesthetic, neutral gray tones, clean composition", category: "minimal" },
  { id: "min-paper", label: "종이 텍스처", prompt: "textured paper background, off-white cream color, subtle fiber texture, soft even lighting", category: "minimal" },

  // Luxury
  { id: "lux-marble", label: "대리석", prompt: "luxury white marble surface with gold veins, elegant premium setting, soft warm lighting, high-end product photography", category: "luxury" },
  { id: "lux-velvet", label: "벨벳", prompt: "rich deep velvet fabric background, dark jewel tones, dramatic luxury lighting, premium product display", category: "luxury" },
  { id: "lux-gold", label: "골드 악센트", prompt: "black background with gold accents and highlights, premium luxury aesthetic, dramatic lighting, elegant display", category: "luxury" },
  { id: "lux-silk", label: "실크", prompt: "flowing silk fabric background, soft shimmering texture, elegant pearl white tones, premium luxury mood", category: "luxury" },
];

export function getTemplatesByCategory(categoryId: string): SceneTemplate[] {
  return SCENE_TEMPLATES.filter((t) => t.category === categoryId);
}
