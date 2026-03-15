"use client";

import { forwardRef, type CSSProperties } from "react";
import type { ThemePalette } from "@/types/blocks";

interface BlockSurfaceFrameProps {
  children: React.ReactNode;
  platformWidth: number;
  mobilePreview?: boolean;
  theme?: ThemePalette;
  className?: string;
  style?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

type ThemeStyle = CSSProperties & Record<string, string>;

export function buildThemeStyle(theme?: ThemePalette): CSSProperties | undefined {
  if (!theme) {
    return undefined;
  }

  return {
    "--theme-primary": theme.primary,
    "--theme-secondary": theme.secondary,
    "--theme-bg": theme.background,
    "--theme-text": theme.text,
    "--theme-accent": theme.accent,
    "--theme-card-bg": `color-mix(in srgb, ${theme.background} 86%, white 14%)`,
    "--theme-soft-bg": `color-mix(in srgb, ${theme.secondary} 38%, ${theme.background} 62%)`,
    "--theme-soft-bg-strong": `color-mix(in srgb, ${theme.secondary} 58%, ${theme.background} 42%)`,
    "--theme-card-border": `color-mix(in srgb, ${theme.primary} 16%, ${theme.background} 84%)`,
    "--theme-muted": `color-mix(in srgb, ${theme.text} 68%, ${theme.background} 32%)`,
    "--theme-accent-soft": `color-mix(in srgb, ${theme.accent} 14%, ${theme.background} 86%)`,
    "--theme-accent-border": `color-mix(in srgb, ${theme.accent} 32%, ${theme.background} 68%)`,
    "--theme-accent-strong": theme.accent,
    backgroundColor: theme.background,
    color: theme.text,
  } as ThemeStyle;
}

export const BlockSurfaceFrame = forwardRef<HTMLDivElement, BlockSurfaceFrameProps>(
  function BlockSurfaceFrame(
    { children, platformWidth, mobilePreview, theme, className = "", style, onClick },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-mobile-preview={mobilePreview ? "true" : "false"}
        className={`compose-themed-surface mx-auto ${mobilePreview ? "overflow-hidden rounded-[2rem] border-[3px] border-[#D5CCC3] shadow-[0_20px_40px_rgba(55,40,30,0.12)]" : ""} ${className}`.trim()}
        style={{
          width: mobilePreview ? 375 : platformWidth,
          maxWidth: "100%",
          ...buildThemeStyle(theme),
          ...style,
        }}
        onClick={onClick}
      >
        {children}
      </div>
    );
  },
);
