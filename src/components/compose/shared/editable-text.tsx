/** EditableText - contentEditable + data-placeholder 자동 표시/클리어 */
"use client";

import { useRef, useCallback, useEffect } from "react";

interface EditableTextProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tag?: "h2" | "h3" | "p" | "span";
  readOnly?: boolean;
}

export function EditableText({
  value,
  placeholder,
  onChange,
  className = "",
  style,
  tag: Tag = "p",
  readOnly,
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const handleBlur = useCallback(() => {
    const text = ref.current?.textContent ?? "";
    if (text !== value) {
      onChange(text);
    }
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && Tag !== "p") {
      e.preventDefault();
      ref.current?.blur();
    }
  }, [Tag]);

  if (readOnly) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement & HTMLParagraphElement>}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      style={style}
      className={`outline-none ${className}`}
    />
  );
}
