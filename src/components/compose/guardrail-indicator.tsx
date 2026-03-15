/** 가드레일 위반 표시 — 블록 우측 경고 아이콘 + 자동 수정 버튼 */
"use client";

import { AlertTriangle, Wrench } from "lucide-react";
import type { GuardrailViolation } from "@/lib/design-guardrails";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface GuardrailIndicatorProps {
  violations: GuardrailViolation[];
  onAutoFix?: (violation: GuardrailViolation) => void;
}

export function GuardrailIndicator({ violations, onAutoFix }: GuardrailIndicatorProps) {
  if (violations.length === 0) return null;

  return (
    <div className="absolute -right-8 top-2 z-10 group/guard">
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgb(230_203_177_/_0.92)] bg-[rgb(247_239_229_/_0.96)] text-[rgb(184_121_78)] shadow-[0_10px_20px_rgba(80,54,34,0.12)]">
        <AlertTriangle className="h-3.5 w-3.5" />
      </div>
      <div className={`absolute right-8 top-0 hidden w-64 rounded-[20px] p-2 group-hover/guard:block ${WORKSPACE_SURFACE.panelStrong}`}>
        {violations.map((v, i) => (
          <div key={i} className="mb-1.5 last:mb-0">
            <p className={`text-xs ${WORKSPACE_TEXT.body}`}>{v.message}</p>
            {v.autoFixable && onAutoFix && (
              <button
                onClick={(e) => { e.stopPropagation(); onAutoFix(v); }}
                className={`mt-1 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${WORKSPACE_CONTROL.accentTint}`}
              >
                <Wrench className="h-3 w-3" />
                자동 수정
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
