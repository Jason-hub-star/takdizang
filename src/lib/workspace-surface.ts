export const WORKSPACE_SURFACE = {
  page: "bg-transparent text-[var(--takdi-text)]",
  panel: "takdi-panel",
  panelStrong: "takdi-panel-strong",
  panelMuted: "takdi-panel-soft",
  toolbar:
    "border border-[rgb(214_199_184_/_0.76)] bg-[rgb(255_252_247_/_0.84)] shadow-[0_14px_34px_rgba(80,54,34,0.06)] backdrop-blur-xl",
  floating:
    "border border-[rgb(214_199_184_/_0.82)] bg-[rgb(255_255_255_/_0.78)] shadow-[0_18px_38px_rgba(80,54,34,0.08)] backdrop-blur-xl",
  inset:
    "border border-[rgb(214_199_184_/_0.74)] bg-[rgb(255_255_255_/_0.72)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
  softInset:
    "border border-[rgb(219_205_190_/_0.86)] bg-[rgb(248_241_232_/_0.78)] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]",
} as const;

export const WORKSPACE_TEXT = {
  title: "text-[var(--takdi-text)]",
  body: "text-[var(--takdi-text-muted)]",
  muted: "text-[var(--takdi-text-subtle)]",
  accent: "text-[var(--takdi-accent-strong)]",
} as const;

export const WORKSPACE_CONTROL = {
  input:
    "border border-[rgb(214_199_184_/_0.84)] bg-[rgb(255_255_255_/_0.84)] text-[var(--takdi-text)] placeholder:text-[var(--takdi-text-subtle)] outline-none transition focus:border-[var(--takdi-accent)] focus:ring-2 focus:ring-[rgb(244_222_213_/_0.9)]",
  ghostButton:
    "text-[var(--takdi-text-muted)] hover:bg-[rgb(247_239_231_/_0.92)] hover:text-[var(--takdi-text)]",
  subtleButton:
    "border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.84)] text-[var(--takdi-text)] hover:bg-[rgb(248_241_232_/_0.82)] hover:text-[var(--takdi-text)]",
  accentButton:
    "bg-[var(--takdi-accent)] text-white shadow-[var(--takdi-shadow-accent-lg)] hover:bg-[var(--takdi-accent-strong)]",
  accentTint:
    "border-[var(--takdi-accent-tint-border)] bg-[var(--takdi-accent-tint-bg)] text-[var(--takdi-accent-strong)]",
  darkChip:
    "border-[rgb(84_64_50_/_0.18)] bg-[linear-gradient(135deg,#2b2420,#46362d)] text-white shadow-[0_18px_36px_rgba(40,26,18,0.22)]",
  pill:
    "border border-[rgb(214_199_184_/_0.82)] bg-[rgb(248_241_232_/_0.8)] text-[var(--takdi-text-muted)]",
  pillActive:
    "border border-[var(--takdi-accent-tint-border)] bg-[var(--takdi-accent-tint-bg)] text-[var(--takdi-accent-strong)] shadow-[var(--takdi-shadow-accent-pill)]",
} as const;

