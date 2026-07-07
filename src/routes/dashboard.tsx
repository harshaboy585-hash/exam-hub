import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BarChart3, BookOpenCheck, Trophy } from "lucide-react";
import { ProfileMenu, SignOutIconButton } from "@/components/site/ProfileMenu";
import { useProfile } from "@/hooks/useProfile";
import { formatTime } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TechMaster" }] }),
  component: Page,
});

type ResultRow = {
  id: string;
  paper_id: string;
  paper_title: string;
  subject_name: string | null;
  score: number;
  total_marks: number;
  percentage: number;
  time_taken: number;
  created_at: string;
};

type PaperRow = {
  id: string;
  title: string;
  paper_type: string;
  has_online_exam: boolean;
  is_published: boolean;
  subjects?: { name?: string | null } | null;
};

type SubjectAverage = {
  subject: string;
  average: number;
  attempts: number;
};

function Page() {
  const { user, loading } = useAuth();
  const { displayName, refreshProfile } = useProfile();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [papers, setPapers] = useState<PaperRow[]>([]);
  useEffect(() => {
    if (!user) return;

    void Promise.all([
      supabase
        .from("exam_results")
        .select("id, paper_id, paper_title, subject_name, score, total_marks, percentage, time_taken, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("papers")
        .select("id, title, paper_type, has_online_exam, is_published, subjects(name)")
        .eq("is_published", true)
        .eq("has_online_exam", true),
    ]).then(([resultsResponse, papersResponse]) => {
      setResults((resultsResponse.data as ResultRow[] | null) ?? []);
      setPapers((papersResponse.data as PaperRow[] | null) ?? []);
    });

    void refreshProfile();
  }, [user, refreshProfile]);

  const analytics = useMemo(() => buildAnalytics(results, papers), [results, papers]);

  if (loading) return <SiteLayout><div className="p-12 text-center">Loading...</div></SiteLayout>;
  if (!user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Dashboard බැලීමට පිවිසෙන්න</h1>
          <Link to="/auth"><Button className="mt-4">Sign in</Button></Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <ProfileMenu mode="dashboard" showDashboardLink={false} />
            <div>
              <p className="text-sm opacity-80">Hello</p>
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <p className="mt-1 text-sm opacity-80">TechMaster Dashboard</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SignOutIconButton />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={<BookOpenCheck />} title="ලිව් exam ගණන" value={String(analytics.attempts)} />
        <Stat icon={<Trophy />} title="උපරිම ලකුණු %" value={`${analytics.best.toFixed(1)}%`} />
        <Stat icon={<BarChart3 />} title="සාමාන්‍ය %" value={`${analytics.avg.toFixed(1)}%`} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-navy">Performance Analysis</h2>
              <p className="text-sm text-muted-foreground">ඔයා ලියපු exams වල ලකුණු වර්ධනය.</p>
            </div>
            <div className="text-sm font-semibold text-navy">Average {analytics.avg.toFixed(1)}%</div>
          </div>
          <TrendChart data={analytics.trend} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-xl font-bold text-navy">Subject-wise average</h2>
          <p className="mt-1 text-sm text-muted-foreground">විෂය අනුව ලකුණු සාමාන්‍යය.</p>
          <SubjectBars data={analytics.subjectAverages} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4">
        <h2 className="mb-4 text-xl font-bold">නවතම Results</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left">Paper</th>
                <th className="px-4 py-3 text-right">Marks</th>
                <th className="px-4 py-3 text-right">%</th>
                <th className="px-4 py-3 text-right">Time</th>
                <th className="px-4 py-3 text-right">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">තවම results නැත.</td></tr>
              )}
              {results.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div>{r.paper_title}</div>
                    <div className="text-xs text-muted-foreground">{r.subject_name}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{r.score}/{r.total_marks}</td>
                  <td className="px-4 py-3 text-right">{Number(r.percentage).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatTime(r.time_taken || 0)}</td>
                  <td className="px-4 py-3 text-right text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/exam-result/$resultId" params={{ resultId: r.id }} className="text-sm font-semibold text-navy hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SiteLayout>
  );
}

function buildAnalytics(results: ResultRow[], papers: PaperRow[]) {
  const attempts = results.length;
  const best = results.reduce((m, r) => Math.max(m, Number(r.percentage)), 0);
  const avg = attempts ? results.reduce((s, r) => s + Number(r.percentage), 0) / attempts : 0;

  const bestByPaper = new Map<string, ResultRow>();
  for (const r of results) {
    const current = bestByPaper.get(r.paper_id);
    if (!current || Number(r.score) > Number(current.score) || (Number(r.score) === Number(current.score) && Number(r.time_taken) < Number(current.time_taken))) {
      bestByPaper.set(r.paper_id, r);
    }
  }

  const completedPapers = bestByPaper.size;
  void completedPapers;
  void papers;

  const trend = [...results]
    .reverse()
    .slice(-10)
    .map((r, index) => ({ label: `#${index + 1}`, value: Number(r.percentage), paper: r.paper_title }));

  const subjectMap = new Map<string, { total: number; count: number }>();
  for (const r of results) {
    const key = r.subject_name || "Other";
    const item = subjectMap.get(key) ?? { total: 0, count: 0 };
    item.total += Number(r.percentage);
    item.count += 1;
    subjectMap.set(key, item);
  }
  const subjectAverages: SubjectAverage[] = Array.from(subjectMap.entries())
    .map(([subject, item]) => ({ subject, average: item.count ? item.total / item.count : 0, attempts: item.count }))
    .sort((a, b) => b.average - a.average);


  return { attempts, best, avg, trend, subjectAverages };
}

function Stat({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-gold-cta [&_svg]:h-5 [&_svg]:w-5">{icon}</span>{title}
      </div>
      <div className="mt-2 text-3xl font-bold text-navy">{value}</div>
    </div>
  );
}

function TrendChart({ data }: { data: { label: string; value: number; paper: string }[] }) {
  if (data.length === 0) {
    return <div className="flex h-72 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 text-muted-foreground">Chart එක පෙන්වීමට results නැත.</div>;
  }

  const width = 900;
  const height = 270;
  const baseY = 215;
  const topY = 42;
  const chartHeight = baseY - topY;
  const barGap = 18;
  const left = 48;
  const right = 48;
  const available = width - left - right;
  const barWidth = Math.max(24, Math.min(46, (available - barGap * (data.length - 1)) / data.length));
  const colors = ["#ef4444", "#f97316", "#facc15", "#84cc16", "#22c55e", "#14b8a6", "#38bdf8", "#2563eb", "#7c3aed", "#ec4899"];
  const bars = data.map((d, index) => {
    const value = Math.max(0, Math.min(100, d.value));
    const x = left + index * (barWidth + barGap) + Math.max(0, (available - (barWidth * data.length + barGap * (data.length - 1))) / 2);
    const h = Math.max(12, (value / 100) * chartHeight);
    const y = baseY - h;
    return { ...d, value, x, y, h, color: colors[index % colors.length] };
  });
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-4 shadow-inner">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
        <defs>
          <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="5" floodOpacity="0.18" />
          </filter>
        </defs>

        {[0, 25, 50, 75, 100].map((tick) => {
          const y = baseY - (tick / 100) * chartHeight;
          return (
            <g key={tick}>
              <line x1={left - 10} x2={width - right + 10} y1={y} y2={y} stroke="#cbd5e1" strokeDasharray="6 8" />
              <text x={left - 18} y={y + 4} textAnchor="end" className="fill-slate-500 text-[11px]">{tick}%</text>
            </g>
          );
        })}

        <line x1={left - 10} x2={width - right + 10} y1={baseY} y2={baseY} stroke="#94a3b8" />

        {bars.map((b) => (
          <g key={`${b.label}-${b.paper}`} filter="url(#barShadow)">
            <rect x={b.x} y={b.y} width={barWidth} height={b.h} rx="10" fill={b.color} />
            <rect x={b.x + 6} y={b.y + 6} width={barWidth - 12} height="10" rx="5" fill="rgba(255,255,255,0.38)" />
            <text x={b.x + barWidth / 2} y={b.y - 22} textAnchor="middle" className="fill-slate-800 text-[12px] font-bold">{b.value.toFixed(0)}%</text>
            <text x={b.x + barWidth / 2} y={baseY + 22} textAnchor="middle" className="fill-slate-600 text-[12px]">{b.label}</text>
          </g>
        ))}

      </svg>
    </div>
  );
}

function SubjectBars({ data }: { data: SubjectAverage[] }) {
  if (data.length === 0) return <div className="mt-4 rounded-xl bg-secondary p-6 text-center text-muted-foreground">Subject chart එකට results නැත.</div>;
  const colors = ["linear-gradient(90deg,#0ea5e9,#2563eb)", "linear-gradient(90deg,#22c55e,#14b8a6)", "linear-gradient(90deg,#f59e0b,#ef4444)", "linear-gradient(90deg,#8b5cf6,#ec4899)"];
  return (
    <div className="mt-5 space-y-4">
      {data.map((item, index) => (
        <div key={item.subject} className="rounded-xl bg-secondary/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-navy">{item.subject}</span>
            <span className="text-muted-foreground">{item.average.toFixed(1)}% · {item.attempts} attempts</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full shadow-sm"
              style={{ width: `${Math.max(4, Math.min(100, item.average))}%`, background: colors[index % colors.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
