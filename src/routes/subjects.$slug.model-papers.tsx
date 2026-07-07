import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPapers, getSubjectBySlug } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PaperCard } from "@/components/site/PaperCard";
import { useLanguage } from "@/hooks/useLanguage";

const subjectQ = (slug: string) =>
  queryOptions({ queryKey: ["subject", slug], queryFn: () => getSubjectBySlug({ data: { slug } }) });
const papersQ = (slug: string) =>
  queryOptions({
    queryKey: ["papers", "subject", slug, "model"],
    queryFn: () => listPapers({ data: { subjectSlug: slug, paperType: "model" } }),
  });

export const Route = createFileRoute("/subjects/$slug/model-papers")({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(subjectQ(params.slug)),
      context.queryClient.fetchQuery(papersQ(params.slug)),
    ]);
  },
  component: Page,
  errorComponent: ({ error }) => (
    <SiteLayout><div className="p-8 text-destructive">{error.message}</div></SiteLayout>
  ),
});

function Page() {
  const { slug } = Route.useParams();
  const { t } = useLanguage();
  const { data: subject } = useSuspenseQuery(subjectQ(slug));
  const { data: papers } = useSuspenseQuery(papersQ(slug));

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-sm opacity-80">{subject.name}</div>
          <h1 className="text-2xl md:text-3xl font-bold">{subject.name} Model Papers</h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8">
        {papers.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">{t("තවම model papers add කර නැත.", "No model papers have been added yet.")}</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {papers.map((p) => <PaperCard key={p.id} paper={p} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
