/** 인증/뱃지 블록 — 인증 마크·수상 이력·안전 인증 아이콘 나열 */
"use client";

import type { TrustBadgeBlock } from "@/types/blocks";
import { Plus, X } from "lucide-react";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { EditableText } from "../shared";

interface Props {
  block: TrustBadgeBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<TrustBadgeBlock>) => void;
  readOnly?: boolean;
}

const BADGE_ICONS = [
  { value: "check-circle", label: "인증", emoji: "✅" },
  { value: "shield", label: "안전", emoji: "🛡️" },
  { value: "award", label: "수상", emoji: "🏆" },
  { value: "leaf", label: "유기농", emoji: "🌿" },
  { value: "heart", label: "건강", emoji: "❤️" },
  { value: "star", label: "우수", emoji: "⭐" },
  { value: "lock", label: "보안", emoji: "🔒" },
  { value: "thumbs-up", label: "추천", emoji: "👍" },
  { value: "lab", label: "시험", emoji: "🧪" },
  { value: "globe", label: "국제", emoji: "🌐" },
];

function getBadgeEmoji(icon: string): string {
  return BADGE_ICONS.find((b) => b.value === icon)?.emoji ?? "✅";
}

export function TrustBadgeBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const updateBadge = (index: number, patch: Partial<TrustBadgeBlock["badges"][0]>) => {
    const badges = block.badges.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onUpdate({ badges });
  };

  const deleteBadge = (index: number) => {
    if (block.badges.length <= 1) return;
    onUpdate({ badges: block.badges.filter((_, i) => i !== index) });
  };

  const addBadge = () => {
    if (block.badges.length >= 8) return;
    onUpdate({
      badges: [...block.badges, { icon: "check-circle", label: "인증 마크" }],
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
      <EditableText
        value={block.title}
        placeholder="인증 및 수상"
        onChange={(v) => onUpdate({ title: v })}
        className={`mb-4 text-center text-lg font-bold ${WORKSPACE_TEXT.title}`}
        tag="h3"
        readOnly={readOnly}
      />

      <div className="flex flex-wrap items-center justify-center gap-4">
        {block.badges.map((badge, idx) => (
          <div key={idx} className="group/badge relative flex flex-col items-center gap-1.5">
            {/* Icon */}
            {readOnly ? (
              <span className="text-3xl">{getBadgeEmoji(badge.icon)}</span>
            ) : (
              <select
                value={badge.icon}
                onChange={(e) => updateBadge(idx, { icon: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className={`rounded-xl px-2 py-1 text-lg ${WORKSPACE_CONTROL.input}`}
              >
                {BADGE_ICONS.map((bi) => (
                  <option key={bi.value} value={bi.value}>
                    {bi.emoji} {bi.label}
                  </option>
                ))}
              </select>
            )}

            <EditableText
              value={badge.label}
              placeholder="인증명"
              onChange={(v) => updateBadge(idx, { label: v })}
              className={`text-center text-xs font-medium ${WORKSPACE_TEXT.body}`}
              tag="span"
              readOnly={readOnly}
            />

            {/* Delete */}
            {!readOnly && block.badges.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteBadge(idx); }}
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[rgb(236_201_201_/_0.95)] bg-[rgb(248_230_230_/_0.95)] text-[#B45A52] opacity-0 transition-opacity group-hover/badge:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && block.badges.length < 8 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addBadge(); }}
          className="mx-auto mt-4 flex items-center gap-1 rounded-full border border-dashed border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.72)] px-3 py-1.5 text-xs text-[var(--takdi-text-subtle)] transition-colors hover:border-[rgb(236_197_183_/_0.95)] hover:text-[var(--takdi-accent-strong)]"
        >
          <Plus className="h-3 w-3" /> 뱃지 추가
        </button>
      )}
    </div>
  );
}
