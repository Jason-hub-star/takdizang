/** BlockTextGenerator - 블록별 AI 문구 생성 버튼 */
"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCompose } from "../compose-context";
import { generateBlockText } from "@/lib/api-client";
import { WORKSPACE_CONTROL, WORKSPACE_TEXT } from "@/lib/workspace-surface";

interface BlockTextGeneratorProps {
  blockType: string;
  context?: string;
  onResult: (result: Record<string, unknown>) => void;
  label?: string;
}

export function BlockTextGenerator({
  blockType,
  context,
  onResult,
  label = "AI로 작성",
}: BlockTextGeneratorProps) {
  const { projectId } = useCompose();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await generateBlockText(projectId, { blockType, context });
      onResult(res.result);
      toast.success("AI 문구가 생성되었습니다");
    } catch {
      toast.error("AI 문구 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      title={label}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${WORKSPACE_CONTROL.accentTint} hover:bg-[rgb(246_223_216_/_0.9)] disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className={`h-3.5 w-3.5 animate-spin ${WORKSPACE_TEXT.accent}`} />
      ) : (
        <Sparkles className={`h-3.5 w-3.5 ${WORKSPACE_TEXT.accent}`} />
      )}
      {label}
    </button>
  );
}
