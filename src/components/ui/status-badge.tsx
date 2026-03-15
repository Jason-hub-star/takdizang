/** 프로젝트 상태를 시각적으로 표시하는 배지 컴포넌트 */
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[rgb(238_231_222_/_0.92)] text-[#7D7168]",
  generating: "bg-[rgb(250_229_222_/_0.94)] text-[var(--takdi-accent-strong)]",
  generated: "bg-[rgb(232_242_233_/_0.94)] text-[#5D7D66]",
  exported: "bg-[rgb(232_236_239_/_0.94)] text-[#55646F]",
  failed: "bg-[rgb(247_226_226_/_0.94)] text-[#AD5C5C]",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "초안",
  generating: "생성 중...",
  generated: "생성 완료",
  exported: "내보내기 완료",
  failed: "실패",
  running: "진행 중",
  done: "완료",
  error: "오류",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: "idle" | "working" | "done" | "error";
  className?: string;
}

const TONE_STYLES: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  idle: "bg-[rgb(238_231_222_/_0.92)] text-[#7D7168]",
  working: "bg-[rgb(250_229_222_/_0.94)] text-[var(--takdi-accent-strong)]",
  done: "bg-[rgb(232_242_233_/_0.94)] text-[#5D7D66]",
  error: "bg-[rgb(247_226_226_/_0.94)] text-[#AD5C5C]",
};

export function StatusBadge({ status, label, tone, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/40 px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        tone ? TONE_STYLES[tone] : STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600",
        className
      )}
    >
      {label ?? STATUS_LABELS[status] ?? "알 수 없음"}
    </span>
  );
}
