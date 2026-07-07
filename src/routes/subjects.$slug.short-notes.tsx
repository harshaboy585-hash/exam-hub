import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Download, FileText, Search } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { AdSlot } from "@/components/site/AdSlot";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/subjects/$slug/short-notes")({
  head: () => ({ meta: [{ title: "Short Notes — TechMaster" }] }),
  component: ShortNotesPage,
});

type SubjectRow = { id: string; slug: string; name: string };
type ShortNote = {
  id: string;
  subject_id: string;
  topic: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  is_published: boolean;
  created_at: string;
  subjects?: { name?: string | null; slug?: string | null } | null;
};

function ShortNotesPage() {
  const { slug } = Route.useParams();
  const [subject, setSubject] = useState<SubjectRow | null>(null);
  const [notes, setNotes] = useState<ShortNote[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [openNote, setOpenNote] = useState<ShortNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          ),
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id, slug, name")
        .eq("slug", slug)
        .single();
      setSubject(subjectData as SubjectRow | null);

      if (subjectData?.id) {
        const { data } = await (supabase as any)
          .from("short_notes")
          .select(
            "id, subject_id, topic, title, description, pdf_url, is_published, created_at, subjects(name, slug)",
          )
          .eq("subject_id", subjectData.id)
          .eq("is_published", true)
          .order("created_at", { ascending: false });
        setNotes((data ?? []) as ShortNote[]);
      } else {
        setNotes([]);
      }
      setLoading(false);
    }

    void load();
  }, [slug]);

  const topics = useMemo(
    () => ["all", ...Array.from(new Set(notes.map((n) => n.topic).filter(Boolean)))],
    [notes],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((note) => {
      const topicOk = selectedTopic === "all" || note.topic === selectedTopic;
      const queryOk =
        !q || `${note.title} ${note.topic} ${note.description ?? ""}`.toLowerCase().includes(q);
      return topicOk && queryOk;
    });
  }, [notes, query, selectedTopic]);

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="text-sm opacity-80">{subject?.name ?? "Subject"}</div>
          <h1 className="text-3xl font-bold">Short Notes</h1>
          <p className="mt-2 max-w-3xl opacity-80">
            Topic අනුව short note PDF බලන්න. Admin upload කරන notes මෙතන පේනවා.
          </p>
        </div>
      </section>
      <AdSlot label="short notes top" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Short note search කරන්න..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Button
                key={topic}
                type="button"
                variant={selectedTopic === topic ? "default" : "outline"}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic === "all" ? "All topics" : topic}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
            Loading short notes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 h-10 w-10" />
            මෙම subject එකට short notes තවම add කර නැත.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((note) => (
              <div
                key={note.id}
                className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-navy/10 text-navy">
                  <FileText className="h-10 w-10" />
                </div>
                <div className="mt-4 text-xs font-semibold text-gold-cta">{note.topic}</div>
                <h2 className="mt-1 text-lg font-bold text-navy">{note.title}</h2>
                {note.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {note.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => setOpenNote(note)} disabled={!note.pdf_url}>
                    View PDF
                  </Button>
                  {note.pdf_url && (
                    <Button asChild variant="outline">
                      <a href={note.pdf_url} download target="_blank" rel="noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {openNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">
            <div className="shrink-0 border-b bg-background p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gold-cta">{openNote.topic}</div>
                  <h2 className="truncate text-lg font-bold text-navy sm:text-xl">{openNote.title}</h2>
                  {openNote.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {openNote.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {openNote.pdf_url && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open(openNote.pdf_url!, "_blank")}
                    >
                      Open
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={() => setOpenNote(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
            {openNote.pdf_url ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                <iframe
                  src={
                    isMobile
                      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(openNote.pdf_url)}`
                      : `${openNote.pdf_url}#toolbar=1&navpanes=0&scrollbar=1`
                  }
                  title={openNote.title}
                  className={
                    isMobile
                      ? "w-full border-0 h-[3000px] pointer-events-none"
                      : "h-[78dvh] min-h-[560px] w-full border-0 sm:h-[calc(92dvh-92px)]"
                  }
                  scrolling={isMobile ? "no" : "yes"}
                />
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">PDF නැත.</div>
            )}
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
