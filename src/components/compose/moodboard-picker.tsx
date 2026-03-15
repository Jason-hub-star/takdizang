/** 무드보드 선택 — 카테고리별 스타일 참조 타일 */
"use client";

import { getMoodboardsByCategory, type MoodboardPreset } from "@/lib/moodboard-presets";
import { WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface MoodboardPickerProps {
  category: string;
  selected: string | null;
  onSelect: (preset: MoodboardPreset) => void;
}

export function MoodboardPicker({ category, selected, onSelect }: MoodboardPickerProps) {
  const presets = getMoodboardsByCategory(category);

  if (presets.length === 0) return null;

  return (
    <div>
      <label className={`mb-1.5 block text-xs font-medium ${WORKSPACE_TEXT.body}`}>스타일 무드보드</label>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`group relative overflow-hidden rounded-lg border-2 p-3 text-left transition ${
              selected === preset.id
                ? "border-[rgb(236_197_183_/_0.95)] ring-2 ring-[rgb(243_212_203_/_0.92)]"
                : "border-[rgb(214_199_184_/_0.74)] hover:border-[rgb(236_197_183_/_0.84)]"
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${preset.gradient} opacity-20 transition group-hover:opacity-30`}
            />
            <div className="relative">
              <div className="mb-1.5 flex gap-1">
                {[preset.theme.primary, preset.theme.secondary, preset.theme.accent].map((c, i) => (
                  <div
                    key={i}
                    className="h-3 w-3 rounded-full border border-white/50"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className={`text-xs font-semibold ${WORKSPACE_TEXT.title}`}>{preset.label}</p>
              <p className={`mt-0.5 line-clamp-2 text-[10px] leading-tight ${WORKSPACE_TEXT.body}`}>
                {preset.promptHint}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
