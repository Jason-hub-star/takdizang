/** 무드보드 프리셋 — 카테고리별 스타일 참조 데이터 */

import type { ThemePalette } from "@/types/blocks";

export interface MoodboardPreset {
  id: string;
  label: string;
  category: string;
  theme: ThemePalette;
  promptHint: string;
  gradient: string;
}

export const MOODBOARD_PRESETS: MoodboardPreset[] = [
  // Fashion
  { id: "fashion-minimal", label: "미니멀 시크", category: "fashion", theme: { primary: "#1f2937", secondary: "#6b7280", background: "#fafafa", text: "#111827", accent: "#d97706" }, promptHint: "깔끔하고 미니멀한 디자인, 여백 활용, 모노톤 컬러", gradient: "from-gray-900 to-gray-600" },
  { id: "fashion-bold", label: "볼드 스트릿", category: "fashion", theme: { primary: "#dc2626", secondary: "#f97316", background: "#ffffff", text: "#1c1917", accent: "#eab308" }, promptHint: "대담하고 에너지틱한 스트릿 스타일, 강렬한 컬러", gradient: "from-red-600 to-orange-500" },
  { id: "fashion-elegant", label: "엘레강스", category: "fashion", theme: { primary: "#7c3aed", secondary: "#a78bfa", background: "#faf5ff", text: "#4a044e", accent: "#d946ef" }, promptHint: "우아하고 세련된 럭셔리 무드, 보라 톤", gradient: "from-purple-700 to-pink-500" },
  { id: "fashion-casual", label: "캐주얼 데일리", category: "fashion", theme: { primary: "#0ea5e9", secondary: "#38bdf8", background: "#f0f9ff", text: "#0c4a6e", accent: "#06b6d4" }, promptHint: "편안하고 캐주얼한 데일리 무드, 시원한 블루 톤", gradient: "from-sky-500 to-cyan-400" },

  // Beauty
  { id: "beauty-clean", label: "클린 뷰티", category: "beauty", theme: { primary: "#16a34a", secondary: "#65a30d", background: "#f7fee7", text: "#14532d", accent: "#84cc16" }, promptHint: "자연주의 클린 뷰티, 그린 톤, 깨끗한 이미지", gradient: "from-green-600 to-lime-500" },
  { id: "beauty-glam", label: "글램 뷰티", category: "beauty", theme: { primary: "#be185d", secondary: "#ec4899", background: "#fdf2f8", text: "#831843", accent: "#f472b6" }, promptHint: "화려하고 글래머러스한 뷰티 무드, 핑크/로즈골드", gradient: "from-pink-700 to-rose-400" },
  { id: "beauty-derma", label: "더마 사이언스", category: "beauty", theme: { primary: "#0284c7", secondary: "#06b6d4", background: "#f0f9ff", text: "#0c4a6e", accent: "#8b5cf6" }, promptHint: "과학적이고 전문적인 더마 무드, 블루/화이트 톤", gradient: "from-sky-700 to-cyan-500" },
  { id: "beauty-organic", label: "오가닉 내추럴", category: "beauty", theme: { primary: "#92400e", secondary: "#b45309", background: "#fffbeb", text: "#78350f", accent: "#d97706" }, promptHint: "따뜻한 오가닉 무드, 어스톤, 내추럴 소재감", gradient: "from-amber-800 to-yellow-600" },

  // Food
  { id: "food-fresh", label: "프레시 마켓", category: "food", theme: { primary: "#16a34a", secondary: "#22c55e", background: "#f0fdf4", text: "#14532d", accent: "#f59e0b" }, promptHint: "신선하고 건강한 느낌, 그린과 내추럴 톤", gradient: "from-green-600 to-emerald-400" },
  { id: "food-gourmet", label: "고메 다이닝", category: "food", theme: { primary: "#1f2937", secondary: "#374151", background: "#fafafa", text: "#111827", accent: "#b45309" }, promptHint: "고급 다이닝 무드, 다크 톤, 음식 클로즈업", gradient: "from-gray-900 to-amber-800" },
  { id: "food-homemade", label: "홈메이드", category: "food", theme: { primary: "#ea580c", secondary: "#f97316", background: "#fff7ed", text: "#7c2d12", accent: "#eab308" }, promptHint: "따뜻한 홈메이드 무드, 따뜻한 오렌지 톤", gradient: "from-orange-600 to-amber-400" },
  { id: "food-healthy", label: "헬시 라이프", category: "food", theme: { primary: "#0d9488", secondary: "#14b8a6", background: "#f0fdfa", text: "#134e4a", accent: "#65a30d" }, promptHint: "건강하고 라이프스타일 무드, 민트/그린 톤", gradient: "from-teal-600 to-green-400" },

  // Electronics
  { id: "elec-tech", label: "하이테크", category: "electronics", theme: { primary: "#4f46e5", secondary: "#6366f1", background: "#eef2ff", text: "#312e81", accent: "#06b6d4" }, promptHint: "미래지향 하이테크 무드, 블루/퍼플 그라디언트", gradient: "from-indigo-600 to-cyan-500" },
  { id: "elec-minimal", label: "미니멀 테크", category: "electronics", theme: { primary: "#374151", secondary: "#6b7280", background: "#ffffff", text: "#111827", accent: "#3b82f6" }, promptHint: "심플하고 미니멀한 프로덕트 무드, 모노톤 + 포인트", gradient: "from-gray-700 to-blue-500" },
  { id: "elec-gaming", label: "게이밍", category: "electronics", theme: { primary: "#7c3aed", secondary: "#a855f7", background: "#0f0f23", text: "#e2e8f0", accent: "#22d3ee" }, promptHint: "게이밍 다크 무드, 네온 컬러 액센트", gradient: "from-violet-700 to-cyan-400" },
  { id: "elec-lifestyle", label: "라이프스타일", category: "electronics", theme: { primary: "#0ea5e9", secondary: "#38bdf8", background: "#f8fafc", text: "#0f172a", accent: "#f59e0b" }, promptHint: "일상 속 테크 라이프스타일, 밝고 따뜻한 무드", gradient: "from-sky-500 to-amber-400" },

  // Baby
  { id: "baby-soft", label: "소프트 파스텔", category: "baby", theme: { primary: "#ec4899", secondary: "#a78bfa", background: "#fdf2f8", text: "#4a044e", accent: "#60a5fa" }, promptHint: "부드러운 파스텔 톤, 따뜻하고 안전한 느낌", gradient: "from-pink-400 to-purple-300" },
  { id: "baby-nature", label: "내추럴 키즈", category: "baby", theme: { primary: "#65a30d", secondary: "#84cc16", background: "#fefce8", text: "#365314", accent: "#f59e0b" }, promptHint: "자연 친화적 키즈 무드, 그린/옐로 내추럴 톤", gradient: "from-lime-500 to-yellow-400" },
  { id: "baby-playful", label: "플레이풀", category: "baby", theme: { primary: "#f97316", secondary: "#fbbf24", background: "#fffbeb", text: "#7c2d12", accent: "#ef4444" }, promptHint: "밝고 활기찬 플레이풀 무드, 비비드 컬러", gradient: "from-orange-500 to-yellow-400" },
  { id: "baby-safe", label: "세이프 케어", category: "baby", theme: { primary: "#0284c7", secondary: "#06b6d4", background: "#f0f9ff", text: "#0c4a6e", accent: "#10b981" }, promptHint: "안전하고 신뢰감 있는 무드, 블루/그린 톤", gradient: "from-sky-600 to-teal-400" },

  // Home
  { id: "home-modern", label: "모던 인테리어", category: "home", theme: { primary: "#374151", secondary: "#6b7280", background: "#f9fafb", text: "#111827", accent: "#eab308" }, promptHint: "모던하고 세련된 인테리어 무드, 뉴트럴 톤", gradient: "from-gray-700 to-yellow-600" },
  { id: "home-scandinavian", label: "스칸디나비안", category: "home", theme: { primary: "#0ea5e9", secondary: "#64748b", background: "#ffffff", text: "#1e293b", accent: "#f59e0b" }, promptHint: "북유럽 스칸디나비안 스타일, 밝고 심플한 무드", gradient: "from-sky-400 to-slate-400" },
  { id: "home-cozy", label: "코지 홈", category: "home", theme: { primary: "#b45309", secondary: "#d97706", background: "#fffbeb", text: "#78350f", accent: "#dc2626" }, promptHint: "따뜻하고 아늑한 홈 무드, 우드/어스톤", gradient: "from-amber-700 to-red-500" },
  { id: "home-luxury", label: "럭셔리 리빙", category: "home", theme: { primary: "#1f2937", secondary: "#4b5563", background: "#fafafa", text: "#111827", accent: "#a16207" }, promptHint: "고급스러운 리빙 공간, 다크톤 + 골드 액센트", gradient: "from-gray-900 to-amber-700" },
];

export function getMoodboardsByCategory(category: string): MoodboardPreset[] {
  return MOODBOARD_PRESETS.filter((m) => m.category === category);
}
