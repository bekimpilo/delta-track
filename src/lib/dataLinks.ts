export interface DataLink {
  url: string;
  source: string;
  description?: string;
}

/** Parse the stored data links value (JSON array, or legacy newline/comma separated URLs). */
export const parseDataLinks = (raw?: string | null): DataLink[] => {
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
            url: String(e.url ?? "").trim(),
            source: String(e.source ?? "").trim(),
            description: e.description ? String(e.description) : undefined,
          }));
      }
    } catch {
      // fall through to legacy handling
    }
  }
  return value
    .split(/[\n,;]+/)
    .map((u) => u.trim())
    .filter(Boolean)
    .map((url) => ({ url, source: "" }));
};

export const serializeDataLinks = (links: DataLink[]): string => {
  return links.length ? JSON.stringify(links) : "";
};

export const summarizeDataLinks = (raw?: string | null): string =>
  parseDataLinks(raw)
    .map((l) => (l.source ? `${l.source}: ${l.url}` : l.url))
    .join(" | ");

export const normalizeUrl = (url: string): string => {
  const value = url.trim();
  if (!value) return value;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};
