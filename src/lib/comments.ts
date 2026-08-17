export interface CommentEntry {
  /** Date the update applies to (YYYY-MM-DD). Legacy values may hold a period label. */
  period: string;
  text: string;
  author?: string;
  createdAt?: string;
}

/** Parse the stored comments value (JSON array, or legacy plain text) into entries. */
export const parseComments = (raw?: string | null): CommentEntry[] => {
  if (!raw) return [];
  const value = String(raw).trim();
  if (!value) return [];
  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((e) => e && typeof e === "object")
          .map((e: any) => ({
            period: String(e.period ?? e.date ?? ""),
            text: String(e.text ?? ""),
            author: e.author ? String(e.author) : undefined,
            createdAt: e.createdAt ? String(e.createdAt) : undefined,
          }))
          .filter((e) => e.text || e.period);
      }
    } catch {
      // fall through to legacy handling
    }
  }
  return [{ period: "", text: value }];
};

export const serializeComments = (entries: CommentEntry[]): string => {
  const clean = entries.filter((e) => e.text.trim() !== "");
  return clean.length ? JSON.stringify(clean) : "";
};

/** Display a comment's date; falls back to the raw value for legacy period labels. */
export const formatCommentDate = (value?: string): string => {
  if (!value) return "";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return parsed.toLocaleDateString();
  }
  return value;
};

/** Short single-line summary for table cells / exports. */
export const summarizeComments = (raw?: string | null): string =>
  parseComments(raw)
    .map((e) => (e.period ? `[${formatCommentDate(e.period)}] ${e.text}` : e.text))
    .join(" | ");
