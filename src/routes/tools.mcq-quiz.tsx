import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/tools/mcq-quiz")({
  head: () => ({ meta: [{ title: "Topic MCQ Quiz — TechMaster" }] }),
  component: Page,
});

type QuizQuestion = {
  id: string;
  paper_id: string;
  paper_title: string;
  subject: string;
  topic: string;
  question_number: number;
  question_text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
};

type AnsweredQuestion = QuizQuestion & { selectedIndex: number; isCorrect: boolean };

type PaperRow = {
  id: string;
  title: string;
  subject_id: string;
  has_online_exam: boolean;
  is_published: boolean;
  subjects?: { name?: string | null } | null;
};

type QuestionRow = {
  id: string;
  paper_id: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
};

const letters = ["A", "B", "C", "D"] as const;

function Page() {
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [subject, setSubject] = useState("all");
  const [paperId, setPaperId] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      const { data: paperRows, error: paperError } = await supabase
        .from("papers")
        .select("id, title, subject_id, has_online_exam, is_published, subjects(name)")
        .eq("is_published", true)
        .eq("has_online_exam", true);

      if (paperError || !paperRows || paperRows.length === 0) {
        setAllQuestions([]);
        setLoading(false);
        return;
      }

      const paperMap = new Map<string, PaperRow>();
      for (const paper of paperRows as unknown as PaperRow[]) paperMap.set(paper.id, paper);

      const { data: questionRows, error: questionError } = await supabase
        .from("questions")
        .select("id, paper_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation")
        .in("paper_id", Array.from(paperMap.keys()))
        .order("question_number", { ascending: true });

      if (questionError) {
        setAllQuestions([]);
        setLoading(false);
        return;
      }

      const mapped = ((questionRows ?? []) as QuestionRow[]).map((q) => {
        const paper = paperMap.get(q.paper_id);
        return {
          id: q.id,
          paper_id: q.paper_id,
          paper_title: paper?.title ?? "Online paper",
          subject: paper?.subjects?.name ?? "Subject",
          topic: paper?.title ?? "Online paper MCQ",
          question_number: q.question_number,
          question_text: q.question_text,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctIndex: letters.indexOf(q.correct_answer),
          explanation: q.explanation,
        } satisfies QuizQuestion;
      });

      setAllQuestions(mapped);
      setLoading(false);
    }

    void loadQuestions();
  }, []);

  const subjects = useMemo(() => Array.from(new Set(allQuestions.map((q) => q.subject))).sort(), [allQuestions]);
  const papers = useMemo(() => {
    const source = subject === "all" ? allQuestions : allQuestions.filter((q) => q.subject === subject);
    const map = new Map<string, string>();
    for (const q of source) map.set(q.paper_id, q.paper_title);
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [allQuestions, subject]);

  const filtered = useMemo(() => {
    return allQuestions.filter(
      (q) => (subject === "all" || q.subject === subject) && (paperId === "all" || q.paper_id === paperId),
    );
  }, [allQuestions, paperId, subject]);

  const pendingQuestions = useMemo(() => {
    const answeredIds = new Set(answered.map((q) => q.id));
    return filtered.filter((q) => !answeredIds.has(q.id));
  }, [answered, filtered]);

  const current = pendingQuestions[currentIndex] ?? pendingQuestions[0] ?? null;
  const correctCount = answered.filter((q) => q.isCorrect).length;

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setChecked(false);
    setAnswered([]);
  };

  const changeSubject = (value: string) => {
    setSubject(value);
    setPaperId("all");
    resetQuiz();
  };

  const changePaper = (value: string) => {
    setPaperId(value);
    resetQuiz();
  };

  const checkAnswer = () => {
    if (selectedIndex === null) return;
    setChecked(true);
  };

  const goNext = () => {
    if (!current || selectedIndex === null) return;
    const item: AnsweredQuestion = {
      ...current,
      selectedIndex,
      isCorrect: selectedIndex === current.correctIndex,
    };
    setAnswered((list) => [...list, item]);
    setSelectedIndex(null);
    setChecked(false);
    setCurrentIndex(0);
  };

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <HelpCircle className="h-7 w-7 text-gold-cta" /> Topic MCQ Quiz
          </h1>
          <p className="mt-2 opacity-80">All online paper MCQ questions are used here for quick practice.</p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={subject} onValueChange={changeSubject}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={paperId} onValueChange={changePaper}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Online Papers</SelectItem>
              {papers.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading questions...</p>
          ) : !current ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-navy">Quiz completed</div>
              <p className="mt-2 text-muted-foreground">Marks: {correctCount}/{answered.length}</p>
              <Button className="btn-gold mt-4" onClick={resetQuiz}><RotateCcw className="mr-2 h-4 w-4" />Try Again</Button>
            </div>
          ) : (
            <div>
              <div className="text-xs text-muted-foreground">{current.subject} · {current.paper_title}</div>
              <h2 className="mt-2 text-lg font-bold">{answered.length + 1}. {current.question_text}</h2>
              <div className="mt-4 grid gap-2">
                {current.options.map((opt, index) => {
                  const chosen = selectedIndex === index;
                  const correct = current.correctIndex === index;
                  const wrongChosen = checked && chosen && !correct;
                  return (
                    <button
                      key={`${current.id}-${index}`}
                      type="button"
                      disabled={checked}
                      onClick={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                        checked && correct ? "border-success bg-success/20 text-success" :
                        wrongChosen ? "border-destructive bg-destructive/20 text-destructive" :
                        chosen ? "border-navy bg-navy/5" : "hover:bg-secondary"
                      }`}
                    >
                      <span>{letters[index]}. {opt}</span>
                      {checked && correct && <CheckCircle2 className="h-5 w-5" />}
                      {wrongChosen && <XCircle className="h-5 w-5" />}
                    </button>
                  );
                })}
              </div>

              {checked && selectedIndex !== null && (
                <div className={`mt-4 rounded-xl border p-4 ${selectedIndex === current.correctIndex ? "border-success bg-success/10" : "border-destructive bg-destructive/10"}`}>
                  <div className="font-semibold">
                    {selectedIndex === current.correctIndex ? "Correct answer" : "Wrong answer"}
                  </div>
                  {selectedIndex !== current.correctIndex && (
                    <p className="mt-1 text-sm">Correct answer: <b className="text-success">{letters[current.correctIndex]}. {current.options[current.correctIndex]}</b></p>
                  )}
                  {current.explanation && <p className="mt-2 text-sm text-muted-foreground">{current.explanation}</p>}
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-between gap-3">
                <div className="text-sm text-muted-foreground">Progress: {answered.length}/{filtered.length}</div>
                {!checked ? (
                  <Button className="btn-gold" onClick={checkAnswer} disabled={selectedIndex === null}>Check Answer</Button>
                ) : (
                  <Button className="btn-gold" onClick={goNext}>{pendingQuestions.length <= 1 ? "Finish Quiz" : "Next Question"}</Button>
                )}
              </div>
            </div>
          )}
        </div>

        {answered.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="text-xl font-bold text-navy">Answered Questions</h2>
            {answered.map((q, index) => (
              <div key={q.id} className={`rounded-2xl border p-4 ${q.isCorrect ? "border-success bg-success/10" : "border-destructive bg-destructive/10"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{q.subject} · {q.paper_title}</div>
                    <div className="font-semibold">{index + 1}. {q.question_text}</div>
                    <p className="mt-1 text-sm">Your answer: <b>{letters[q.selectedIndex]}. {q.options[q.selectedIndex]}</b></p>
                    {!q.isCorrect && <p className="text-sm">Correct answer: <b className="text-success">{letters[q.correctIndex]}. {q.options[q.correctIndex]}</b></p>}
                  </div>
                  {q.isCorrect ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/tools"><Button variant="secondary">← Tools</Button></Link>
        </div>
      </section>
    </SiteLayout>
  );
}
