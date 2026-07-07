import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listSubjects } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SubjectCard } from "@/components/site/SubjectCard";
import { useLanguage } from "@/hooks/useLanguage";

const q = queryOptions({ queryKey: ["subjects"], queryFn: () => listSubjects() });

export const Route = createFileRoute("/subjects/")({
  head: () => ({
    meta: [
      { title: "විෂයන් — TechMaster" },
      { name: "description", content: "A/L Technology විෂයන් 4: Engineering Technology, Science for Technology, Bio Systems Technology, ICT." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: Page,
  errorComponent: ({ error }) => (
    <SiteLayout><div className="p-8 text-destructive">{error.message}</div></SiteLayout>
  ),
});

function Page() {
  const { data } = useSuspenseQuery(q);
  const { t } = useLanguage();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold text-center">{t("ඔබගේ විෂය තෝරන්න", "Choose your subject")}</h1>
        <p className="text-center text-muted-foreground mt-2">{t("Past papers, model papers, online exams සහ tools සඳහා විෂය එකක් තෝරන්න.", "Choose a subject for past papers, model papers, online exams and tools.")}</p>
        <div className="mt-8 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((s) => (
            <SubjectCard key={s.id} slug={s.slug} name={s.name} description={s.description} icon={s.icon} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
