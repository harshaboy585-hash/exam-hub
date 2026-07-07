import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BookOpen, ArrowLeftRight, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/tools/")({
  head: () => ({ meta: [{ title: "Tools — TechMaster" }] }),
  component: Page,
});

const categories = [
  { title: "Formula Book", desc: "සියලුම විෂයන් සඳහා formulas + examples.", to: "/tools/formulas", icon: BookOpen },
  { title: "Unit Converters", desc: "Length, mass, time, pressure, power etc.", to: "/tools/converters", icon: ArrowLeftRight },
  { title: "Topic MCQ Quiz", desc: "Online papers වල MCQ questions වලින් practice කරන්න.", to: "/tools/mcq-quiz", icon: HelpCircle },
];

function Page() {
  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold">Tools</h1>
          <p className="mt-2 opacity-80">A/L Technology සිසුන් සඳහා formulas, converters සහ MCQ practice tools.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.title} to={c.to} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-card transition-shadow">
            <c.icon className="h-8 w-8 text-navy" />
            <div className="mt-3 text-lg font-bold">{c.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{c.desc}</div>
          </Link>
        ))}
      </section>
    </SiteLayout>
  );
}
