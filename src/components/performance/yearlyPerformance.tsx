import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const YEARS = [1, 2, 3, 4, 5, 6] as const;
export const QUARTERS = ["q1", "q2", "q3", "q4"] as const;

export type YearPerf = { q1: string; q2: string; q3: string; q4: string; annual: string };
export type YearlyPerformance = Record<string, YearPerf>;

const emptyYear = (): YearPerf => ({ q1: "", q2: "", q3: "", q4: "", annual: "" });

export function parseYearly(raw: unknown): YearlyPerformance {
  let obj: any = raw;
  if (typeof raw === "string") {
    try { obj = JSON.parse(raw); } catch { obj = {}; }
  }
  const out: YearlyPerformance = {};
  YEARS.forEach(y => {
    const src = obj?.[y] || obj?.[String(y)] || {};
    out[y] = {
      q1: src.q1 != null ? String(src.q1) : "",
      q2: src.q2 != null ? String(src.q2) : "",
      q3: src.q3 != null ? String(src.q3) : "",
      q4: src.q4 != null ? String(src.q4) : "",
      annual: src.annual != null ? String(src.annual) : "",
    };
  });
  return out;
}

export function serializeYearly(yp: YearlyPerformance): string | null {
  const clean: Record<string, Partial<YearPerf>> = {};
  YEARS.forEach(y => {
    const v = yp[y] || emptyYear();
    const entry: Partial<YearPerf> = {};
    (["q1", "q2", "q3", "q4", "annual"] as const).forEach(k => {
      const s = (v[k] ?? "").toString().trim();
      if (s) entry[k] = s;
    });
    if (Object.keys(entry).length) clean[y] = entry;
  });
  return Object.keys(clean).length ? JSON.stringify(clean) : null;
}

const num = (s?: string | null) => {
  if (s == null || s === "") return null;
  const n = Number(String(s).replace(/[,\s%$]/g, ""));
  return Number.isFinite(n) ? n : null;
};

/** Achievement % only when both target and annual are plain numbers. */
export function achievement(target?: string | null, annual?: string | null): string {
  const t = num(target), a = num(annual);
  if (t === null || a === null || t === 0) return "";
  return `${((a / t) * 100).toFixed(1)}%`;
}

export function quarterSum(v: YearPerf): string {
  const vals = QUARTERS.map(q => num(v[q])).filter((n): n is number => n !== null);
  return vals.length ? String(vals.reduce((a, b) => a + b, 0)) : "";
}

/** Excel column names for each year group. */
export const yearCols = (y: number) => ({
  target: `Year ${y} Target`,
  q1: `Year ${y} Q1 Actual`,
  q2: `Year ${y} Q2 Actual`,
  q3: `Year ${y} Q3 Actual`,
  q4: `Year ${y} Q4 Actual`,
  annual: `Year ${y} Annual Actual`,
  pct: `Year ${y} Achievement %`,
});

export function YearlyPerformanceEditor({
  targets,
  onTargetChange,
  value,
  onChange,
}: {
  targets: Record<number, string>;
  onTargetChange: (year: number, v: string) => void;
  value: YearlyPerformance;
  onChange: (v: YearlyPerformance) => void;
}) {
  const [year, setYear] = useState<number>(1);
  const v = value[year] || emptyYear();
  const set = (k: keyof YearPerf, s: string) => onChange({ ...value, [year]: { ...v, [k]: s } });
  const sum = quarterSum(v);
  const pct = achievement(targets[year], v.annual);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {YEARS.map(y => (
          <Button key={y} type="button" size="sm" variant={y === year ? "default" : "outline"} onClick={() => setYear(y)}>
            Year {y}
          </Button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Year {year} Target</label>
          <Input value={targets[year] || ""} onChange={e => onTargetChange(year, e.target.value)} placeholder="e.g., 100 trained" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {QUARTERS.map(q => (
            <div key={q} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{q.toUpperCase()} Actual</label>
              <Input value={v[q]} onChange={e => set(q, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Annual Actual (entered manually)</label>
            <Input value={v.annual} onChange={e => set("annual", e.target.value)} />
          </div>
          <div className="text-sm text-muted-foreground pb-2">
            Achievement: <span className="font-semibold text-foreground">{pct || "—"}</span>
          </div>
        </div>
        {sum && (
          <p className="text-xs text-muted-foreground">
            Quarters add up to <span className="font-medium text-foreground">{sum}</span>.{" "}
            {v.annual !== sum && (
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => set("annual", sum)}>
                Use this as annual (only for countable measures like people trained)
              </Button>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export function YearlyPerformanceView({
  targets,
  raw,
}: {
  targets: Record<number, string | null | undefined>;
  raw: unknown;
}) {
  const yp = parseYearly(raw);
  const dash = (s?: string | null) => (s ? s : "—");
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Year</th>
            <th className="px-3 py-2 text-left">Target</th>
            <th className="px-3 py-2 text-right">Q1</th>
            <th className="px-3 py-2 text-right">Q2</th>
            <th className="px-3 py-2 text-right">Q3</th>
            <th className="px-3 py-2 text-right">Q4</th>
            <th className="px-3 py-2 text-right">Annual</th>
            <th className="px-3 py-2 text-right">Achieved</th>
          </tr>
        </thead>
        <tbody>
          {YEARS.map(y => {
            const v = yp[y];
            return (
              <tr key={y} className="border-t border-border">
                <td className="px-3 py-2 font-medium">Year {y}</td>
                <td className="px-3 py-2">{dash(targets[y])}</td>
                {QUARTERS.map(q => <td key={q} className="px-3 py-2 text-right">{dash(v[q])}</td>)}
                <td className="px-3 py-2 text-right font-semibold">{dash(v.annual)}</td>
                <td className="px-3 py-2 text-right">{dash(achievement(targets[y], v.annual))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
