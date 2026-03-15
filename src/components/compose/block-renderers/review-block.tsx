/** 리뷰 블록 — 3가지 displayStyle + 별점 클릭 + 리뷰 추가/삭제 + 인라인 편집 */
"use client";

import type { ReviewBlock } from "@/types/blocks";
import { X, Plus } from "lucide-react";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { EditableText } from "../shared";

interface Props {
  block: ReviewBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<ReviewBlock>) => void;
  readOnly?: boolean;
}

function StarRating({ rating, onChange, readOnly }: { rating: number; onChange: (r: number) => void; readOnly?: boolean }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={(e) => { e.stopPropagation(); if (!readOnly) onChange(n); }}
          className={`text-sm ${readOnly ? "cursor-default" : "cursor-pointer"} ${n <= rating ? "text-[#D99A4C]" : "text-[rgb(207_194_182)]"}`}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export function ReviewBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const style = block.displayStyle ?? "card";

  const updateReview = (index: number, patch: Partial<ReviewBlock["reviews"][0]>) => {
    const reviews = block.reviews.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onUpdate({ reviews });
  };

  const deleteReview = (index: number) => {
    if (block.reviews.length <= 1) return;
    onUpdate({ reviews: block.reviews.filter((_, i) => i !== index) });
  };

  const addReview = () => {
    onUpdate({
      reviews: [...block.reviews, { author: "고객", rating: 5, text: "리뷰를 입력하세요" }],
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
        placeholder="리뷰 제목"
        onChange={(v) => onUpdate({ title: v })}
        className={`mb-3 text-base font-bold ${WORKSPACE_TEXT.title}`}
        tag="h3"
        readOnly={readOnly}
      />
      <div className="space-y-3">
        {block.reviews.map((review, i) => (
          <div
            key={i}
            className={`group/review relative ${
              style === "card" ? `${WORKSPACE_SURFACE.softInset} rounded-[22px] p-3` :
              style === "quote" ? "border-l-4 border-[rgb(236_197_183_/_0.95)] bg-[rgb(252_247_242_/_0.72)] pl-4 py-2 pr-3" :
              style === "bubble" ? "rounded-[24px] border border-[rgb(236_197_183_/_0.9)] bg-[rgb(248_231_226_/_0.84)] p-4 before:absolute before:-bottom-2 before:left-6 before:h-4 before:w-4 before:rotate-45 before:border-r before:border-b before:border-[rgb(236_197_183_/_0.9)] before:bg-[rgb(248_231_226_/_0.84)]" :
              "py-2"
            }`}
          >
            {!readOnly && block.reviews.length > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); deleteReview(i); }}
                className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[rgb(236_201_201_/_0.95)] bg-[rgb(248_230_230_/_0.95)] text-[#B45A52] opacity-0 transition-opacity group-hover/review:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <div className="mb-1 flex items-center gap-2">
              <EditableText
                value={review.author}
                placeholder="작성자"
                onChange={(v) => updateReview(i, { author: v })}
                className={`text-sm font-medium ${WORKSPACE_TEXT.title}`}
                tag="span"
                readOnly={readOnly}
              />
              <StarRating
                rating={review.rating}
                onChange={(r) => updateReview(i, { rating: r })}
                readOnly={readOnly}
              />
            </div>
            {style === "quote" ? (
              <EditableText
                value={review.text}
                placeholder="리뷰 내용"
                onChange={(v) => updateReview(i, { text: v })}
                className={`text-sm italic ${WORKSPACE_TEXT.body}`}
                tag="p"
                readOnly={readOnly}
              />
            ) : (
              <EditableText
                value={review.text}
                placeholder="리뷰 내용"
                onChange={(v) => updateReview(i, { text: v })}
                className={`text-sm ${WORKSPACE_TEXT.body}`}
                tag="p"
                readOnly={readOnly}
              />
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addReview(); }}
          className="mx-auto mt-3 flex items-center gap-1 rounded-full border border-dashed border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.72)] px-3 py-1.5 text-xs text-[var(--takdi-text-subtle)] transition-colors hover:border-[rgb(236_197_183_/_0.95)] hover:text-[var(--takdi-accent-strong)]"
        >
          <Plus className="h-3 w-3" /> 리뷰 추가
        </button>
      )}
    </div>
  );
}
