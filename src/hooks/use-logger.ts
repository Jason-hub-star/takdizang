/** Log management hook for BottomLogger component. */
"use client";

import { useState, useCallback } from "react";

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: "info" | "warn" | "error";
}

export function useLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string, level: LogEntry["level"] = "info") => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour12: false }),
      message,
      level,
    };
    setLogs((prev) => [...prev, entry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs };
}
