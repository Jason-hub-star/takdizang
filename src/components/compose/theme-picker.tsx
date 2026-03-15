/** ThemePicker - 글로벌 컬러 팔레트 선택기 */
"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import type { ThemePalette } from "@/types/blocks";
import { THEME_PRESETS } from "@/lib/constants";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface ThemePickerProps {
  currentTheme: ThemePalette | undefined;
  onThemeChange: (theme: ThemePalette | undefined) => void;
}

export function ThemePicker({ currentTheme, onThemeChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false);

  const currentName = currentTheme
    ? THEME_PRESETS.find(
        (p) => p.palette.primary === currentTheme.primary && p.palette.background === currentTheme.background,
      )?.name ?? "custom"
    : "default";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs ${WORKSPACE_CONTROL.input}`}
      >
        <Palette className="h-3.5 w-3.5" />
        테마
        {currentTheme && (
          <span
            className="inline-block h-3 w-3 rounded-full border border-gray-200"
            style={{ backgroundColor: currentTheme.primary }}
          />
        )}
      </button>
    );
  }

  return (
    <div className={`absolute right-4 top-12 z-50 w-64 rounded-[24px] p-3 ${WORKSPACE_SURFACE.panelStrong}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-xs font-medium ${WORKSPACE_TEXT.body}`}>테마 선택</span>
        <button onClick={() => setOpen(false)} className={`text-xs ${WORKSPACE_TEXT.muted} hover:text-[#4D433D]`}>
          닫기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              onThemeChange(preset.name === "default" ? undefined : preset.palette);
              setOpen(false);
            }}
            className={`flex items-center gap-2 rounded-2xl border px-2 py-1.5 text-left text-xs transition-colors ${
              currentName === preset.name
                ? WORKSPACE_CONTROL.accentTint
                : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
            }`}
          >
            <div className="flex gap-0.5">
              {[preset.palette.primary, preset.palette.secondary, preset.palette.accent].map((c, i) => (
                <span
                  key={i}
                  className="inline-block h-3 w-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            {preset.label}
          </button>
        ))}
      </div>

      {currentTheme && (
        <div className="mt-2 space-y-1.5 border-t border-[#EEE6DC] pt-2">
          <p className={`text-[10px] font-medium ${WORKSPACE_TEXT.muted}`}>커스텀 색상</p>
          <div className="grid grid-cols-5 gap-1">
            {(["primary", "secondary", "background", "text", "accent"] as const).map((key) => (
              <div key={key} className="text-center">
                <input
                  type="color"
                  value={currentTheme[key]}
                  onChange={(e) => onThemeChange({ ...currentTheme, [key]: e.target.value })}
                  className="h-6 w-full cursor-pointer rounded-xl border border-[#E4D9CD]"
                />
                <span className={`text-[9px] ${WORKSPACE_TEXT.muted}`}>{key === "primary" ? "메인" : key === "secondary" ? "보조" : key === "background" ? "배경" : key === "text" ? "글자" : "강조"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
