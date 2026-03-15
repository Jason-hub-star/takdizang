/** ComposeContext - projectId 등 블록 렌더러 공용 컨텍스트 */
"use client";

import { createContext, useContext, useMemo } from "react";
import type { ThemePalette } from "@/types/blocks";

interface ComposeContextValue {
  projectId: string;
  theme?: ThemePalette;
}

const ComposeContext = createContext<ComposeContextValue | null>(null);

export function ComposeProvider({
  projectId,
  theme,
  children,
}: {
  projectId: string;
  theme?: ThemePalette;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ projectId, theme }), [projectId, theme]);
  return (
    <ComposeContext.Provider value={value}>
      {children}
    </ComposeContext.Provider>
  );
}

export function useCompose(): ComposeContextValue {
  const ctx = useContext(ComposeContext);
  if (!ctx) throw new Error("useCompose must be used within ComposeProvider");
  return ctx;
}
