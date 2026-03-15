"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Type } from "lucide-react";
import { FONT_PRESETS, type FontPreset } from "@/lib/constants";
import { loadEditorFonts } from "@/lib/font-loader";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

type Category = "all" | "gothic" | "serif" | "display";

const CATEGORY_LABELS: Record<Category, string> = {
  all: "All",
  gothic: "Sans",
  serif: "Serif",
  display: "Display",
};

interface FontPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("all");
  const ref = useRef<HTMLDivElement>(null);

  const current = FONT_PRESETS.find((font) => font.value === value) ?? FONT_PRESETS[0];
  const filtered = category === "all" ? FONT_PRESETS : FONT_PRESETS.filter((font) => font.category === category);

  useEffect(() => {
    if (!open) {
      return;
    }

    loadEditorFonts();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm ${WORKSPACE_CONTROL.input}`}
      >
        <span className="flex items-center gap-1.5">
          <Type className={`h-3.5 w-3.5 ${WORKSPACE_TEXT.muted}`} />
          <span style={{ fontFamily: current.family }}>{current.label}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 ${WORKSPACE_TEXT.muted} transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className={`absolute left-0 top-full z-50 mt-2 w-64 rounded-[24px] ${WORKSPACE_SURFACE.panelStrong}`}>
          <div className="flex border-b border-[#EEE6DC] px-1 pt-1">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-t px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  category === cat ? WORKSPACE_CONTROL.accentTint : `${WORKSPACE_TEXT.body} hover:text-[#201A17]`
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

        <div className="max-h-56 overflow-y-auto p-1.5">
            {filtered.map((preset) => (
              <FontOption
                key={preset.value}
                preset={preset}
                selected={preset.value === (value ?? "default")}
                onSelect={() => {
                  onChange(preset.value);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FontOption({
  preset,
  selected,
  onSelect,
}: {
  preset: FontPreset;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-2xl px-2.5 py-2 text-left transition-colors ${
        selected ? WORKSPACE_CONTROL.accentTint : "hover:bg-[#F8F4EF]"
      }`}
    >
      <div>
        <div className={`text-xs ${WORKSPACE_TEXT.body}`}>{preset.label}</div>
        <div className="mt-0.5 text-sm" style={{ fontFamily: `${preset.family}, sans-serif` }}>
          Sample text ABC 123
        </div>
      </div>
      {selected ? <div className="h-2 w-2 rounded-full bg-[#D97C67]" /> : null}
    </button>
  );
}
