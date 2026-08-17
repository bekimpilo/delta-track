import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import type { Project } from "./ProjectTable";

const STATUS_COLORS: Record<string, string> = {
  Completed: "hsl(var(--success))",
  "In Progress": "hsl(var(--warning))",
  "Not Yet Started": "hsl(var(--muted-foreground))",
};

const SERIES = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--primary-glow))"];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  color: "hsl(var(--foreground))",
  fontSize: "0.8rem",
};

const ChartCard = ({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-xl border border-border/60 bg-card p-5 shadow-sm ${className}`}>
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    <div className="h-[260px]">{children}</div>
  </div>
);

const truncate = (s: string, n = 22) => (s.length > n ? `${s.slice(0, n)}…` : s);

const quarterOf = (d: string) => {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return { key: `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`, sort: date.getTime() };
};

export const ActivityCharts = ({ projects }: { projects: Project[] }) => {
  const statusData = useMemo(() => {
    const order = ["Completed", "In Progress", "Not Yet Started"];
    return order
      .map((s) => ({ name: s, value: projects.filter((p) => p.status === s).length }))
      .filter((d) => d.value > 0);
  }, [projects]);

  const partnerData = useMemo(() => {
    const counts = new Map<string, { name: string; Completed: number; "In Progress": number; "Not Yet Started": number }>();
    projects.forEach((p) => {
      (p.deliveryPartner || "Unassigned")
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((partner) => {
          const row =
            counts.get(partner) ||
            { name: partner, Completed: 0, "In Progress": 0, "Not Yet Started": 0 };
          row[p.status] = (row[p.status] || 0) + 1;
          counts.set(partner, row);
        });
    });
    return Array.from(counts.values())
      .sort(
        (a, b) =>
          b.Completed + b["In Progress"] + b["Not Yet Started"] -
          (a.Completed + a["In Progress"] + a["Not Yet Started"])
      )
      .slice(0, 8)
      .map((r) => ({ ...r, label: truncate(r.name) }));
  }, [projects]);

  const entityData = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => {
      const key = p.implementingEntity?.trim() || "Unassigned";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, label: truncate(name), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [projects]);

  const timelineData = useMemo(() => {
    const map = new Map<string, { key: string; sort: number; Started: number; Ending: number }>();
    const bump = (dateStr: string, field: "Started" | "Ending") => {
      if (!dateStr) return;
      const q = quarterOf(dateStr);
      if (!q) return;
      const row = map.get(q.key) || { key: q.key, sort: q.sort, Started: 0, Ending: 0 };
      row[field] += 1;
      map.set(q.key, row);
    };
    projects.forEach((p) => {
      bump(p.startDate, "Started");
      bump(p.endDate, "Ending");
    });
    return Array.from(map.values()).sort((a, b) => a.sort - b.sort);
  }, [projects]);

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
        No activities match your filters — nothing to visualise yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Status breakdown" subtitle="Share of activities by delivery status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              stroke="hsl(var(--card))"
            >
              {statusData.map((d) => (
                <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "0.75rem" }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Activities by implementing entity" subtitle="Top 8 entities by activity count">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={entityData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
            <Bar dataKey="value" name="Activities" fill={SERIES[0]} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Delivery partner performance" subtitle="Status mix per partner (top 8)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={partnerData} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "0.75rem" }} />
            <Bar dataKey="Completed" stackId="s" fill={STATUS_COLORS.Completed} barSize={22} />
            <Bar dataKey="In Progress" stackId="s" fill={STATUS_COLORS["In Progress"]} barSize={22} />
            <Bar
              dataKey="Not Yet Started"
              stackId="s"
              fill={STATUS_COLORS["Not Yet Started"]}
              radius={[4, 4, 0, 0]}
              barSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Activity timeline" subtitle="Activities starting and ending per quarter">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="key" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "0.75rem" }} />
            <Line type="monotone" dataKey="Started" stroke={SERIES[0]} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Ending" stroke={SERIES[1]} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
