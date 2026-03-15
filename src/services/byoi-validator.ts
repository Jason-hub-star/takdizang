const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ByoiValidationResult {
  valid: boolean;
  width?: number;
  height?: number;
  mimeType?: string;
  reason?: string;
}

export function validateByoiImage(
  buffer: Buffer,
  mimeType: string
): ByoiValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, reason: `Unsupported format: ${mimeType}. Allowed: JPG, PNG, WebP` };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, reason: `File too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB. Max: 10MB` };
  }

  if (buffer.length === 0) {
    return { valid: false, reason: "Empty file" };
  }

  const dimensions = getImageDimensions(buffer, mimeType);
  if (!dimensions) {
    return { valid: false, reason: "Could not read image dimensions" };
  }

  return {
    valid: true,
    width: dimensions.width,
    height: dimensions.height,
    mimeType,
  };
}

export function getImageDimensions(
  buffer: Buffer,
  mimeType: string
): { width: number; height: number } | null {
  try {
    if (mimeType === "image/png") {
      // PNG: width at offset 16 (4 bytes BE), height at offset 20 (4 bytes BE)
      if (buffer.length < 24) return null;
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    if (mimeType === "image/jpeg") {
      // JPEG: scan for SOF0 (0xFFC0) or SOF2 (0xFFC2) marker
      let offset = 2; // skip SOI marker
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        if (marker === 0xc0 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      }
      return null;
    }

    if (mimeType === "image/webp") {
      // WebP: RIFF header, then VP8 chunk
      if (buffer.length < 30) return null;
      const riff = buffer.toString("ascii", 0, 4);
      const webp = buffer.toString("ascii", 8, 12);
      if (riff !== "RIFF" || webp !== "WEBP") return null;

      const chunk = buffer.toString("ascii", 12, 16);
      if (chunk === "VP8 ") {
        // Lossy: width/height at offset 26/28 (little-endian, 14-bit)
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height };
      }
      if (chunk === "VP8L") {
        // Lossless: bits packed at offset 21
        const bits = buffer.readUInt32LE(21);
        const width = (bits & 0x3fff) + 1;
        const height = ((bits >> 14) & 0x3fff) + 1;
        return { width, height };
      }
      return null;
    }

    return null;
  } catch {
    return null;
  }
}
