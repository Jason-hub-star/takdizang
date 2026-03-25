/** 스펙 테이블 블록 — 행별 label/value 인라인 편집 + 행 추가/삭제 */
"use client";

import type { SpecTableBlock } from "@/types/blocks";
import { X, Plus } from "lucide-react";
import { WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { EditableText } from "../shared";

interface Props {
  block: SpecTableBlock;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<SpecTableBlock>) => void;
  readOnly?: boolean;
}

export function SpecTableBlockRenderer({ block, selected, onSelect, onUpdate, readOnly }: Props) {
  const updateRow = (index: number, patch: Partial<{ label: string; value: string }>) => {
    const rows = block.rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onUpdate({ rows });
  };

  const deleteRow = (index: number) => {
    if (block.rows.length <= 1) return;
    onUpdate({ rows: block.rows.filter((_, i) => i !== index) });
  };

  const addRow = () => {
    onUpdate({ rows: [...block.rows, { label: "항목", value: "값" }] });
  };

  return (
    <div
      className={`w-full p-6 ${selected ? "takdi-block takdi-block-selected takdi-block-selected-fill" : "takdi-block takdi-block-default"}`}
      onClick={onSelect}
    >
      <EditableText
        value={block.title}
        placeholder="테이블 제목"
        onChange={(v) => onUpdate({ title: v })}
        className={`mb-3 text-base font-bold ${WORKSPACE_TEXT.title}`}
        tag="h3"
        readOnly={readOnly}
      />
      <table className="w-full text-sm">
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} className={`group/row ${i % 2 === 0 ? "bg-[var(--takdi-soft-bg)]" : ""}`}>
              <td className={`px-3 py-2 font-medium ${WORKSPACE_TEXT.title}`}>
                <EditableText
                  value={row.label}
                  placeholder="항목명"
                  onChange={(v) => updateRow(i, { label: v })}
                  className={`font-medium ${WORKSPACE_TEXT.title}`}
                  tag="span"
                  readOnly={readOnly}
                />
              </td>
              <td className={`px-3 py-2 ${WORKSPACE_TEXT.body}`}>
                <EditableText
                  value={row.value}
                  placeholder="값"
                  onChange={(v) => updateRow(i, { value: v })}
                  className={WORKSPACE_TEXT.body}
                  tag="span"
                  readOnly={readOnly}
                />
              </td>
              {!readOnly && (
                <td className="w-8 px-1 py-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteRow(i); }}
                    className="flex h-5 w-5 items-center justify-center rounded text-[rgb(196_182_170)] opacity-0 transition-opacity hover:text-[var(--takdi-delete-text)] group-hover/row:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!readOnly && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addRow(); }}
          className="mx-auto mt-3 flex items-center gap-1 rounded-full takdi-add-button px-3 py-1.5 text-xs"
        >
          <Plus className="h-3 w-3" /> 행 추가
        </button>
      )}
    </div>
  );
}
