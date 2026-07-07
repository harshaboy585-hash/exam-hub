import { Link } from "@tanstack/react-router";
import { Cog, Atom, Leaf, Cpu, BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const ICONS: Record<string, typeof Cog> = { Cog, Atom, Leaf, Cpu, settings: Cog, atom: Atom, leaf: Leaf, monitor: Cpu, ict: Cpu };

export function SubjectCard({ slug, name, description, icon }: { slug: string; name: string; description: string | null; icon: string | null }) {
  const Icon = (icon && ICONS[icon]) || BookOpen;
  const { t } = useLanguage();
  return (
    <Link to="/subjects/$slug" params={{ slug }} className="group block rounded-2xl bg-subject-blue text-subject-blue-foreground p-6 shadow-soft hover:shadow-card transition-shadow border border-border">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-navy text-navy-foreground flex items-center justify-center"><Icon className="h-6 w-6" /></div>
        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{name}</h3>
      {description && <p className="mt-2 text-sm opacity-80">{description}</p>}
      <div className="mt-4 text-sm font-semibold text-navy">{t("විවෘත කරන්න →", "Open →")}</div>
    </Link>
  );
}
