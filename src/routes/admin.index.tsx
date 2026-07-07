import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  Save,
  ShieldCheck,
  Pencil,
  XCircle,
  RefreshCw,
  Users,
  Eye,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — TechMaster" }] }),
  component: AdminPage,
});

type SubjectRow = { id: string; slug: string; name: string };
type PaperKind = "past" | "model";
type PaperRow = {
  id: string;
  title: string;
  subject_id: string;
  medium: "sinhala" | "english";
  year: number | null;
  paper_type: PaperKind;
  difficulty: string | null;
  description: string | null;
  pdf_url: string | null;
  has_online_exam: boolean;
  duration_minutes: number;
  is_published: boolean;
  subjects?: { name: string } | null;
};
type QuestionRow = {
  id: string;
  question_number: number;
  question_text: string;
  question_image: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  marks: number;
  explanation: string | null;
};

type ShortNoteRow = {
  id: string;
  subject_id: string;
  topic: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  is_published: boolean;
  created_at: string;
  subjects?: { name: string } | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  district: string | null;
  school: string | null;
  stream: string | null;
  subject_combination: string | null;
  created_at: string;
  updated_at: string;
};

type UserRoleRow = {
  user_id: string;
  role: "admin" | "student";
};

type ExamResultRow = {
  id: string;
  user_id: string;
  paper_id: string;
  subject_name: string | null;
  paper_title: string | null;
  medium: string | null;
  year: number | null;
  score: number;
  total_marks: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  time_taken: number;
  created_at: string;
};

type StudentSummary = {
  profile: ProfileRow;
  role: "admin" | "student";
  bestResults: ExamResultRow[];
  totalScore: number;
  totalMarks: number;
  overallPercentage: number;
  averagePercentage: number;
  bestPercentage: number;
  lastExamAt: string | null;
};

type PaperForm = {
  title: string;
  subject_id: string;
  medium: "sinhala" | "english";
  year: number;
  paper_type: PaperKind;
  difficulty: string;
  description: string;
  pdf_url: string;
  has_online_exam: boolean;
  duration_minutes: number;
  is_published: boolean;
};

type QuestionForm = {
  question_number: number;
  question_text: string;
  question_image: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  marks: number;
  explanation: string;
};

type NoteForm = {
  subject_id: string;
  topic: string;
  title: string;
  description: string;
  pdf_url: string;
  is_published: boolean;
};

const emptyPaper: PaperForm = {
  title: "",
  subject_id: "",
  medium: "sinhala",
  year: new Date().getFullYear(),
  paper_type: "past",
  difficulty: "Medium",
  description: "",
  pdf_url: "",
  has_online_exam: true,
  duration_minutes: 90,
  is_published: true,
};

const emptyQuestion: QuestionForm = {
  question_number: 1,
  question_text: "",
  question_image: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  marks: 1,
  explanation: "",
};

const emptyNote: NoteForm = {
  subject_id: "",
  topic: "",
  title: "",
  description: "",
  pdf_url: "",
  is_published: true,
};

function AdminPage() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<"admin" | "student" | "unknown">("unknown");
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [papers, setPapers] = useState<PaperRow[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [paperForm, setPaperForm] = useState<PaperForm>(emptyPaper);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(emptyQuestion);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [bulkQuestionFile, setBulkQuestionFile] = useState<File | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [notes, setNotes] = useState<ShortNoteRow[]>([]);
  const [noteForm, setNoteForm] = useState<NoteForm>(emptyNote);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [notePdfFile, setNotePdfFile] = useState<File | null>(null);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [userRoles, setUserRoles] = useState<UserRoleRow[]>([]);
  const [examResults, setExamResults] = useState<ExamResultRow[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const selectedPaper = useMemo(
    () => papers.find((p) => p.id === selectedPaperId),
    [papers, selectedPaperId],
  );

  const studentSummaries = useMemo<StudentSummary[]>(() => {
    const roleMap = new Map(userRoles.map((item) => [item.user_id, item.role]));
    const resultsByUser = new Map<string, ExamResultRow[]>();

    for (const result of examResults) {
      const list = resultsByUser.get(result.user_id) ?? [];
      list.push(result);
      resultsByUser.set(result.user_id, list);
    }

    const search = studentSearch.trim().toLowerCase();

    return profiles
      .map((profile) => {
        const attempts = resultsByUser.get(profile.id) ?? [];
        const bestByPaper = new Map<string, ExamResultRow>();

        for (const attempt of attempts) {
          const current = bestByPaper.get(attempt.paper_id);
          if (
            !current ||
            attempt.score > current.score ||
            (attempt.score === current.score && attempt.percentage > current.percentage) ||
            (attempt.score === current.score &&
              attempt.percentage === current.percentage &&
              attempt.time_taken < current.time_taken)
          ) {
            bestByPaper.set(attempt.paper_id, attempt);
          }
        }

        const bestResults = Array.from(bestByPaper.values());
        const totalScore = bestResults.reduce((sum, item) => sum + Number(item.score || 0), 0);
        const totalMarks = bestResults.reduce(
          (sum, item) => sum + Number(item.total_marks || 0),
          0,
        );
        const overallPercentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
        const averagePercentage =
          bestResults.length > 0
            ? bestResults.reduce((sum, item) => sum + Number(item.percentage || 0), 0) /
              bestResults.length
            : 0;
        const bestPercentage =
          bestResults.length > 0
            ? Math.max(...bestResults.map((item) => Number(item.percentage || 0)))
            : 0;
        const lastExamAt =
          attempts.length > 0
            ? (attempts
                .map((item) => item.created_at)
                .sort()
                .at(-1) ?? null)
            : null;

        return {
          profile,
          role: roleMap.get(profile.id) ?? "student",
          bestResults,
          totalScore,
          totalMarks,
          overallPercentage,
          averagePercentage,
          bestPercentage,
          lastExamAt,
        };
      })
      .filter(({ profile }) => {
        if (!search) return true;
        return [
          profile.full_name,
          profile.email,
          profile.phone,
          profile.district,
          profile.school,
          profile.stream,
          profile.subject_combination,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
      })
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.overallPercentage !== a.overallPercentage)
          return b.overallPercentage - a.overallPercentage;
        if (b.bestResults.length !== a.bestResults.length)
          return b.bestResults.length - a.bestResults.length;
        return (a.profile.full_name || a.profile.email || "").localeCompare(
          b.profile.full_name || b.profile.email || "",
        );
      });
  }, [examResults, profiles, studentSearch, userRoles]);

  const selectedStudent = useMemo(
    () => studentSummaries.find((student) => student.profile.id === selectedStudentId) ?? null,
    [selectedStudentId, studentSummaries],
  );

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setRole("student");
          return;
        }
        setRole(data?.some((r) => r.role === "admin") ? "admin" : "student");
      });
  }, [user]);

  useEffect(() => {
    if (role !== "admin") return;
    void refreshAll();
  }, [role]);

  useEffect(() => {
    setEditingQuestionId(null);
    if (!selectedPaperId) {
      setQuestions([]);
      setQuestionForm(emptyQuestion);
      return;
    }
    void loadQuestions(selectedPaperId);
  }, [selectedPaperId]);

  async function refreshAll() {
    const [
      { data: subjectData },
      { data: paperData, error: paperError },
      { data: noteData, error: noteError },
      { data: profileData, error: profileError },
      { data: roleData, error: roleError },
      { data: resultData, error: resultError },
    ] = await Promise.all([
      supabase.from("subjects").select("id, slug, name").order("sort_order"),
      supabase
        .from("papers")
        .select(
          "id, title, subject_id, medium, year, paper_type, difficulty, description, pdf_url, has_online_exam, duration_minutes, is_published, subjects(name)",
        )
        .in("paper_type", ["past", "model"])
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("short_notes")
        .select(
          "id, subject_id, topic, title, description, pdf_url, is_published, created_at, subjects(name)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, district, school, stream, subject_combination, created_at, updated_at",
        )
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase
        .from("exam_results")
        .select(
          "id, user_id, paper_id, subject_name, paper_title, medium, year, score, total_marks, percentage, correct_count, wrong_count, time_taken, created_at",
        )
        .order("created_at", { ascending: false }),
    ]);
    if (paperError) toast.error(paperError.message);
    if (noteError && !String(noteError.message).includes("short_notes"))
      toast.error(noteError.message);
    if (profileError) toast.error(`Student details load error: ${profileError.message}`);
    if (roleError) console.warn("User role list load warning:", roleError.message);
    if (resultError) toast.error(`Student result load error: ${resultError.message}`);

    setSubjects((subjectData ?? []) as SubjectRow[]);
    setPapers((paperData ?? []) as unknown as PaperRow[]);
    setNotes((noteData ?? []) as ShortNoteRow[]);
    setProfiles((profileData ?? []) as ProfileRow[]);
    setUserRoles((roleData ?? []) as UserRoleRow[]);
    setExamResults((resultData ?? []) as ExamResultRow[]);

    if (!paperForm.subject_id && subjectData?.[0]?.id) {
      setPaperForm((p) => ({ ...p, subject_id: subjectData[0].id }));
    }
    if (!noteForm.subject_id && subjectData?.[0]?.id) {
      setNoteForm((n) => ({ ...n, subject_id: subjectData[0].id }));
    }
  }

  async function loadQuestions(paperId: string) {
    const { data, error } = await supabase
      .from("questions")
      .select(
        "id, question_number, question_text, question_image, option_a, option_b, option_c, option_d, correct_answer, marks, explanation",
      )
      .eq("paper_id", paperId)
      .order("question_number", { ascending: true });
    if (error) {
      toast.error(error.message);
      return;
    }
    const rows = (data ?? []) as QuestionRow[];
    setQuestions(rows);
    const nextNumber = (rows.at(-1)?.question_number ?? 0) + 1;
    setQuestionForm({ ...emptyQuestion, question_number: Math.min(nextNumber, 50) });
  }

  async function uploadPdfIfNeeded(): Promise<string | null> {
    if (!pdfFile) return paperForm.pdf_url || null;
    const ext = pdfFile.name.split(".").pop() || "pdf";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("papers")
      .upload(path, pdfFile, { upsert: false });
    if (error) {
      toast.error(`PDF upload failed: ${error.message}. You can paste a PDF URL manually.`);
      return paperForm.pdf_url || null;
    }
    const { data } = supabase.storage.from("papers").getPublicUrl(path);
    return data.publicUrl;
  }

  function resetPaperForm(subjectId = paperForm.subject_id || subjects[0]?.id || "") {
    setEditingPaperId(null);
    setPdfFile(null);
    setPaperForm({ ...emptyPaper, subject_id: subjectId });
  }

  function editPaper(paper: PaperRow) {
    setEditingPaperId(paper.id);
    setSelectedPaperId(paper.id);
    setPdfFile(null);
    setPaperForm({
      title: paper.title,
      subject_id: paper.subject_id,
      medium: paper.medium,
      year: paper.year ?? new Date().getFullYear(),
      paper_type: paper.paper_type === "model" ? "model" : "past",
      difficulty: paper.difficulty ?? "Medium",
      description: paper.description ?? "",
      pdf_url: paper.pdf_url ?? "",
      has_online_exam: paper.has_online_exam,
      duration_minutes: paper.duration_minutes ?? 90,
      is_published: paper.is_published,
    });
    toast.info("Paper edit mode enabled");
  }

  async function savePaper(e: FormEvent) {
    e.preventDefault();
    if (!paperForm.title.trim()) return toast.error("Paper title අවශ්‍යයි.");
    if (!paperForm.subject_id) return toast.error("Subject එක තෝරන්න.");
    setBusy(true);
    try {
      const pdfUrl = await uploadPdfIfNeeded();
      const payload = {
        title: paperForm.title.trim(),
        subject_id: paperForm.subject_id,
        medium: paperForm.medium,
        year: Number(paperForm.year) || null,
        paper_type: paperForm.paper_type,
        difficulty: paperForm.difficulty || null,
        description: paperForm.description || null,
        pdf_url: pdfUrl,
        has_online_exam: paperForm.has_online_exam,
        duration_minutes: Number(paperForm.duration_minutes) || 90,
        is_published: paperForm.is_published,
      };

      if (editingPaperId) {
        const { error } = await supabase.from("papers").update(payload).eq("id", editingPaperId);
        if (error) throw error;
        toast.success("Paper updated");
        setSelectedPaperId(editingPaperId);
      } else {
        const { data, error } = await supabase.from("papers").insert(payload).select("id").single();
        if (error) throw error;
        toast.success("Paper saved");
        setSelectedPaperId(data.id);
      }

      const currentSubject = paperForm.subject_id;
      resetPaperForm(currentSubject);
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function deletePaper(id: string) {
    if (!confirm("මෙම paper එක delete කරන්නද?")) return;
    const { error } = await supabase.from("papers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Paper deleted");
    if (selectedPaperId === id) setSelectedPaperId("");
    if (editingPaperId === id) resetPaperForm();
    await refreshAll();
  }

  function resetQuestionForm() {
    setEditingQuestionId(null);
    const nextNumber = (questions.at(-1)?.question_number ?? 0) + 1;
    setQuestionForm({ ...emptyQuestion, question_number: Math.min(nextNumber, 50) });
  }

  function editQuestion(q: QuestionRow) {
    setEditingQuestionId(q.id);
    setQuestionForm({
      question_number: q.question_number,
      question_text: q.question_text,
      question_image: q.question_image ?? "",
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      marks: q.marks,
      explanation: q.explanation ?? "",
    });
  }

  async function saveQuestion(e: FormEvent) {
    e.preventDefault();
    if (!selectedPaperId) return toast.error("Question add කිරීමට paper එකක් තෝරන්න.");
    if (!questionForm.question_text.trim()) return toast.error("Question text අවශ්‍යයි.");
    if (
      !questionForm.option_a ||
      !questionForm.option_b ||
      !questionForm.option_c ||
      !questionForm.option_d
    ) {
      return toast.error("Option A, B, C, D සියල්ල අවශ්‍යයි.");
    }

    const payload = {
      paper_id: selectedPaperId,
      question_number: Number(questionForm.question_number),
      question_text: questionForm.question_text,
      question_image: questionForm.question_image || null,
      option_a: questionForm.option_a,
      option_b: questionForm.option_b,
      option_c: questionForm.option_c,
      option_d: questionForm.option_d,
      correct_answer: questionForm.correct_answer,
      marks: Number(questionForm.marks) || 1,
      explanation: questionForm.explanation || null,
    };

    const result = editingQuestionId
      ? await supabase.from("questions").update(payload).eq("id", editingQuestionId)
      : await supabase
          .from("questions")
          .upsert(payload, { onConflict: "paper_id,question_number" });

    if (result.error) return toast.error(result.error.message);
    await supabase.from("papers").update({ has_online_exam: true }).eq("id", selectedPaperId);
    toast.success(editingQuestionId ? "Question updated" : "Question saved");
    setEditingQuestionId(null);
    await loadQuestions(selectedPaperId);
    await refreshAll();
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Question delete කරන්නද?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Question deleted");
    if (editingQuestionId === id) resetQuestionForm();
    await loadQuestions(selectedPaperId);
  }

  function parseCsvText(text: string): Record<string, string>[] {
    const rows: string[][] = [];
    let current = "";
    let row: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(current.trim());
        current = "";
        if (row.some((cell) => cell !== "")) rows.push(row);
        row = [];
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    if (row.some((cell) => cell !== "")) rows.push(row);
    if (rows.length < 2) return [];

    const headers = rows[0].map((header) => normalizeHeader(header));
    return rows.slice(1).map((cells) => {
      const item: Record<string, string> = {};
      headers.forEach((header, index) => {
        item[header] = cells[index]?.trim() ?? "";
      });
      return item;
    });
  }

  function normalizeHeader(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  }

  function normalizeCorrectAnswer(value: string): "A" | "B" | "C" | "D" | null {
    const answer = String(value || "")
      .trim()
      .toUpperCase();
    return ["A", "B", "C", "D"].includes(answer) ? (answer as "A" | "B" | "C" | "D") : null;
  }

  async function parseQuestionSheet(file: File): Promise<Record<string, string>[]> {
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("Excel file එකේ sheet එකක් නැහැ.");
      return XLSX.utils
        .sheet_to_json<Record<string, string>>(workbook.Sheets[sheetName], {
          defval: "",
          raw: false,
        })
        .map((row) => {
          const normalized: Record<string, string> = {};
          Object.entries(row).forEach(([key, value]) => {
            normalized[normalizeHeader(key)] = String(value ?? "").trim();
          });
          return normalized;
        });
    }

    const text = await file.text();
    return parseCsvText(text);
  }

  async function bulkUploadQuestions() {
    if (!selectedPaperId) return toast.error("Bulk upload කිරීමට paper එකක් තෝරන්න.");
    if (!bulkQuestionFile) return toast.error("CSV හෝ Excel file එකක් තෝරන්න.");

    setBulkBusy(true);
    try {
      const rows = await parseQuestionSheet(bulkQuestionFile);
      if (rows.length === 0) throw new Error("File එකේ questions data නැහැ.");
      if (rows.length > 50) throw new Error("එක paper එකකට questions 50කට වැඩි upload කරන්න බැහැ.");

      const payloads = rows.map((row, index) => {
        const correctAnswer = normalizeCorrectAnswer(row.correct_answer);
        if (!correctAnswer)
          throw new Error(`Row ${index + 2}: correct_answer A/B/C/D වලින් එකක් විය යුතුයි.`);

        const questionNumber = Number(row.question_number || index + 1);
        if (!Number.isFinite(questionNumber) || questionNumber < 1 || questionNumber > 50) {
          throw new Error(`Row ${index + 2}: question_number 1-50 අතර විය යුතුයි.`);
        }
        if (!row.question_text?.trim())
          throw new Error(`Row ${index + 2}: question_text අවශ්‍යයි.`);
        if (
          !row.option_a?.trim() ||
          !row.option_b?.trim() ||
          !row.option_c?.trim() ||
          !row.option_d?.trim()
        ) {
          throw new Error(
            `Row ${index + 2}: option_a, option_b, option_c, option_d සියල්ල අවශ්‍යයි.`,
          );
        }

        return {
          paper_id: selectedPaperId,
          question_number: questionNumber,
          question_text: row.question_text.trim(),
          question_image: row.question_image?.trim() || null,
          option_a: row.option_a.trim(),
          option_b: row.option_b.trim(),
          option_c: row.option_c.trim(),
          option_d: row.option_d.trim(),
          correct_answer: correctAnswer,
          marks: Number(row.marks) || 1,
          explanation: row.explanation?.trim() || null,
        };
      });

      const duplicateQuestionNumbers = payloads
        .map((item) => item.question_number)
        .filter((number, index, all) => all.indexOf(number) !== index);
      if (duplicateQuestionNumbers.length > 0) {
        throw new Error(
          `Duplicate question_number තියෙනවා: ${Array.from(new Set(duplicateQuestionNumbers)).join(", ")}`,
        );
      }

      const { error } = await supabase
        .from("questions")
        .upsert(payloads, { onConflict: "paper_id,question_number" });
      if (error) throw error;

      await supabase.from("papers").update({ has_online_exam: true }).eq("id", selectedPaperId);
      toast.success(`${payloads.length} questions upload වුණා.`);
      setBulkQuestionFile(null);
      await loadQuestions(selectedPaperId);
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBulkBusy(false);
    }
  }

  function resetNoteForm(subjectId = noteForm.subject_id || subjects[0]?.id || "") {
    setEditingNoteId(null);
    setNotePdfFile(null);
    setNoteForm({ ...emptyNote, subject_id: subjectId });
  }

  function editNote(note: ShortNoteRow) {
    setEditingNoteId(note.id);
    setNotePdfFile(null);
    setNoteForm({
      subject_id: note.subject_id,
      topic: note.topic,
      title: note.title,
      description: note.description ?? "",
      pdf_url: note.pdf_url ?? "",
      is_published: note.is_published,
    });
    toast.info("Short note edit mode enabled");
  }

  async function uploadNotePdfIfNeeded(): Promise<string | null> {
    if (!notePdfFile) return noteForm.pdf_url || null;
    if (!user) throw new Error("Login required");
    if (notePdfFile.type && notePdfFile.type !== "application/pdf") {
      throw new Error("Short note සඳහා PDF file එකක් විතරක් upload කරන්න.");
    }

    const safeName = notePdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
    const { error } = await supabase.storage.from("short-notes").upload(path, notePdfFile, {
      upsert: false,
      contentType: "application/pdf",
    });
    if (error) throw new Error(`Short note PDF upload failed: ${error.message}`);
    const { data } = supabase.storage.from("short-notes").getPublicUrl(path);
    return data.publicUrl;
  }

  async function saveNote(e: FormEvent) {
    e.preventDefault();
    if (!noteForm.subject_id) return toast.error("Subject එක තෝරන්න.");
    if (!noteForm.topic.trim()) return toast.error("Topic අවශ්‍යයි.");
    if (!noteForm.title.trim()) return toast.error("Short note title අවශ්‍යයි.");

    setBusy(true);
    try {
      const pdfUrl = await uploadNotePdfIfNeeded();
      if (!pdfUrl) throw new Error("Short note PDF file එක upload කරන්න.");

      const payload = {
        subject_id: noteForm.subject_id,
        topic: noteForm.topic.trim(),
        title: noteForm.title.trim(),
        description: noteForm.description.trim() || null,
        pdf_url: pdfUrl,
        is_published: noteForm.is_published,
      };

      const result = editingNoteId
        ? await (supabase as any).from("short_notes").update(payload).eq("id", editingNoteId)
        : await (supabase as any).from("short_notes").insert(payload);

      if (result.error) throw result.error;
      toast.success(editingNoteId ? "Short note updated" : "Short note saved");
      const currentSubject = noteForm.subject_id;
      resetNoteForm(currentSubject);
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("මෙම short note එක delete කරන්නද?")) return;
    const { error } = await (supabase as any).from("short_notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Short note deleted");
    if (editingNoteId === id) resetNoteForm();
    await refreshAll();
  }

  if (loading)
    return (
      <SiteLayout>
        <div className="p-12 text-center">Loading...</div>
      </SiteLayout>
    );
  if (!user) {
    return (
      <SiteLayout>
        <div className="p-12 text-center">
          Admin panel බලන්න පිවිසෙන්න.{" "}
          <Link to="/admin/login" className="text-navy font-semibold underline">
            Admin Login
          </Link>
        </div>
      </SiteLayout>
    );
  }
  if (role === "unknown")
    return (
      <SiteLayout>
        <div className="p-12 text-center">Checking role...</div>
      </SiteLayout>
    );
  if (role !== "admin") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Admin access අවශ්‍යයි</h1>
          <p className="mt-2 text-muted-foreground">
            Supabase user_roles table එකේ මෙම account එක admin role එකට promote කරන්න.
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="mt-2 opacity-80">
            Papers, PDF uploads, 50 MCQ question builder, results සහ tools manage කරන්න.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {editingPaperId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingPaperId ? "Paper edit කරන්න" : "Paper add කරන්න"}
            </h2>
            {editingPaperId && (
              <Button type="button" variant="outline" size="sm" onClick={() => resetPaperForm()}>
                <XCircle className="mr-2 h-4 w-4" /> New Paper
              </Button>
            )}
          </div>

          <form onSubmit={savePaper} className="mt-5 grid gap-4">
            <Field label="Paper title">
              <Input
                value={paperForm.title}
                onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                placeholder="2023 A/L ICT Past Paper"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Subject">
                <Select
                  value={paperForm.subject_id}
                  onValueChange={(v) => setPaperForm({ ...paperForm, subject_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Medium">
                <Select
                  value={paperForm.medium}
                  onValueChange={(v) =>
                    setPaperForm({ ...paperForm, medium: v as "sinhala" | "english" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sinhala">Sinhala Medium</SelectItem>
                    <SelectItem value="english">English Medium</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Year">
                <Input
                  type="number"
                  value={paperForm.year}
                  onChange={(e) => setPaperForm({ ...paperForm, year: Number(e.target.value) })}
                />
              </Field>
              <Field label="Paper type">
                <Select
                  value={paperForm.paper_type}
                  onValueChange={(v) => setPaperForm({ ...paperForm, paper_type: v as PaperKind })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="past">Past Paper</SelectItem>
                    <SelectItem value="model">Model Paper</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Duration minutes">
                <Input
                  type="number"
                  value={paperForm.duration_minutes}
                  onChange={(e) =>
                    setPaperForm({ ...paperForm, duration_minutes: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                value={paperForm.description}
                onChange={(e) => setPaperForm({ ...paperForm, description: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="PDF file upload">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </Field>
              <Field label="or PDF URL">
                <Input
                  value={paperForm.pdf_url}
                  onChange={(e) => setPaperForm({ ...paperForm, pdf_url: e.target.value })}
                  placeholder="https://.../paper.pdf"
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paperForm.has_online_exam}
                  onChange={(e) =>
                    setPaperForm({ ...paperForm, has_online_exam: e.target.checked })
                  }
                />{" "}
                Has online exam
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paperForm.is_published}
                  onChange={(e) => setPaperForm({ ...paperForm, is_published: e.target.checked })}
                />{" "}
                Published
              </label>
            </div>
            <Button type="submit" className="btn-gold" disabled={busy}>
              <Upload className="h-4 w-4 mr-2" /> {editingPaperId ? "Update Paper" : "Save Paper"}
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Question Builder</h2>
            {selectedPaper && (
              <Button type="button" variant="outline" size="sm" onClick={resetQuestionForm}>
                <RefreshCw className="mr-2 h-4 w-4" /> New Question
              </Button>
            )}
          </div>
          <div className="mt-4">
            <Label>Paper select කරන්න</Label>
            <Select value={selectedPaperId} onValueChange={setSelectedPaperId}>
              <SelectTrigger>
                <SelectValue placeholder="Paper තෝරන්න" />
              </SelectTrigger>
              <SelectContent>
                {papers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} · {p.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPaper && (
            <form onSubmit={saveQuestion} className="mt-5 grid gap-4">
              <div className="rounded-xl bg-secondary p-3 text-sm">
                <b>{selectedPaper.title}</b> — Questions: {questions.length}/50{" "}
                {editingQuestionId && <span className="font-semibold text-navy"> · Edit mode</span>}
              </div>

              <div className="rounded-2xl border border-dashed border-navy/25 bg-navy/5 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-navy">
                      <FileSpreadsheet className="h-4 w-4" /> Bulk Question Upload
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      CSV / Excel file එකෙන් questions 50ක් එකවර add කරන්න. Columns:
                      question_number, question_text, option_a, option_b, option_c, option_d,
                      correct_answer, marks, explanation
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <Input
                    type="file"
                    accept=".csv,.tsv,.xlsx,.xls"
                    onChange={(e) => setBulkQuestionFile(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    className="btn-gold"
                    disabled={bulkBusy || !bulkQuestionFile}
                    onClick={bulkUploadQuestions}
                  >
                    <Upload className="mr-2 h-4 w-4" />{" "}
                    {bulkBusy ? "Uploading..." : "Upload Questions"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                <Field label="No">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={questionForm.question_number}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, question_number: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Question">
                  <Textarea
                    value={questionForm.question_text}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, question_text: e.target.value })
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Option A">
                  <Input
                    value={questionForm.option_a}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                  />
                </Field>
                <Field label="Option B">
                  <Input
                    value={questionForm.option_b}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                  />
                </Field>
                <Field label="Option C">
                  <Input
                    value={questionForm.option_c}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                  />
                </Field>
                <Field label="Option D">
                  <Input
                    value={questionForm.option_d}
                    onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Correct answer">
                  <Select
                    value={questionForm.correct_answer}
                    onValueChange={(v) =>
                      setQuestionForm({
                        ...questionForm,
                        correct_answer: v as "A" | "B" | "C" | "D",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((x) => (
                        <SelectItem key={x} value={x}>
                          {x}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Marks">
                  <Input
                    type="number"
                    min={1}
                    value={questionForm.marks}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, marks: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>
              <Field label="Explanation">
                <Textarea
                  value={questionForm.explanation}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, explanation: e.target.value })
                  }
                />
              </Field>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />{" "}
                {editingQuestionId ? "Update Question" : "Save Question"}
              </Button>
            </form>
          )}
        </section>
      </main>

      <section className="mx-auto max-w-7xl px-4 pb-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-xl font-bold">Papers</h2>
            <Button variant="outline" size="sm" onClick={() => void refreshAll()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Online</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {papers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    Papers නැත.
                  </td>
                </tr>
              )}
              {papers.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">
                    <button
                      className="font-semibold text-left hover:underline"
                      onClick={() => setSelectedPaperId(p.id)}
                    >
                      {p.title}
                    </button>
                    <div className="text-xs text-muted-foreground">
                      {p.subjects?.name} · {p.medium} · {p.year}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {p.paper_type === "model" ? "Model" : "Past"}
                  </td>
                  <td className="px-3 py-2 text-center">{p.has_online_exam ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => editPaper(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePaper(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Questions</h2>
          {!selectedPaperId ? (
            <p className="text-muted-foreground">Paper එකක් තෝරන්න.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-3 py-2">No</th>
                  <th className="px-3 py-2 text-left">Question</th>
                  <th className="px-3 py-2">Correct</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                      Questions නැත.
                    </td>
                  </tr>
                )}
                {questions.map((q) => (
                  <tr key={q.id} className="border-t">
                    <td className="px-3 py-2 text-center">{q.question_number}</td>
                    <td className="px-3 py-2">
                      {q.question_text.slice(0, 80)}
                      {q.question_text.length > 80 ? "..." : ""}
                    </td>
                    <td className="px-3 py-2 text-center font-bold">{q.correct_answer}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => editQuestion(q)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteQuestion(q.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Users className="h-5 w-5" /> Registered Students
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign up වූ students ලාගේ details admin panel එකෙන් විතරක් බලන්න.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Name, email, phone, district search"
                className="min-w-[260px]"
              />
              <Button variant="outline" size="sm" onClick={() => void refreshAll()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <AdminStat label="Registered students" value={studentSummaries.length} />
            <AdminStat label="Exam attempts" value={examResults.length} />
            <AdminStat
              label="Total best marks"
              value={studentSummaries.reduce((sum, item) => sum + item.totalScore, 0)}
            />
            <AdminStat
              label="Active students"
              value={studentSummaries.filter((item) => item.bestResults.length > 0).length}
            />
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2 text-left">Contact</th>
                  <th className="px-3 py-2 text-left">District / School</th>
                  <th className="px-3 py-2 text-left">Stream</th>
                  <th className="px-3 py-2 text-center">Role</th>
                  <th className="px-3 py-2 text-center">Papers</th>
                  <th className="px-3 py-2 text-center">Total</th>
                  <th className="px-3 py-2 text-center">Avg %</th>
                  <th className="px-3 py-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {studentSummaries.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                      Registered students නැත.
                    </td>
                  </tr>
                )}
                {studentSummaries.map((student) => (
                  <tr key={student.profile.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="font-semibold">{student.profile.full_name || "Student"}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {formatDate(student.profile.created_at)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>{student.profile.email || "-"}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.profile.phone || "No phone"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>{student.profile.district || "-"}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.profile.school || "No school"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>{student.profile.stream || "-"}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.profile.subject_combination || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center capitalize">{student.role}</td>
                    <td className="px-3 py-2 text-center">{student.bestResults.length}</td>
                    <td className="px-3 py-2 text-center font-semibold">
                      {student.totalScore}/{student.totalMarks || 0}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {student.averagePercentage.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedStudentId(
                            selectedStudentId === student.profile.id ? null : student.profile.id,
                          )
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedStudent && (
            <div className="mt-6 rounded-2xl border border-border bg-secondary/50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedStudent.profile.full_name || "Student"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.profile.email || "No email"} ·{" "}
                    {selectedStudent.profile.phone || "No phone"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedStudent.profile.district || "No district"} ·{" "}
                    {selectedStudent.profile.school || "No school"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudentId(null)}
                >
                  Close
                </Button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <AdminStat label="Best papers" value={selectedStudent.bestResults.length} />
                <AdminStat
                  label="Total marks"
                  value={`${selectedStudent.totalScore}/${selectedStudent.totalMarks || 0}`}
                />
                <AdminStat
                  label="Overall %"
                  value={`${selectedStudent.overallPercentage.toFixed(1)}%`}
                />
                <AdminStat label="Best %" value={`${selectedStudent.bestPercentage.toFixed(1)}%`} />
              </div>

              <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-3 py-2 text-left">Paper</th>
                      <th className="px-3 py-2 text-left">Subject</th>
                      <th className="px-3 py-2 text-center">Marks</th>
                      <th className="px-3 py-2 text-center">%</th>
                      <th className="px-3 py-2 text-center">Time</th>
                      <th className="px-3 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.bestResults.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                          Exam results තවම නැත.
                        </td>
                      </tr>
                    )}
                    {selectedStudent.bestResults.map((result) => (
                      <tr key={result.id} className="border-t">
                        <td className="px-3 py-2 font-medium">{result.paper_title || "Paper"}</td>
                        <td className="px-3 py-2">{result.subject_name || "-"}</td>
                        <td className="px-3 py-2 text-center font-semibold">
                          {result.score}/{result.total_marks}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {Number(result.percentage || 0).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-center">{formatTime(result.time_taken)}</td>
                        <td className="px-3 py-2">{formatDate(result.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText className="h-5 w-5" /> Short Notes PDF
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Subject + topic අනුව short note PDF add/edit/delete කරන්න.
              </p>
            </div>
            {editingNoteId && (
              <Button type="button" variant="outline" size="sm" onClick={() => resetNoteForm()}>
                <XCircle className="mr-2 h-4 w-4" /> New Short Note
              </Button>
            )}
          </div>

          <form onSubmit={saveNote} className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Subject">
                  <Select
                    value={noteForm.subject_id}
                    onValueChange={(v) => setNoteForm({ ...noteForm, subject_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Topic">
                  <Input
                    value={noteForm.topic}
                    onChange={(e) => setNoteForm({ ...noteForm, topic: e.target.value })}
                    placeholder="Database / Hydraulics / Gears"
                  />
                </Field>
              </div>
              <Field label="Short note title">
                <Input
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="Database Short Note 01"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  placeholder="මෙම short note එක ගැන කෙටි විස්තරයක්..."
                />
              </Field>
              <Field label="PDF upload">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNotePdfFile(e.target.files?.[0] ?? null)}
                />
              </Field>
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={noteForm.is_published}
                  onChange={(e) => setNoteForm({ ...noteForm, is_published: e.target.checked })}
                />{" "}
                Published
              </div>
              <Button type="submit" disabled={busy}>
                <Upload className="mr-2 h-4 w-4" />{" "}
                {editingNoteId ? "Update Short Note" : "Save Short Note"}
              </Button>
            </div>

            <div className="rounded-xl border border-dashed border-border p-4">
              <h3 className="font-semibold">Current PDF</h3>
              {notePdfFile ? (
                <div className="mt-4 rounded-lg border border-border bg-secondary p-4 text-sm">
                  New PDF: <span className="font-semibold">{notePdfFile.name}</span>
                </div>
              ) : noteForm.pdf_url ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary p-4 text-sm">
                  <a
                    href={noteForm.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-navy underline"
                  >
                    View current PDF
                  </a>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setNoteForm({ ...noteForm, pdf_url: "" })}
                  >
                    Remove PDF
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">PDF තවම upload කර නැත.</p>
              )}
            </div>
          </form>

          <div className="mt-8 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Topic</th>
                  <th className="px-3 py-2 text-center">PDF</th>
                  <th className="px-3 py-2 text-center">Published</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      Short notes නැත.
                    </td>
                  </tr>
                )}
                {notes.map((note) => (
                  <tr key={note.id} className="border-t">
                    <td className="px-3 py-2 font-semibold">{note.title}</td>
                    <td className="px-3 py-2">{note.subjects?.name ?? "-"}</td>
                    <td className="px-3 py-2">{note.topic}</td>
                    <td className="px-3 py-2 text-center">{note.pdf_url ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-center">{note.is_published ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        {note.pdf_url && (
                          <Button asChild size="sm" variant="outline">
                            <a href={note.pdf_url} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => editNote(note)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteNote(note.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function AdminStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold text-navy">{value}</div>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(seconds: number | null | undefined) {
  const total = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes}m ${remainder}s`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
