import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { startExam, submitExam } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { formatTime, mediumLabelSi } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/exam/$paperId/start")({
  component: Page,
});

function Page() {
  const { paperId } = Route.useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const startFn = useServerFn(startExam);
  const submitFn = useServerFn(submitExam);

  const { data, isLoading, error } = useQuery({
    queryKey: ["exam", paperId, "start"],
    queryFn: () => startFn({ data: { paperId } }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D" | null>>({});
  const [idx, setIdx] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const durationSec = (data?.paper.duration_minutes ?? 90) * 60;
  const remaining = Math.max(0, durationSec - elapsed);

  useEffect(() => {
    if (!data) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [data]);

  const submitMut = useMutation({
    mutationFn: (payload: { paperId: string; timeTaken: number; answers: { questionId: string; selected: "A" | "B" | "C" | "D" | null }[] }) =>
      submitFn({ data: payload }),
    onSuccess: (res) => {
      toast.success("Submit වුනා!");
      navigate({ to: "/exam-result/$resultId", params: { resultId: res.resultId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const doSubmit = () => {
    if (!data) return;
    submitMut.mutate({
      paperId,
      timeTaken: elapsed,
      answers: data.questions.map((q) => ({ questionId: q.id, selected: answers[q.id] ?? null })),
    });
  };

  useEffect(() => {
    if (data && remaining === 0 && !submitMut.isPending) doSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, data]);

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);

  if (isLoading) return <SiteLayout><div className="p-12 text-center">Loading exam...</div></SiteLayout>;
  if (error) return <SiteLayout><div className="p-12 text-center text-destructive">{(error as Error).message}</div></SiteLayout>;
  if (!data) return null;

  const q = data.questions[idx];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header bar */}
        <div className="rounded-xl bg-navy text-navy-foreground p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs opacity-80">{data.paper.subjects?.name} · {mediumLabelSi[data.paper.medium]} · {data.paper.year}</div>
            <div className="font-bold">{data.paper.title}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              {t("පිළිතුරු", "Answered")}: <span className="font-bold">{answeredCount}/{data.questions.length}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-gold-cta text-gold-cta-foreground px-3 py-1 font-mono font-bold">
              <Clock className="h-4 w-4" />{formatTime(remaining)}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
          {/* Question */}
          <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
            <div className="text-sm text-muted-foreground">{t("ප්‍රශ්නය", "Question")} {q.question_number} / {data.questions.length}</div>
            <div className="mt-2 text-lg font-semibold whitespace-pre-wrap">{q.question_text}</div>
            {q.question_image && <img src={q.question_image} alt="" className="mt-3 max-h-60 rounded" />}
            <div className="mt-6 space-y-2">
              {(["A", "B", "C", "D"] as const).map((k) => {
                const val = q[`option_${k.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d"];
                const selected = answers[q.id] === k;
                return (
                  <label
                    key={k}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      selected ? "border-navy bg-navy/5" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="mt-1"
                      checked={selected}
                      onChange={() => setAnswers({ ...answers, [q.id]: k })}
                    />
                    <div><span className="font-bold mr-2">{k}.</span>{val}</div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="secondary" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> {t("පෙර", "Previous")}
              </Button>
              {idx < data.questions.length - 1 ? (
                <Button onClick={() => setIdx(idx + 1)}>
                  {t("ඊළඟ", "Next")} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button className="btn-gold" onClick={() => setConfirmOpen(true)}>{t("Submit කරන්න", "Submit")}</Button>
              )}
            </div>
          </div>

          {/* Grid nav */}
          <aside className="rounded-2xl border border-border bg-card p-4 shadow-soft h-fit">
            <div className="font-semibold text-sm mb-3">{t("ප්‍රශ්න Grid", "Question Grid")}</div>
            <div className="grid grid-cols-5 gap-2">
              {data.questions.map((qq, i) => {
                const answered = !!answers[qq.id];
                const active = i === idx;
                return (
                  <button
                    key={qq.id}
                    onClick={() => setIdx(i)}
                    className={`h-9 rounded text-sm font-semibold border ${
                      active ? "border-navy" : "border-transparent"
                    } ${answered ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"}`}
                  >
                    {qq.question_number}
                  </button>
                );
              })}
            </div>
            <Button className="btn-gold w-full mt-4" onClick={() => setConfirmOpen(true)}>{t("Paper එක Submit කරන්න", "Submit Exam")}</Button>
          </aside>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paper එක submit කරන්නද?</AlertDialogTitle>
            <AlertDialogDescription>
              ඔබ ප්‍රශ්න {answeredCount}/{data.questions.length}කට පිළිතුරු දී ඇත. Submit කිරීමෙන් පසු වෙනස් කළ නොහැක.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doSubmit} disabled={submitMut.isPending}>
              {submitMut.isPending ? "Submitting..." : "Yes, Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteLayout>
  );
}
