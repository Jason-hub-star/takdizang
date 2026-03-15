/** ColorStylePicker - 프리셋 색상/스타일 선택기 */
"use client";

import { WORKSPACE_CONTROL, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface ColorStylePickerProps {
  label: string;
  value: string;
  presets: Array<{ value: string; label: string; color: string }>;
  onChange: (value: string) => void;
}

export function ColorStylePicker({ label, value, presets, onChange }: ColorStylePickerProps) {
  return (
    <div>
      <label className={`mb-1.5 block text-xs font-medium ${WORKSPACE_TEXT.muted}`}>{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
              value === preset.value
                ? WORKSPACE_CONTROL.pillActive
                : WORKSPACE_CONTROL.subtleButton
            }`}
            title={preset.label}
          >
            <span
              className="h-3 w-3 rounded-full border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
              style={{ backgroundColor: preset.color }}
            />
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
