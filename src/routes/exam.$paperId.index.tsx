import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getPaper } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Clock, ListChecks, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mediumLabelSi } from "@/lib/format";
import { useLanguage } from "@/hooks/useLanguage";

const q = (id: string) =>
  queryOptions({ queryKey: ["paper", id], queryFn: () => getPaper({ data: { paperId: id } }) });

export const Route = createFileRoute("/exam/$paperId/")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(q(params.paperId)),
  component: Page,
  errorComponent: ({ error }) => (
    <SiteLayout><div className="p-8 text-destructive">{error.message}</div></SiteLayout>
  ),
});

function Page() {
  const { paperId } = Route.useParams();
  const { t } = useLanguage();
  const { data: paper } = useSuspenseQuery(q(paperId));
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card shadow-card p-8">
          <div className="text-sm text-muted-foreground">{paper.subjects?.name}</div>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{paper.title}</h1>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>{t("Medium", "Medium")}: <span className="font-semibold">{mediumLabelSi[paper.medium]}</span></div>
            <div>{t("Year", "Year")}: <span className="font-semibold">{paper.year ?? "-"}</span></div>
          </div>

          <div className="mt-6 rounded-xl bg-secondary p-4 space-y-2 text-sm">
            <div className="font-bold flex items-center gap-2"><ListChecks className="h-4 w-4" /> {t("උපදෙස්", "Instructions")}</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("ප්‍රශ්න 50කින් යුත් MCQ paper එකකි.", "This is an MCQ paper with up to 50 questions.")}</li>
              <li>{t("එක් ප්‍රශ්නයකට ලකුණු 1කි.", "Each question carries 1 mark.")}</li>
              <li>{t("වැරදි පිළිතුරු සඳහා ලකුණු අඩු නොකෙරේ.", "No marks are deducted for wrong answers.")}</li>
              <li>කාලය: <span className="font-semibold inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {paper.duration_minutes} minutes</span></li>
              <li>{t("Submit කිරීමට පෙර සියලුම ප්‍රශ්නවලට පිළිතුරු දෙන්න.", "Answer all questions before submitting.")}</li>
            </ul>
          </div>

          {!loading && !user && (
            <div className="mt-4 rounded-lg bg-gold-cta/20 border border-gold-cta/40 p-3 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                {t("Online exam ලිවීමට පිවිසෙන්න හෝ ලියාපදිංචි වන්න.", "Login or register to write the online exam.")}
                <Link to="/auth" className="font-semibold underline ml-1">පිවිසෙන්න</Link>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              className="btn-gold"
              size="lg"
              disabled={!user}
              onClick={() => navigate({ to: "/exam/$paperId/start", params: { paperId } })}
            >
              {t("Exam ආරම්භ කරන්න", "Start Exam")}
            </Button>
            <Link to="/"><Button variant="secondary" size="lg">{t("Cancel", "Cancel")}</Button></Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
