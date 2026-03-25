"use client";

import { useState } from "react";
import { ArrowUpRight, Upload } from "lucide-react";
import { ModeCard } from "@/components/home/mode-card";
import { DirectUploadLauncher } from "@/components/layout/direct-upload-launcher";
import { START_MODE_DEFINITIONS } from "@/features/workspace-hub/start-modes";
import { useT } from "@/i18n/use-t";

export function HomeStartGrid() {
  const { messages } = useT();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {START_MODE_DEFINITIONS.map((mode) => (
          <ModeCard
            key={mode.mode}
            mode={mode.mode}
            label={mode.label}
            description={mode.description}
            editorMode={mode.editorMode}
          />
        ))}

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="group flex min-h-[168px] min-w-0 flex-col rounded-[1.8rem] border border-dashed border-[rgb(213_196_180_/_0.92)] bg-[linear-gradient(135deg,rgba(248,243,237,0.92),rgba(255,255,255,0.65))] p-6 text-left shadow-[0_18px_36px_rgba(80,54,34,0.05)] transition duration-200 hover:-translate-y-1 hover:border-[rgb(217_124_103_/_0.75)] hover:bg-white"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border border-[rgb(230_216_203_/_0.92)] bg-white text-[var(--takdi-text-muted)] transition group-hover:border-[rgb(241_197_186_/_0.95)] group-hover:bg-[rgb(249_231_226_/_0.95)] group-hover:text-[var(--takdi-accent-strong)]">
              <Upload className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="takdi-kicker">Direct upload</p>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[17px] font-semibold tracking-[-0.03em] text-[var(--takdi-text)]">
                  {messages.home.directUploadTitle}
                </p>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--takdi-text-subtle)] transition group-hover:text-[var(--takdi-accent-strong)]" />
              </div>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--takdi-text-muted)]">
                {messages.home.directUploadDescription}
              </p>
            </div>
          </div>
        </button>
      </div>

      <DirectUploadLauncher open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
