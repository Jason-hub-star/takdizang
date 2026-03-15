/** Typed message access hook with optional dotted-path lookup. */
"use client";

import { useContext } from "react";
import { I18nContext } from "./provider";
import type { MessageSchema } from "./schema";

function getByPath(messages: MessageSchema, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, messages);
}

export function useT() {
  const messages = useContext(I18nContext);

  if (!messages) {
    throw new Error("useT must be used within I18nProvider");
  }

  return {
    messages,
    t(path: string) {
      const value = getByPath(messages, path);
      if (typeof value !== "string") {
        throw new Error(`Message path "${path}" does not resolve to a string`);
      }
      return value;
    },
  };
}
