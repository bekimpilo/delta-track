export interface CommentEntry {
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
            period: String(e.period ?? ""),
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

/** Short single-line summary for table cells / exports. */
export const summarizeComments = (raw?: string | null): string =>
  parseComments(raw)
    .map((e) => (e.period ? `[${e.period}] ${e.text}` : e.text))
    .join(" | ");

/** Quarter options around the current year for the reporting-period picker. */
export const periodOptions = (): string[] => {
  const year = new Date().getFullYear();
  const options: string[] = [];
  for (let y = year - 2; y <= year + 2; y++) {
    for (let q = 1; q <= 4; q++) options.push(`Q${q} ${y}`);
  }
  return options;
};
