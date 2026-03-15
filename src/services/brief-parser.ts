import type { GenerationResult, GenerationResultSection } from "@/types";

export interface BriefParseOptions {
  defaultStyleKey?: string;
}

/**
 * Parse raw brief text into structured GenerationResult sections.
 * 3-pass algorithm: split → extract headline/body → assign slots.
 */
export function parseBrief(
  text: string,
  options?: BriefParseOptions
): GenerationResult {
  const styleKey = options?.defaultStyleKey ?? "default";
  const trimmed = text.trim();

  if (!trimmed) {
    return { sections: [] };
  }

  // Pass 1: Split into raw blocks
  const blocks = splitIntoBlocks(trimmed);

  // Pass 2 & 3: Extract headline/body and assign slots
  const sections: GenerationResultSection[] = blocks.map((block, i) => {
    const { headline, body } = extractHeadlineAndBody(block, i + 1);
    return {
      headline,
      body,
      imageSlot: `slot-${i + 1}`,
      styleKey,
    };
  });

  return { sections };
}

/** Split text into blocks by headings or blank lines. */
function splitIntoBlocks(text: string): string[] {
  // Check if markdown headings exist
  const hasHeadings = /^#{1,2}\s+/m.test(text);

  if (hasHeadings) {
    return splitByHeadings(text);
  }

  // Split by blank lines
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  if (blocks.length > 0) {
    return blocks;
  }

  // Single block fallback
  return [text];
}

/** Split text using markdown headings as boundaries. */
function splitByHeadings(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^#{1,2}\s+/.test(line)) {
      // Start new block; flush previous if non-empty
      const prev = current.join("\n").trim();
      if (prev) blocks.push(prev);
      current = [line];
    } else {
      current.push(line);
    }
  }

  const last = current.join("\n").trim();
  if (last) blocks.push(last);

  return blocks;
}

/** Extract headline and body from a single block. */
function extractHeadlineAndBody(
  block: string,
  sectionIndex: number
): { headline: string; body: string } {
  const lines = block.split("\n");
  const firstLine = lines[0].trim();

  // Heading block: strip # prefix
  const headingMatch = firstLine.match(/^#{1,2}\s+(.+)/);
  if (headingMatch) {
    const headline = headingMatch[1].trim();
    const body = lines.slice(1).join("\n").trim();

    if (!body) {
      return { headline: `섹션 ${sectionIndex}`, body: headline };
    }
    return { headline, body };
  }

  // Plain block: first line as headline, rest as body
  const restBody = lines.slice(1).join("\n").trim();

  if (!restBody) {
    // Single-line block: move content to body
    return { headline: `섹션 ${sectionIndex}`, body: firstLine };
  }

  return { headline: firstLine, body: restBody };
}
