import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/tools/formulas")({
  head: () => ({ meta: [{ title: "Formula Book — TechMaster" }] }),
  component: Page,
});

const formulas = [
  {
    subject: "Engineering Technology",
    topic: "Mechanics",
    name: "Torque",
    formula: "T = F × d",
    explanation: "බලය සහ perpendicular distance ගුණ කිරීමෙන් torque ලැබේ.",
    example: "F = 50 N, d = 0.2 m නම් T = 10 Nm",
    calculator: "/tools/calculators",
  },
  {
    subject: "Engineering Technology",
    topic: "Machines",
    name: "Efficiency",
    formula: "η = Output / Input × 100",
    explanation: "Input එකට සාපේක්ෂව useful output ප්‍රතිශතයයි.",
    example: "Output = 80, Input = 100 නම් η = 80%",
    calculator: "/tools/calculators",
  },
  {
    subject: "Engineering Technology",
    topic: "Gears",
    name: "Gear Ratio",
    formula: "Gear Ratio = Driven Teeth / Driver Teeth",
    explanation: "Driven gear teeth count එක driver gear teeth count එකෙන් බෙදා gear ratio ගණනය කරයි.",
    example: "Driven = 40, Driver = 20 නම් Ratio = 2:1",
    calculator: "/tools/calculators",
  },
  {
    subject: "Science for Technology",
    topic: "Physics",
    name: "Pressure",
    formula: "P = F / A",
    explanation: "ඒකක ප්‍රදේශයකට ක්‍රියා කරන බලය pressure ලෙස හැඳින්වේ.",
    example: "F = 100 N, A = 0.02 m² නම් P = 5000 Pa",
    calculator: "/tools/calculators",
  },
  {
    subject: "Science for Technology",
    topic: "Power",
    name: "Power",
    formula: "P = W / t",
    explanation: "කාල ඒකකයකදී සිදු කරන වැඩ ප්‍රමාණය power වේ.",
    example: "W = 1000 J, t = 5 s නම් P = 200 W",
    calculator: "/tools/calculators",
  },
  {
    subject: "Science for Technology",
    topic: "Density",
    name: "Density",
    formula: "ρ = m / V",
    explanation: "ඒකක පරිමාවකට ඇති ස්කන්ධය density වේ.",
    example: "m = 10 kg, V = 2 m³ නම් ρ = 5 kg/m³",
    calculator: "/tools/converters",
  },
  {
    subject: "ICT",
    topic: "Digital Basics",
    name: "Binary place value",
    formula: "Decimal = Σ(bit × 2ⁿ)",
    explanation: "Binary number එක decimal කිරීමට එක් එක් bit එකේ place value එක ගුණ කර එකතු කරයි.",
    example: "1011₂ = 8 + 0 + 2 + 1 = 11₁₀",
    calculator: "/tools/mcq-quiz",
  },
  {
    subject: "ICT",
    topic: "Data Size",
    name: "Storage conversion",
    formula: "1 KB = 1024 bytes, 1 MB = 1024 KB",
    explanation: "Computer storage units convert කිරීම සඳහා 1024 multiplier එක භාවිත වේ.",
    example: "2 MB = 2048 KB",
    calculator: "/tools/converters",
  },
  {
    subject: "Bio Systems Technology",
    topic: "Productivity",
    name: "Yield",
    formula: "Yield = Total production / Area",
    explanation: "කෘෂිකාර්මික output එක area එකකට සාපේක්ෂව ගණනය කරයි.",
    example: "Production = 1000 kg, Area = 2 ha නම් Yield = 500 kg/ha",
    calculator: "/tools/calculators",
  },
  {
    subject: "Engineering Technology",
    topic: "Electricity",
    name: "Ohm’s Law",
    formula: "V = I × R",
    explanation: "Voltage, current සහ resistance අතර සම්බන්ධතාවයයි.",
    example: "I = 2 A, R = 6 Ω නම් V = 12 V",
    calculator: "/tools/calculators",
  },
];

function Page() {
  const [subject, setSubject] = useState("all");
  const [query, setQuery] = useState("");
  const subjects = useMemo(() => Array.from(new Set(formulas.map((f) => f.subject))), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return formulas.filter((f) => {
      const subjectOk = subject === "all" || f.subject === subject;
      const searchOk = !q || [f.subject, f.topic, f.name, f.formula, f.explanation].join(" ").toLowerCase().includes(q);
      return subjectOk && searchOk;
    });
  }, [subject, query]);

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-gold-cta" /> Formula Book
          </h1>
          <p className="mt-2 opacity-80">A/L Technology formulas, Sinhala explanation සහ examples.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-3 md:grid-cols-[1fr_260px] mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Formula, topic, subject search කරන්න..." className="pl-9" />
          </div>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((f) => (
            <div key={`${f.subject}-${f.topic}-${f.name}`} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="text-xs text-muted-foreground">{f.subject} · {f.topic}</div>
              <h3 className="mt-1 text-lg font-bold">{f.name}</h3>
              <div className="mt-2 rounded bg-secondary p-3 font-mono text-lg text-center text-navy">{f.formula}</div>
              <p className="mt-2 text-sm">{f.explanation}</p>
              <p className="mt-2 text-sm text-muted-foreground"><b>Example:</b> {f.example}</p>
              <a href={f.calculator}>
                <Button variant="secondary" size="sm" className="mt-3">Related tool open කරන්න</Button>
              </a>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">මෙම search එකට formulas නැත.</div>
        )}
      </section>
      <div className="text-center pb-8">
        <Link to="/tools"><Button variant="secondary">← Tools වෙත ආපසු</Button></Link>
      </div>
    </SiteLayout>
  );
}
