/** Application-level message provider for the current single-locale setup. */
"use client";

import { createContext, useMemo } from "react";
import type { MessageSchema } from "./schema";

export const I18nContext = createContext<MessageSchema | null>(null);

interface I18nProviderProps {
  messages: MessageSchema;
  children: React.ReactNode;
}

export function I18nProvider({ messages, children }: I18nProviderProps) {
  const value = useMemo(() => messages, [messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
