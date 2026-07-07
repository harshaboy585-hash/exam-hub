import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listSubjects } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SubjectCard } from "@/components/site/SubjectCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Button } from "@/components/ui/button";
import { Wrench, PenLine, Download, FileText } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const subjectsQ = queryOptions({ queryKey: ["subjects"], queryFn: () => listSubjects() });

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(subjectsQ);
  },
  component: Home,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-8 text-center text-destructive">{error.message}</div>
    </SiteLayout>
  ),
});

function Home() {
  const { data: subjects } = useSuspenseQuery(subjectsQ);
  const { t } = useLanguage();

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {t("TechMaster – A/L Technology Exam Hub", "TechMaster – A/L Technology Exam Hub")}
          </h1>
          <p className="mt-4 text-base md:text-lg opacity-90 max-w-3xl mx-auto">
            {t("Past Papers, Model Papers, Online Exams සහ Learning Tools එකම තැනක.", "Past Papers, Model Papers, Online Exams and Learning Tools all in one place.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/subjects"><Button className="btn-gold" size="lg"><PenLine className="mr-2 h-4 w-4" /> {t("Online Exam ආරම්භ කරන්න", "Start Online Exam")}</Button></Link>
            <Link to="/subjects"><Button className="btn-teal" size="lg"><FileText className="mr-2 h-4 w-4" /> {t("Past Papers බලන්න", "View Past Papers")}</Button></Link>
            <Link to="/subjects"><Button variant="secondary" size="lg"><Download className="mr-2 h-4 w-4" /> {t("Model Papers Download", "Download Model Papers")}</Button></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center">{t("ඔබගේ විෂය තෝරන්න", "Choose your subject")}</h2>
        <p className="text-center text-muted-foreground mt-2">{t("A/L Technology විෂයන් 4", "4 A/L Technology subjects")}</p>
        <div className="mt-8 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((s) => <SubjectCard key={s.id} slug={s.slug} name={s.name} description={s.description} icon={s.icon} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t("ජනප්‍රිය Tools", "Popular Tools")}</h2>
          <Link to="/tools" className="text-sm font-semibold text-navy hover:underline">{t("සියල්ල →", "All →")}</Link>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { t: "Ohm's Law Calculator", to: "/tools/calculators" },
            { t: "Formula Book", to: "/tools/formulas" },
            { t: "Unit Converter", to: "/tools/converters" },
            { t: "Topic MCQ Quiz", to: "/tools/mcq-quiz" },
          ].map((x) => (
            <Link key={x.t} to={x.to} className="rounded-xl border border-border bg-card p-4 shadow-soft hover:shadow-card transition-shadow">
              <Wrench className="h-5 w-5 text-navy" />
              <div className="mt-2 font-semibold text-sm">{x.t}</div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8"><AdSlot label="Google AdSense — Home bottom" /></div>
    </SiteLayout>
  );
}
