import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { getLeaderboard, listPapers, listSubjects } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Sigma, FileText } from "lucide-react";
import { mediumLabelSi, formatTime } from "@/lib/format";

const subjectsQ = queryOptions({ queryKey: ["subjects"], queryFn: () => listSubjects() });
const papersQ = queryOptions({ queryKey: ["leaderboard-papers"], queryFn: () => listPapers({ data: { limit: 200 } }) });
const lbQ = (subjectSlug?: string, medium?: string, paperId?: string, district?: string) =>
  queryOptions({
    queryKey: ["leaderboard", subjectSlug ?? "all", medium ?? "all", paperId ?? "overall", district ?? "all"],
    queryFn: () =>
      getLeaderboard({
        data: {
          subjectSlug: subjectSlug || undefined,
          medium: (medium as "sinhala" | "english" | undefined) || undefined,
          paperId: paperId || undefined,
          district: district?.trim() || undefined,
          limit: 100,
        },
      }),
  });

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — TechMaster" }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(subjectsQ), context.queryClient.ensureQueryData(papersQ)]),
  component: Page,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-navy">Leaderboard could not load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <p className="mt-4 text-sm text-muted-foreground">Please check your Supabase setup and refresh this page.</p>
      </section>
    </SiteLayout>
  ),
});

type LeaderboardRow = {
  id: string;
  user_id: string;
  student_name: string | null;
  avatar_url?: string | null;
  district: string | null;
  school: string | null;
  subject_name: string | null;
  paper_title: string;
  paper_id: string;
  medium: string | null;
  year: number | null;
  score: number;
  total_marks: number;
  percentage: number;
  time_taken: number;
  created_at: string;
  attempted_papers?: number;
  best_paper_title?: string | null;
};

function Page() {
  const [subject, setSubject] = useState<string>("all");
  const [medium, setMedium] = useState<string>("all");
  const [paperId, setPaperId] = useState<string>("all");
  const [district, setDistrict] = useState<string>("");
  const { data: subjects } = useSuspenseQuery(subjectsQ);
  const { data: papers } = useSuspenseQuery(papersQ);
  const { data: rows } = useSuspenseQuery(
    lbQ(
      subject === "all" ? undefined : subject,
      medium === "all" ? undefined : medium,
      paperId === "all" ? undefined : paperId,
      district,
    ),
  );

  const filteredPapers = useMemo(() => {
    if (subject === "all") return papers;
    return papers.filter((p) => (p.subjects as { slug?: string } | null)?.slug === subject);
  }, [papers, subject]);

  const isPaperLeaderboard = paperId !== "all";
  const topScore = rows[0]?.score ?? 0;
  const totalAttemptsOrStudents = rows.length;

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Trophy className="h-7 w-7 text-gold-cta" /> Leaderboard
          </h1>
          <p className="mt-2 opacity-80">
            Overall leaderboard ranks students by adding the best marks from every paper they have attempted. Select a paper to view that paper leaderboard only.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-3">
        <InfoCard icon={<Sigma />} title={isPaperLeaderboard ? "Paper leaderboard" : "Overall leaderboard"} value={isPaperLeaderboard ? "Selected paper" : "Total marks"} />
        <InfoCard icon={<Medal />} title="Top score" value={String(topScore)} />
        <InfoCard icon={<FileText />} title={isPaperLeaderboard ? "Attempts shown" : "Students shown"} value={String(totalAttemptsOrStudents)} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-2 md:grid-cols-4">
        <Select value={subject} onValueChange={(v) => { setSubject(v); setPaperId("all"); }}>
          <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={medium} onValueChange={setMedium}>
          <SelectTrigger><SelectValue placeholder="Medium" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All media</SelectItem>
            <SelectItem value="sinhala">Sinhala Medium</SelectItem>
            <SelectItem value="english">English Medium</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paperId} onValueChange={setPaperId}>
          <SelectTrigger><SelectValue placeholder="Paper" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Overall total</SelectItem>
            {filteredPapers.map((p) => <SelectItem key={p.id} value={p.id}>{p.year} · {p.title}</SelectItem>)}
          </SelectContent>
        </Select>

        <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District filter" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-left">Leaderboard type</th>
                <th className="px-4 py-3 text-left">Medium</th>
                <th className="px-4 py-3 text-right">Marks</th>
                <th className="px-4 py-3 text-right">%</th>
                <th className="px-4 py-3 text-right">{isPaperLeaderboard ? "Time" : "Papers"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No results yet.</td></tr>
              )}
              {(rows as LeaderboardRow[]).map((r, i) => {
                const attemptedPapers = r.attempted_papers;
                const bestPaperTitle = r.best_paper_title;
                return (
                  <tr key={`${r.id}-${i}`} className="border-t border-border">
                    <td className="px-4 py-3 font-bold">
                      {i < 3 ? <span className="text-gold-cta">#{i + 1}</span> : `#${i + 1}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {i < 3 && (
                          <Avatar className="h-10 w-10 border-2 border-gold-cta/70">
                            <AvatarImage src={r.avatar_url ?? undefined} alt={r.student_name || "Student"} />
                            <AvatarFallback>{getInitials(r.student_name || "Student")}</AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="font-semibold">{r.student_name || "Student"}</div>
                          <div className="text-xs text-muted-foreground">{r.school || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{r.district || "-"}</td>
                    <td className="px-4 py-3">
                      <div>{isPaperLeaderboard ? r.paper_title : "Overall total"}</div>
                      <div className="text-xs text-muted-foreground">
                        {isPaperLeaderboard ? `${r.subject_name ?? ""} · ${r.year ?? ""}` : `Best paper: ${bestPaperTitle || "-"}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">{isPaperLeaderboard ? (mediumLabelSi[r.medium as string] ?? r.medium ?? "-") : "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{r.score}/{r.total_marks}</td>
                    <td className="px-4 py-3 text-right">{Number(r.percentage).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {isPaperLeaderboard ? formatTime(r.time_taken || 0) : `${attemptedPapers ?? 0} papers`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </SiteLayout>
  );
}

function InfoCard({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-gold-cta [&_svg]:h-5 [&_svg]:w-5">{icon}</span>{title}
      </div>
      <div className="mt-1 text-2xl font-bold text-navy">{value}</div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";
}
