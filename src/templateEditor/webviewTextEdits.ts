/** A replacement of [start, end) in the document text, as the preview-core engines compute it. */
export interface OffsetEdit {
  start: number;
  end: number;
  text: string;
}

/**
 * 32-bit FNV-1a over UTF-16 code units. The webview hashes the text its edit
 * was computed against; the extension applies the edit only while the
 * document still hashes the same.
 */
export function textHash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * Validates edits received from a webview: well-formed, ascending,
 * non-overlapping and inside a document of `length` characters.
 * Returns null when any of that does not hold.
 */
export function checkOffsetEdits(value: unknown, length: number): OffsetEdit[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const out: OffsetEdit[] = [];
  let at = 0;
  for (const item of value) {
    if (!item || typeof item !== 'object') {
      return null;
    }
    const { start, end, text } = item as Record<string, unknown>;
    if (
      typeof start !== 'number' ||
      typeof end !== 'number' ||
      typeof text !== 'string' ||
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < at ||
      end < start ||
      end > length
    ) {
      return null;
    }
    out.push({ start, end, text });
    at = end;
  }
  return out;
}
