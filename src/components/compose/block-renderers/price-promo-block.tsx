/** 가격/프로모션 블록 — 정가·할인가·할인율·뱃지·기간 한정 표시 */
"use client";

import type { PricePromoBlock } from "@/types/blocks";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { EditableText } from "../shared";

interface Props {
  block: PricePromoBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<PricePromoBlock>) => void;
  readOnly?: boolean;
}

function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

function calcDiscountRate(original: number, sale: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function PricePromoBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const discountRate = calcDiscountRate(block.originalPrice, block.salePrice);

  return (
    <div
      className={`w-full p-6 ${selected ? "takdi-block takdi-block-selected takdi-block-selected-fill" : "takdi-block takdi-block-default"}`}
      onClick={onSelect}
    >
      {/* Badge */}
      {(block.badge || !readOnly) && (
        <div className="mb-3 flex items-center gap-2">
          <EditableText
            value={block.badge ?? ""}
            placeholder="한정특가"
            onChange={(v) => onUpdate({ badge: v })}
            className="inline-block rounded-full border border-[var(--takdi-accent-tint-border)] bg-[var(--takdi-accent)] px-3 py-1 text-xs font-bold text-white shadow-[var(--takdi-shadow-accent-md)]"
            tag="span"
            readOnly={readOnly}
          />
        </div>
      )}

      {/* Product name */}
      <EditableText
        value={block.productName}
        placeholder="상품명을 입력하세요"
        onChange={(v) => onUpdate({ productName: v })}
        className={`mb-3 text-lg font-bold ${WORKSPACE_TEXT.title}`}
        tag="h3"
        readOnly={readOnly}
      />

      {/* Price area */}
      <div className="flex items-end gap-3">
        {discountRate > 0 && (
          <span className="text-2xl font-extrabold text-[var(--takdi-accent-strong)]">{discountRate}%</span>
        )}
        <div>
          {block.originalPrice > 0 && block.originalPrice !== block.salePrice && (
            <p className={`text-sm line-through ${WORKSPACE_TEXT.muted}`}>
              {formatPrice(block.originalPrice)}원
            </p>
          )}
          {readOnly ? (
            <p className={`text-2xl font-bold ${WORKSPACE_TEXT.title}`}>{formatPrice(block.salePrice)}원</p>
          ) : (
            <div className="flex items-center gap-2">
              <label className={`text-xs ${WORKSPACE_TEXT.muted}`}>정가</label>
              <input
                type="number"
                value={block.originalPrice}
                onChange={(e) => onUpdate({ originalPrice: Number(e.target.value) })}
                onClick={(e) => e.stopPropagation()}
                className={`w-28 rounded-xl px-2 py-1 text-sm ${WORKSPACE_CONTROL.input}`}
                min={0}
              />
              <label className={`text-xs ${WORKSPACE_TEXT.muted}`}>판매가</label>
              <input
                type="number"
                value={block.salePrice}
                onChange={(e) => onUpdate({ salePrice: Number(e.target.value) })}
                onClick={(e) => e.stopPropagation()}
                className={`w-28 rounded-xl px-2 py-1 text-sm ${WORKSPACE_CONTROL.input}`}
                min={0}
              />
            </div>
          )}
        </div>
      </div>

      {/* Expires label */}
      {(block.expiresLabel || !readOnly) && (
        <EditableText
          value={block.expiresLabel ?? ""}
          placeholder="기간 한정 (예: ~3/15까지)"
          onChange={(v) => onUpdate({ expiresLabel: v })}
          className="mt-3 text-xs text-[var(--takdi-accent-strong)]"
          tag="p"
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
