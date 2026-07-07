import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getExamResult } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Trophy, CheckCircle2, XCircle, RotateCw, Download, Clock, Award, Percent, BadgeCheck } from "lucide-react";
import { formatTime } from "@/lib/format";
import { AdSlot } from "@/components/site/AdSlot";
import { toast } from "sonner";
import type { ReactNode } from "react";

export const Route = createFileRoute("/exam-result/$resultId")({
  component: Page,
});

type AnswerKey = "A" | "B" | "C" | "D";

type AnswerLog = {
  question_id: string;
  question_number: number;
  question_text: string;
  options: Record<AnswerKey, string>;
  selected: AnswerKey | null;
  correct: AnswerKey;
  is_correct: boolean;
  explanation: string | null;
};

function Page() {
  const { t } = useLanguage();
  const { resultId } = Route.useParams();
  const fn = useServerFn(getExamResult);
  const { data, isLoading, error } = useQuery({
    queryKey: ["exam-result", resultId],
    queryFn: () => fn({ data: { resultId } }),
  });

  if (isLoading) return <SiteLayout><div className="p-12 text-center">{t("ප්‍රතිඵලය load වෙමින්...", "Result loading...")}</div></SiteLayout>;
  if (error) return <SiteLayout><div className="p-12 text-center text-destructive">{(error as Error).message}</div></SiteLayout>;
  if (!data) return null;

  const { result, rank, paperPdfUrl } = data;
  const answers = (result.answers as unknown as AnswerLog[]) ?? [];
  const percentage = Number(result.percentage || 0);

  const downloadPdf = () => {
    if (!paperPdfUrl) {
      toast.error(t("මෙම paper එක සඳහා PDF file එකක් තවම upload කර නැත.", "A PDF file has not been uploaded for this paper yet."));
      return;
    }
    window.open(paperPdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("විභාග ප්‍රතිඵලය", "Exam Result")}</h1>
          <p className="mt-2 text-sm md:text-base opacity-90">{result.paper_title}</p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="rounded-2xl border border-border bg-card p-5 md:p-7 text-center shadow-card">
          <p className="text-sm text-muted-foreground">{t("ඔබගේ ලකුණු", "Your Marks")}</p>
          <div className="mt-1 text-5xl font-extrabold text-destructive">
            {result.score}<span className="text-2xl text-muted-foreground">/{result.total_marks}</span>
          </div>
          <div className="mt-1 text-xl font-bold text-destructive">{percentage.toFixed(0)}%</div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryBox
              icon={<CheckCircle2 className="h-6 w-6" />}
              label={t("නිවැරදි", "Correct")}
              value={String(result.correct_count)}
              className="bg-green-50 text-green-700 border-green-100"
            />
            <SummaryBox
              icon={<XCircle className="h-6 w-6" />}
              label={t("වැරදි", "Wrong")}
              value={String(result.wrong_count)}
              className="bg-red-50 text-red-700 border-red-100"
            />
            <SummaryBox
              icon={<Award className="h-6 w-6" />}
              label={t("Rank එක", "Rank")}
              value={`#${rank}`}
              className="bg-blue-50 text-blue-700 border-blue-100"
            />
            <SummaryBox
              icon={<Clock className="h-6 w-6" />}
              label={t("කාලය", "Time")}
              value={formatTime(result.time_taken)}
              className="bg-yellow-50 text-yellow-700 border-yellow-100"
            />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Button type="button" className="btn-teal" onClick={downloadPdf}>
              <Download className="h-4 w-4 mr-2" /> {t("PDF බාගත කරන්න", "Download PDF")}
            </Button>
            <Link to="/exam/$paperId" params={{ paperId: result.paper_id }}>
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                <RotateCw className="h-4 w-4 mr-2" /> {t("නැවත උත්සාහ කරන්න", "Try Again")}
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button className="btn-gold w-full">
                <Trophy className="h-4 w-4 mr-2" /> {t("Leaderboard බලන්න", "View Leaderboard")}
              </Button>
            </Link>
          </div>
        </section>

        <div className="my-6"><AdSlot label="Google AdSense — content slot" /></div>

        <section className="rounded-2xl border border-border bg-card p-5 md:p-7 shadow-soft">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-bold text-navy">
            <BadgeCheck className="h-6 w-6" /> {t("පිළිතුරු සමාලෝචනය", "Answer Review")}
          </h2>

          <div className="mt-5 space-y-4">
            {answers.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
                {t("පිළිතුරු සමාලෝචනය සඳහා දත්ත නොමැත.", "No answer review data available.")}
              </div>
            ) : (
              answers.map((a) => <AnswerReviewCard key={a.question_id} answer={a} t={t} />)
            )}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function SummaryBox({ icon, label, value, className }: { icon: ReactNode; label: string; value: string; className: string }) {
  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <div className="mx-auto flex h-9 w-9 items-center justify-center">{icon}</div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );
}

function AnswerReviewCard({ answer, t }: { answer: AnswerLog; t: (si: string, en: string) => string }) {
  const selectedLabel = answer.selected ? `${answer.selected}. ${answer.options[answer.selected]}` : "—";
  const correctLabel = `${answer.correct}. ${answer.options[answer.correct]}`;

  return (
    <article
      className={`rounded-xl border p-4 md:p-5 ${
        answer.is_correct ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
            answer.is_correct ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {answer.question_number}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-navy whitespace-pre-wrap">{answer.question_text}</h3>
            {answer.is_correct ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-500" />
            )}
          </div>

          <div className="mt-3 space-y-1 text-sm">
            <p>
              <span className={answer.is_correct ? "font-semibold text-green-700" : "font-semibold text-red-600"}>
                {t("ඔබගේ පිළිතුර:", "Your answer:")}
              </span>{" "}
              <span className={answer.is_correct ? "text-green-700" : "text-red-600"}>{selectedLabel}</span>
            </p>
            <p>
              <span className="font-semibold text-green-700">{t("නිවැරදි පිළිතුර:", "Correct answer:")}</span>{" "}
              <span className="font-semibold text-green-700">{correctLabel}</span>
            </p>
          </div>

          {answer.explanation && (
            <div className="mt-3 rounded-lg bg-white/70 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-navy">{t("පැහැදිලි කිරීම: ", "Explanation: ")}</span>{answer.explanation}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
