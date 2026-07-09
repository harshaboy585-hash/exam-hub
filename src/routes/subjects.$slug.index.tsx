import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSubjectBySlug } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FileText, BookMarked, PenLine, Wrench } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const subjectQ = (slug: string) =>
  queryOptions({
    queryKey: ["subject", slug],
    queryFn: () => getSubjectBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/subjects/$slug/")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(subjectQ(params.slug));
  },
  component: Page,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-8 text-destructive">{error.message}</div>
    </SiteLayout>
  ),
});

function Page() {
  const { slug } = Route.useParams();
  const { data: subject } = useSuspenseQuery(subjectQ(slug));
  const { t } = useLanguage();

  const actions = [
    {
      to: "/subjects/$slug/past-papers",
      title: "Past Papers",
      label: t("පසුගිය ප්‍රශ්න පත්‍ර බලන්න", "View past papers"),
      icon: FileText,
      color: "bg-teal-cta text-teal-cta-foreground",
    },
    {
      to: "/subjects/$slug/model-papers",
      title: "Model Papers",
      label: t("ආදර්ශ ප්‍රශ්න පත්‍ර බලන්න", "View model papers"),
      icon: BookMarked,
      color: "bg-navy text-navy-foreground",
    },
    {
      to: "/subjects/$slug/exams",
      title: "Online Exam",
      label: t("Online Paper ලියන්න", "Write online paper"),
      icon: PenLine,
      color: "bg-gold-cta text-gold-cta-foreground",
    },
    {
      to: "/subjects/$slug/short-notes",
      title: "Short Notes",
      label: t("Short note PDF බලන්න", "View short note PDFs"),
      icon: FileText,
      color: "bg-gradient-to-br from-sky-500 to-blue-700 text-white",
    },
    {
      to: "/tools",
      title: "Tools",
      label: t("Tools භාවිත කරන්න", "Use tools"),
      icon: Wrench,
      color: "bg-subject-blue text-subject-blue-foreground",
    },
  ] as const;

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="text-sm opacity-80">{subject.name}</div>
          <h1 className="text-2xl md:text-4xl font-bold">{subject.name} Dashboard</h1>
          {subject.description && (
            <p className="mt-2 opacity-80 max-w-3xl">{subject.description}</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-2xl font-bold text-center">
          {t("ඔබට අවශ්‍ය කොටස තෝරන්න", "Choose what you need")}
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          {t(
            "Past papers, model papers, online exams සහ tools වලට මෙතනින් යන්න.",
            "Go to past papers, model papers, online exams and tools from here.",
          )}
        </p>
        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {actions.map((a) => (
            <Link
              key={a.title}
              to={a.to}
              params={{ slug }}
              className={`rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow ${a.color}`}
            >
              <a.icon className="h-8 w-8" />
              <div className="mt-4 text-lg font-bold">{a.title}</div>
              <div className="mt-1 text-sm opacity-90">{a.label}</div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
