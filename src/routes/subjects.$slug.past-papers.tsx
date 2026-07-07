import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listPapers, getSubjectBySlug } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PaperCard } from "@/components/site/PaperCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";

const subjectQ = (slug: string) =>
  queryOptions({ queryKey: ["subject", slug], queryFn: () => getSubjectBySlug({ data: { slug } }) });
const papersQ = (slug: string) =>
  queryOptions({
    queryKey: ["papers", "subject", slug, "past"],
    queryFn: () => listPapers({ data: { subjectSlug: slug, paperType: "past" } }),
  });

export const Route = createFileRoute("/subjects/$slug/past-papers")({
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
  const [search, setSearch] = useState("");
  const [medium, setMedium] = useState<string>("all");
  const [year, setYear] = useState<string>("all");

  const years = Array.from(new Set(papers.map((p) => p.year).filter(Boolean))) as number[];

  const filtered = papers.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (medium !== "all" && p.medium !== medium) return false;
    if (year !== "all" && String(p.year) !== year) return false;
    return true;
  });

  const groups = ["sinhala", "english"] as const;

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-sm opacity-80">{subject.name}</div>
          <h1 className="text-2xl md:text-3xl font-bold">A/L {subject.name} Past Papers</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder={t("Search...", "Search...")} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={medium} onValueChange={setMedium}>
            <SelectTrigger><SelectValue placeholder="Medium" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("සියලුම මාධ්‍ය", "All Media")}</SelectItem>
              <SelectItem value="sinhala">Sinhala Medium</SelectItem>
              <SelectItem value="english">English Medium</SelectItem>
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("සියලුම අවුරුදු", "All Years")}</SelectItem>
              {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <AdSlot label="Google AdSense — content" />
      </div>

      {groups.map((g) => {
        const items = filtered.filter((p) => p.medium === g);
        if (items.length === 0) return null;
        return (
          <section key={g} className="mx-auto max-w-7xl px-4 py-6">
            <h2 className="text-xl font-bold mb-4">
              {g === "sinhala" ? "Sinhala Medium" : "English Medium"}
            </h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => <PaperCard key={p.id} paper={p} />)}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="mx-auto max-w-7xl px-4 py-12 text-center text-muted-foreground">
          {t("තවම past papers add කර නැත.", "No past papers have been added yet.")}
        </div>
      )}
    </SiteLayout>
  );
}
