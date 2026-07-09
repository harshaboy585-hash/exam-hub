import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getPublicServerClient } from "./public-client.server";

const FALLBACK_SUBJECTS = [
  { id: "engineering-technology", slug: "engineering-technology", name: "Engineering Technology", description: "ඉංජිනේරු තාක්ෂණවේදය සඳහා papers, exams සහ tools.", icon: "settings", sort_order: 1 },
  { id: "science-for-technology", slug: "science-for-technology", name: "Science for Technology", description: "තාක්ෂණය සඳහා විද්‍යාව papers, quizzes සහ formulas.", icon: "atom", sort_order: 2 },
  { id: "bio-systems-technology", slug: "bio-systems-technology", name: "Bio Systems Technology", description: "ජෛව පද්ධති තාක්ෂණවේදය සඳහා papers සහ practice exams.", icon: "leaf", sort_order: 3 },
  { id: "ict", slug: "ict", name: "ICT", description: "ICT සඳහා papers, online exams සහ tools.", icon: "monitor", sort_order: 4 },
];


// ---------- Subjects ----------
export const listSubjects = createServerFn({ method: "GET" }).handler(async () => {
  const sb = getPublicServerClient();
  const officialSlugs = ["engineering-technology", "science-for-technology", "bio-systems-technology", "ict"];
  const { data, error } = await sb
    .from("subjects")
    .select("id, slug, name, description, icon, sort_order")
    .in("slug", officialSlugs)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("listSubjects fallback:", error.message);
    return FALLBACK_SUBJECTS;
  }

  return (data && data.length > 0 ? data : FALLBACK_SUBJECTS) as typeof FALLBACK_SUBJECTS;
});

export const getSubjectBySlug = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = getPublicServerClient();
    const { data: row, error } = await sb
      .from("subjects")
      .select("id, slug, name, description, icon")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) {
      console.warn("getSubjectBySlug fallback:", error.message);
      const fallback = FALLBACK_SUBJECTS.find((s) => s.slug === data.slug);
      if (fallback) return fallback;
      throw new Error("Subject not found");
    }

    if (!row) {
      const fallback = FALLBACK_SUBJECTS.find((s) => s.slug === data.slug);
      if (fallback) return fallback;
      throw new Error("Subject not found");
    }
    return row;
  });

// ---------- Papers ----------
const listPapersInput = z.object({
  subjectSlug: z.string().optional(),
  paperType: z.enum(["past", "model"]).optional(),
  medium: z.enum(["sinhala", "english"]).optional(),
  year: z.number().int().optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export const listPapers = createServerFn({ method: "GET" })
  .validator((d: unknown) => listPapersInput.parse(d ?? {}))
  .handler(async ({ data }) => {
    const sb = getPublicServerClient();
    let subjectId: string | undefined;
    if (data.subjectSlug) {
      const { data: s } = await sb.from("subjects").select("id").eq("slug", data.subjectSlug).maybeSingle();
      if (!s) return [];
      subjectId = s.id;
    }
    let q = sb
      .from("papers")
      .select("id, title, subject_id, medium, year, paper_type, difficulty, description, pdf_url, has_online_exam, duration_minutes, subjects(name, slug)")
      .eq("is_published", true)
      .order("year", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (subjectId) q = q.eq("subject_id", subjectId);
    if (data.paperType) q = q.eq("paper_type", data.paperType);
    else q = q.in("paper_type", ["past", "model"]);
    if (data.medium) q = q.eq("medium", data.medium);
    if (data.year) q = q.eq("year", data.year);
    if (data.limit) q = q.limit(data.limit);
    const { data: rows, error } = await q;
    if (error) {
      console.warn("listPapers failed:", error.message);
      return [];
    }
    return rows ?? [];
  });

export const getPaper = createServerFn({ method: "GET" })
  .validator((d: { paperId: string }) => z.object({ paperId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = getPublicServerClient();
    const { data: row, error } = await sb
      .from("papers")
      .select("id, title, subject_id, medium, year, paper_type, description, pdf_url, has_online_exam, duration_minutes, subjects(name, slug)")
      .eq("id", data.paperId)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Paper not found");
    return row;
  });

// ---------- Exam ----------
// Returns questions WITHOUT correct answers for the student
export const startExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { paperId: string }) => z.object({ paperId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: paper, error: pErr } = await context.supabase
      .from("papers")
      .select("id, title, medium, year, duration_minutes, has_online_exam, subjects(name, slug)")
      .eq("id", data.paperId)
      .eq("is_published", true)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!paper) throw new Error("Paper not found");
    if (!paper.has_online_exam) throw new Error("Online exam not available for this paper");

    const { data: qs, error: qErr } = await context.supabase
      .from("questions")
      .select("id, question_number, question_text, question_image, option_a, option_b, option_c, option_d, marks")
      .eq("paper_id", data.paperId)
      .order("question_number", { ascending: true });
    if (qErr) throw new Error(qErr.message);
    if (!qs || qs.length === 0) throw new Error("No questions available yet for this paper");

    return { paper, questions: qs, startedAt: Date.now() };
  });

const submitInput = z.object({
  paperId: z.string().uuid(),
  timeTaken: z.number().int().min(0),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selected: z.enum(["A", "B", "C", "D"]).nullable(),
    }),
  ),
});

export const submitExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => submitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load paper + questions (auth'd client — RLS lets authenticated read questions)
    const { data: paper, error: pErr } = await supabase
      .from("papers")
      .select("id, title, medium, year, subjects(name)")
      .eq("id", data.paperId)
      .maybeSingle();
    if (pErr || !paper) throw new Error("Paper not found");

    const { data: qs, error: qErr } = await supabase
      .from("questions")
      .select("id, question_number, correct_answer, marks, question_text, option_a, option_b, option_c, option_d, explanation")
      .eq("paper_id", data.paperId)
      .order("question_number", { ascending: true });
    if (qErr || !qs) throw new Error("Questions load failed");

    const answerMap = new Map(data.answers.map((a) => [a.questionId, a.selected]));
    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const answerLog = qs.map((q) => {
      totalMarks += q.marks;
      const selected = answerMap.get(q.id) ?? null;
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) {
        score += q.marks;
        correctCount += 1;
      } else {
        // Wrong + unanswered are both counted as wrong after submit.
        wrongCount += 1;
      }
      return {
        question_id: q.id,
        question_number: q.question_number,
        question_text: q.question_text,
        options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
        selected,
        correct: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation,
      };
    });
    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, district, school")
      .eq("id", userId)
      .maybeSingle();

    const { data: result, error: rErr } = await supabase
      .from("exam_results")
      .insert({
        user_id: userId,
        paper_id: data.paperId,
        student_name: profile?.full_name || null,
        district: profile?.district || null,
        school: profile?.school || null,
        subject_name: (paper as unknown as { subjects?: { name?: string } }).subjects?.name ?? null,
        paper_title: paper.title,
        medium: paper.medium,
        year: paper.year,
        score,
        total_marks: totalMarks,
        percentage,
        correct_count: correctCount,
        wrong_count: wrongCount,
        time_taken: data.timeTaken,
        answers: answerLog,
      })
      .select("id")
      .single();
    if (rErr) throw new Error(rErr.message);
    return { resultId: result.id };
  });

export const getExamResult = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { resultId: string }) => z.object({ resultId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("exam_results")
      .select("*")
      .eq("id", data.resultId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Result not found");
    if (row.user_id !== context.userId) throw new Error("Not your result");

    // Compute rank for this paper
    const { data: better } = await context.supabase
      .from("exam_results")
      .select("id, score, time_taken", { count: "exact" })
      .eq("paper_id", row.paper_id)
      .or(`score.gt.${row.score},and(score.eq.${row.score},time_taken.lt.${row.time_taken})`);
    const rank = (better?.length ?? 0) + 1;

    const { data: paper } = await context.supabase
      .from("papers")
      .select("pdf_url")
      .eq("id", row.paper_id)
      .maybeSingle();

    return { result: row, rank, paperPdfUrl: paper?.pdf_url ?? null };
  });

// ---------- Leaderboard ----------
const lbInput = z.object({
  subjectSlug: z.string().optional(),
  paperId: z.string().uuid().optional(),
  district: z.string().optional(),
  medium: z.enum(["sinhala", "english"]).optional(),
  year: z.number().int().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const getLeaderboard = createServerFn({ method: "GET" })
  .validator((d: unknown) => lbInput.parse(d ?? {}))
  .handler(async ({ data }) => {
    const sb = getPublicServerClient();
    let subjectName: string | undefined;
    if (data.subjectSlug) {
      const { data: s } = await sb.from("subjects").select("name").eq("slug", data.subjectSlug).maybeSingle();
      if (s) subjectName = s.name;
    }

    let q = sb
      .from("exam_results")
      .select(
        "id, user_id, student_name, district, school, subject_name, paper_title, paper_id, medium, year, score, total_marks, percentage, time_taken, created_at",
      )
      .order("score", { ascending: false })
      .order("time_taken", { ascending: true })
      .limit(1000);

    if (subjectName) q = q.eq("subject_name", subjectName);
    if (data.paperId) q = q.eq("paper_id", data.paperId);
    if (data.district) q = q.eq("district", data.district);
    if (data.medium) q = q.eq("medium", data.medium);
    if (data.year) q = q.eq("year", data.year);

    const { data: rows, error } = await q;
    if (error) {
      console.warn("getLeaderboard failed:", error.message);
      return [];
    }

    // First keep each student's best attempt for each paper.
    // That prevents repeated attempts from unfairly increasing total marks.
    const bestByUserPaper = new Map<string, NonNullable<typeof rows>[number]>();
    for (const r of rows ?? []) {
      const key = `${r.user_id}:${r.paper_id}`;
      const current = bestByUserPaper.get(key);
      if (
        !current ||
        Number(r.score) > Number(current.score) ||
        (Number(r.score) === Number(current.score) && Number(r.time_taken) < Number(current.time_taken))
      ) {
        bestByUserPaper.set(key, r);
      }
    }

    const bestAttempts = Array.from(bestByUserPaper.values());

    const userIds = Array.from(new Set(bestAttempts.map((r) => r.user_id).filter(Boolean)));
    const profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
    if (userIds.length > 0) {
      const { data: profiles } = await sb
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
      for (const profile of profiles ?? []) {
        profileMap.set(profile.id, {
          full_name: profile.full_name ?? null,
          avatar_url: (profile as { avatar_url?: string | null }).avatar_url ?? null,
        });
      }
    }

    const enrichLeaderboardRow = <T extends { user_id: string; student_name: string | null }>(row: T) => {
      const profile = profileMap.get(row.user_id);
      return {
        ...row,
        student_name: profile?.full_name || row.student_name || "Student",
        avatar_url: profile?.avatar_url ?? null,
      };
    };

    // When a paper is selected, return the leaderboard for that exact paper.
    if (data.paperId) {
      return bestAttempts
        .map(enrichLeaderboardRow)
        .sort((a, b) => Number(b.score) - Number(a.score) || Number(a.time_taken) - Number(b.time_taken))
        .slice(0, data.limit ?? 100);
    }

    // Overall leaderboard: sum each student's best marks across all matching papers.
    const byUser = new Map<string, {
      id: string;
      user_id: string;
      student_name: string | null;
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
      attempted_papers: number;
      best_paper_title: string | null;
      best_score: number;
      avatar_url?: string | null;
    }>();

    for (const r of bestAttempts) {
      const current = byUser.get(r.user_id);
      if (!current) {
        byUser.set(r.user_id, {
          ...r,
          student_name: profileMap.get(r.user_id)?.full_name || r.student_name || "Student",
          paper_title: "Overall total",
          score: Number(r.score),
          total_marks: Number(r.total_marks),
          percentage: Number(r.total_marks) > 0 ? Number(((Number(r.score) / Number(r.total_marks)) * 100).toFixed(2)) : 0,
          time_taken: Number(r.time_taken),
          attempted_papers: 1,
          best_paper_title: r.paper_title,
          best_score: Number(r.score),
          avatar_url: profileMap.get(r.user_id)?.avatar_url ?? null,
        });
      } else {
        current.score += Number(r.score);
        current.total_marks += Number(r.total_marks);
        current.time_taken += Number(r.time_taken);
        current.attempted_papers += 1;
        current.percentage = current.total_marks > 0 ? Number(((current.score / current.total_marks) * 100).toFixed(2)) : 0;
        if (Number(r.score) > current.best_score) {
          current.best_score = Number(r.score);
          current.best_paper_title = r.paper_title;
        }
      }
    }

    return Array.from(byUser.values())
      .sort(
        (a, b) =>
          Number(b.score) - Number(a.score) ||
          Number(b.percentage) - Number(a.percentage) ||
          Number(b.attempted_papers) - Number(a.attempted_papers) ||
          Number(a.time_taken) - Number(b.time_taken),
      )
      .slice(0, data.limit ?? 100);
  });

// ---------- Download logging ----------
export const logDownload = createServerFn({ method: "POST" })
  .validator((d: { paperId: string; userId?: string | null }) =>
    z.object({ paperId: z.string().uuid(), userId: z.string().uuid().nullable().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = getPublicServerClient();
    await sb.from("downloads").insert({ paper_id: data.paperId, user_id: data.userId ?? null });
    return { ok: true };
  });
