/** 셀링포인트 블록 — 아이콘 선택 + 항목 추가/삭제 + EditableText */
"use client";

import { useState, useEffect, useRef } from "react";
import type { SellingPointBlock as SellingPointBlockType } from "@/types/blocks";
import { Star, Zap, Shield, Heart, Check, Award, Target, Flame, ThumbsUp, Sparkles, Eye, Clock, X, Plus, ChevronDown } from "lucide-react";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { EditableText } from "../shared";

const ICON_MAP: Record<string, { icon: React.ElementType; label: string }> = {
  star: { icon: Star, label: "별" },
  zap: { icon: Zap, label: "번개" },
  shield: { icon: Shield, label: "방패" },
  heart: { icon: Heart, label: "하트" },
  check: { icon: Check, label: "체크" },
  award: { icon: Award, label: "상" },
  target: { icon: Target, label: "타겟" },
  flame: { icon: Flame, label: "불꽃" },
  thumbsUp: { icon: ThumbsUp, label: "좋아요" },
  sparkles: { icon: Sparkles, label: "반짝" },
  eye: { icon: Eye, label: "눈" },
  clock: { icon: Clock, label: "시계" },
};

interface Props {
  block: SellingPointBlockType;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<SellingPointBlockType>) => void;
  readOnly?: boolean;
}

function IconSelector({ current, onSelect }: { current: string; onSelect: (icon: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(236_197_183_/_0.95)] bg-[rgb(248_231_226_/_0.95)] text-[var(--takdi-accent-strong)] shadow-[0_10px_22px_rgba(217,124,103,0.12)] transition-colors hover:bg-[rgb(246_223_215_/_0.95)]"
      >
        {(() => {
          const entry = ICON_MAP[current];
          const Icon = entry?.icon ?? Star;
          return <Icon className="h-6 w-6" />;
        })()}
        <ChevronDown className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-white text-[var(--takdi-text-subtle)]" />
      </button>
      {open && (
        <div className={`absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 rounded-[20px] p-2 shadow-lg ${WORKSPACE_SURFACE.floating}`} style={{ minWidth: 180 }}>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(ICON_MAP).map(([key, { icon: Icon, label }]) => (
              <button
                key={key}
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelect(key); setOpen(false); }}
                className={`flex h-10 w-full flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                  key === current
                    ? "border border-[rgb(236_197_183_/_0.95)] bg-[rgb(248_231_226_/_0.95)] text-[var(--takdi-accent-strong)]"
                    : "text-[var(--takdi-text-muted)] hover:bg-[rgb(247_239_231_/_0.92)]"
                }`}
                title={label}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-none">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SellingPointBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const updateItem = (index: number, patch: Partial<SellingPointBlockType["items"][0]>) => {
    const items = block.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onUpdate({ items });
  };

  const deleteItem = (index: number) => {
    if (block.items.length <= 1) return;
    onUpdate({ items: block.items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    if (block.items.length >= 4) return;
    onUpdate({
      items: [...block.items, { icon: "star", title: "새 포인트", description: "설명을 입력하세요" }],
    });
  };

  return (
    <div
      className={`w-full rounded-[28px] border p-6 transition-colors ${
        selected
          ? "border-[rgb(236_197_183_/_0.95)] bg-[rgb(255_249_245_/_0.96)] shadow-[0_16px_36px_rgba(217,124,103,0.12)]"
          : `${WORKSPACE_SURFACE.panel} hover:border-[rgb(215_201_188_/_0.94)]`
      }`}
      onClick={onSelect}
    >
      <div className={`${block.layout === "horizontal" ? "flex gap-4 overflow-x-auto" : `grid gap-6 ${block.items.length === 1 ? "grid-cols-1" : block.items.length === 2 ? "grid-cols-2" : block.items.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}`}>
        {block.items.map((item, idx) => (
          <div key={idx} className={`group/item relative flex flex-col items-center gap-2 text-center ${block.layout === "horizontal" ? "shrink-0" : ""}`}>
            {!readOnly && block.items.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[rgb(236_201_201_/_0.95)] bg-[rgb(248_230_230_/_0.95)] text-[#B45A52] opacity-0 transition-opacity group-hover/item:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            {readOnly ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(236_197_183_/_0.95)] bg-[rgb(248_231_226_/_0.95)] text-[var(--takdi-accent-strong)]">
                {(() => { const Icon = ICON_MAP[item.icon]?.icon ?? Star; return <Icon className="h-6 w-6" />; })()}
              </div>
            ) : (
              <IconSelector current={item.icon} onSelect={(icon) => updateItem(idx, { icon })} />
            )}
            <EditableText
              value={item.title}
              placeholder="포인트 제목"
              onChange={(v) => updateItem(idx, { title: v })}
              className={`text-base font-bold ${WORKSPACE_TEXT.title}`}
              tag="h3"
              readOnly={readOnly}
            />
            <EditableText
              value={item.description}
              placeholder="설명"
              onChange={(v) => updateItem(idx, { description: v })}
              className={`text-sm ${WORKSPACE_TEXT.body}`}
              tag="p"
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>

      {!readOnly && block.items.length < 4 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addItem(); }}
          className="mx-auto mt-4 flex items-center gap-1 rounded-full border border-dashed border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.72)] px-3 py-1.5 text-xs text-[var(--takdi-text-subtle)] transition-colors hover:border-[rgb(236_197_183_/_0.95)] hover:text-[var(--takdi-accent-strong)]"
        >
          <Plus className="h-3 w-3" /> 포인트 추가
        </button>
      )}
      {!readOnly && block.items.length >= 4 && (
        <p className={`mt-3 text-center text-xs ${WORKSPACE_TEXT.muted}`}>최대 4개까지 추가할 수 있습니다</p>
      )}
    </div>
  );
}
