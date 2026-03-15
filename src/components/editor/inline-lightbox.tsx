"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppImage } from "@/components/ui/app-image";

interface InlineLightboxProps {
  src: string;
  onClose: () => void;
}

export function InlineLightbox({ src, onClose }: InlineLightboxProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="relative"
        style={{ width: "min(80vw, 960px)", height: "min(80vh, 720px)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <AppImage
          src={src}
          alt="Preview image"
          fill
          sizes="80vw"
          className="rounded-xl object-contain"
        />
      </div>
    </div>,
    document.body,
  );
}
