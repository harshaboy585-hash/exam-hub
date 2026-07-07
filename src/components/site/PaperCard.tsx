import { Link } from "@tanstack/react-router";
import { Download, FileText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediumLabelSi, paperTypeLabelSi } from "@/lib/format";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

type Paper = {
  id: string;
  title: string;
  medium: string;
  year: number | null;
  paper_type: string;
  pdf_url: string | null;
  has_online_exam: boolean;
  subjects?: { name: string } | null;
};

export function PaperCard({ paper }: { paper: Paper }) {
  const { t } = useLanguage();
  const handleDownload = () => {
    if (!paper.pdf_url) {
      toast.error(t("මෙම paper එක සඳහා PDF file එකක් තවම upload කර නැත.", "A PDF file has not been uploaded for this paper yet."));
      return;
    }
    const link = document.createElement("a");
    link.href = paper.pdf_url;
    link.download = `${paper.title}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {paper.year && <span className="inline-flex items-center rounded-full bg-navy text-navy-foreground text-xs font-semibold px-3 py-1">{paper.year}</span>}
        <span className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground text-xs px-3 py-1">
          {paperTypeLabelSi[paper.paper_type] ?? paper.paper_type}
        </span>
      </div>
      <h3 className="text-lg font-bold flex items-start gap-2">
        <FileText className="h-5 w-5 mt-0.5 shrink-0 text-navy" />
        <span>{paper.title}</span>
      </h3>
      <div className="text-sm text-muted-foreground space-y-1">
        {paper.subjects?.name && <div>{t("Subject", "Subject")}: {paper.subjects.name}</div>}
        <div>{t("Medium", "Medium")}: {mediumLabelSi[paper.medium] ?? paper.medium}</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <Button onClick={handleDownload} className="btn-teal flex-1">
          <Download className="h-4 w-4 mr-2" /> PDF Download
        </Button>
        {paper.has_online_exam ? (
          <Link to="/exam/$paperId" params={{ paperId: paper.id }} className="flex-1">
            <Button className="btn-gold w-full"><PenLine className="h-4 w-4 mr-2" />{t("Online ලියන්න", "Write Online")}</Button>
          </Link>
        ) : (
          <Button className="btn-gold flex-1" onClick={() => toast.info(t("මෙම paper එක online ලිවීමට තවම ප්‍රශ්න add කර නැත. Admin panel එකෙන් questions add කරන්න.", "Questions have not been added for this online paper yet. Add them from the admin panel."))}>
            <PenLine className="h-4 w-4 mr-2" />{t("Online ලියන්න", "Write Online")}
          </Button>
        )}
      </div>
    </div>
  );
}
