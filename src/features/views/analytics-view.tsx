import { Flame, Pen, Trophy, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getWritingStats } from "@/actions/features";
import type { WritingStat } from "@/db/schema";

export function AnalyticsView() {
  const [stats, setStats] = useState<WritingStat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getWritingStats(365);
    setStats(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Compute metrics
  const metrics = useMemo(() => {
    if (stats.length === 0) {
      return {
        totalWords: 0,
        streak: 0,
        bestDay: 0,
        totalNotes: 0,
        weeklyWords: 0,
        monthlyWords: 0,
      };
    }

    const statMap = new Map(stats.map((s) => [s.date, s]));
    const totalWords = stats.reduce((a, s) => a + s.words_written, 0);
    const totalNotes = stats.reduce((a, s) => a + s.notes_edited, 0);
    const bestDay = Math.max(...stats.map((s) => s.words_written));

    // Current streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]!;
      const s = statMap.get(key);
      if (s && s.words_written > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Weekly words (last 7 days)
    const week = new Date();
    week.setDate(week.getDate() - 7);
    const weekStr = week.toISOString().split("T")[0]!;
    const weeklyWords = stats
      .filter((s) => s.date >= weekStr)
      .reduce((a, s) => a + s.words_written, 0);

    // Monthly words (last 30 days)
    const monthDate = new Date();
    monthDate.setDate(monthDate.getDate() - 30);
    const monthStr = monthDate.toISOString().split("T")[0]!;
    const monthlyWords = stats
      .filter((s) => s.date >= monthStr)
      .reduce((a, s) => a + s.words_written, 0);

    return { totalWords, streak, bestDay, totalNotes, weeklyWords, monthlyWords };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <h1 className="mb-6 text-xl font-bold">Writing Analytics</h1>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Current Streak"
          value={`${metrics.streak} day${metrics.streak !== 1 ? "s" : ""}`}
        />
        <MetricCard
          icon={<Pen className="h-5 w-5 text-blue-500" />}
          label="Total Words"
          value={metrics.totalWords.toLocaleString()}
        />
        <MetricCard
          icon={<Trophy className="h-5 w-5 text-yellow-500" />}
          label="Best Day"
          value={`${metrics.bestDay.toLocaleString()} words`}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          label="This Week"
          value={`${metrics.weeklyWords.toLocaleString()} words`}
        />
      </div>

      {/* Heatmap */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Activity (Last 365 Days)
        </h2>
        <ContributionHeatmap stats={stats} />
      </div>

      {/* Bar chart - last 30 days */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Daily Words (Last 30 Days)
        </h2>
        <BarChart stats={stats} />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="rounded-lg bg-muted p-2">{icon}</div>
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ContributionHeatmap({ stats }: { stats: WritingStat[] }) {
  const statMap = useMemo(
    () => new Map(stats.map((s) => [s.date, s.words_written])),
    [stats]
  );

  // Build 52 weeks of data
  const weeks = useMemo(() => {
    const result: { date: string; count: number; day: number }[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentWeek: { date: string; count: number; day: number }[] = [];

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0]!;
      const day = d.getDay();
      currentWeek.push({ date: key, count: statMap.get(key) ?? 0, day });
      if (day === 6) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) result.push(currentWeek);

    return result;
  }, [statMap]);

  const maxCount = Math.max(1, ...stats.map((s) => s.words_written));

  const getColor = (count: number) => {
    if (count === 0) return "hsl(var(--muted))";
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return "hsl(142 50% 25%)";
    if (intensity < 0.5) return "hsl(142 60% 35%)";
    if (intensity < 0.75) return "hsl(142 70% 45%)";
    return "hsl(142 76% 55%)";
  };

  const cellSize = 11;
  const gap = 2;

  return (
    <div className="overflow-x-auto">
      <svg
        width={weeks.length * (cellSize + gap) + 30}
        height={7 * (cellSize + gap) + 4}
      >
        {/* Day labels */}
        {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
          <text
            key={`label-${i}`}
            x={0}
            y={i * (cellSize + gap) + cellSize - 1}
            className="fill-muted-foreground"
            fontSize={9}
          >
            {label}
          </text>
        ))}
        {weeks.map((week, wi) => (
          <g key={wi} transform={`translate(${wi * (cellSize + gap) + 28}, 0)`}>
            {week.map((day) => (
              <rect
                key={day.date}
                x={0}
                y={day.day * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={getColor(day.count)}
              >
                <title>
                  {day.date}: {day.count} words
                </title>
              </rect>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

function BarChart({ stats }: { stats: WritingStat[] }) {
  // Get last 30 days
  const days = useMemo(() => {
    const result: { date: string; words: number }[] = [];
    const today = new Date();
    const statMap = new Map(stats.map((s) => [s.date, s.words_written]));

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]!;
      result.push({ date: key, words: statMap.get(key) ?? 0 });
    }
    return result;
  }, [stats]);

  const maxWords = Math.max(1, ...days.map((d) => d.words));
  const chartHeight = 120;
  const barWidth = 14;
  const gap = 4;
  const chartWidth = days.length * (barWidth + gap);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
      <svg width={chartWidth} height={chartHeight + 20} className="block">
        {days.map((day, i) => {
          const height = (day.words / maxWords) * chartHeight;
          return (
            <g key={day.date} transform={`translate(${i * (barWidth + gap)}, 0)`}>
              <rect
                x={0}
                y={chartHeight - height}
                width={barWidth}
                height={Math.max(height, 1)}
                rx={2}
                fill={day.words > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                opacity={day.words > 0 ? 0.8 : 0.3}
              >
                <title>
                  {day.date}: {day.words} words
                </title>
              </rect>
              {i % 5 === 0 && (
                <text
                  x={barWidth / 2}
                  y={chartHeight + 14}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={8}
                >
                  {day.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
