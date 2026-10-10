/** A replacement of [start, end) in the document text, as the preview-core engines compute it. */
export interface OffsetEdit {
  start: number;
  end: number;
  text: string;
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
