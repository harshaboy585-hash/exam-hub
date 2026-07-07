import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Shapes, XCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tools/diagrams")({
  head: () => ({ meta: [{ title: "Diagram Tools — TechMaster" }] }),
  component: Page,
});

const diagrams = [
  {
    name: "Four Stroke Engine",
    part: "Piston",
    labels: ["Piston", "Cylinder", "Spark Plug", "Crankshaft"],
    function: "Combustion pressure එක reciprocating motion එකට convert කරන කොටස.",
    options: ["Piston", "Gear", "Capacitor", "Nozzle"],
  },
  {
    name: "Lathe Machine",
    part: "Chuck",
    labels: ["Chuck", "Tool Post", "Tailstock", "Bed"],
    function: "Workpiece එක hold කර rotate කරන කොටස.",
    options: ["Chuck", "Piston", "Resistor", "Pump"],
  },
  {
    name: "Vernier Caliper",
    part: "Vernier Scale",
    labels: ["Main Scale", "Vernier Scale", "Fixed Jaw", "Depth Rod"],
    function: "Small measurement divisions කියවීමට භාවිත වන scale එක.",
    options: ["Vernier Scale", "Chuck", "Nozzle", "Final Drive"],
  },
  {
    name: "Micrometer",
    part: "Thimble",
    labels: ["Anvil", "Spindle", "Sleeve", "Thimble"],
    function: "Rotating scale එකක් ලෙස small measurements කියවීමට භාවිත වේ.",
    options: ["Thimble", "Piston", "RAM", "Sprocket"],
  },
  {
    name: "Hydraulic Brake System",
    part: "Master Cylinder",
    labels: ["Brake Pedal", "Master Cylinder", "Brake Line", "Wheel Cylinder"],
    function: "Brake pedal force එක hydraulic pressure එකකට convert කරයි.",
    options: ["Master Cylinder", "Alternator", "Radiator", "Gearbox"],
  },
  {
    name: "Pneumatic Circuit",
    part: "Directional Control Valve",
    labels: ["Compressor", "FRL Unit", "Directional Control Valve", "Cylinder"],
    function: "Compressed air flow direction එක control කරන valve එක.",
    options: ["Directional Control Valve", "Piston Ring", "Condenser", "Diode"],
  },
];

function Page() {
  const [selected, setSelected] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const d = diagrams[selected];

  const labelPositions = useMemo(() => [
    "left-8 top-8",
    "right-8 top-14",
    "left-12 bottom-12",
    "right-10 bottom-10",
  ], []);

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shapes className="h-7 w-7 text-gold-cta" /> Diagram Tools
          </h1>
          <p className="mt-2 opacity-80">Diagram labels, part functions සහ quiz mode.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border bg-card p-4 shadow-soft h-fit">
          <div className="text-sm font-bold mb-3">Diagram තෝරන්න</div>
          {diagrams.map((x, i) => (
            <button
              key={x.name}
              onClick={() => { setSelected(i); setAnswer(null); setShowLabels(true); }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm mb-2 ${i === selected ? "bg-navy text-white" : "bg-secondary hover:bg-secondary/70"}`}
            >
              {x.name}
            </button>
          ))}
        </aside>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{d.name}</h2>
              <p className="text-sm text-muted-foreground">Labels hide/show කරලා quiz practice කරන්න.</p>
            </div>
            <Button variant="secondary" onClick={() => setShowLabels(!showLabels)}>
              {showLabels ? "Labels hide කරන්න" : "Labels show කරන්න"}
            </Button>
          </div>

          <div className="mt-4 h-80 rounded-xl bg-secondary flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-8 rounded-full border-4 border-dashed border-navy/25" />
            <div className="absolute inset-20 rounded-xl border-4 border-navy/20 rotate-6" />
            <div className="rounded-full bg-navy text-white px-5 py-3 font-bold shadow-card">{d.name}</div>
            {showLabels && d.labels.map((label, index) => (
              <div key={label} className={`absolute ${labelPositions[index]} rounded-full bg-gold-cta px-3 py-1 text-xs font-bold shadow-soft`}>
                {label}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border p-4">
            <div className="font-bold">Selected Part: {d.part}</div>
            <p className="mt-1 text-sm text-muted-foreground">Function: {d.function}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold">Quiz: “මෙම කොටස කුමක්ද?”</h3>
            <p className="text-sm text-muted-foreground">Yellow label එකෙන් පෙන්වූ part එකට නිවැරදි පිළිතුර තෝරන්න.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {d.options.map((o) => {
                const isCorrect = o === d.part;
                const isChosen = answer === o;
                return (
                  <button
                    key={o}
                    onClick={() => setAnswer(o)}
                    className={`rounded-xl border p-3 text-left flex items-center justify-between ${
                      answer && isCorrect ? "bg-success/20 border-success" :
                      answer && isChosen && !isCorrect ? "bg-destructive/20 border-destructive" :
                      "hover:bg-secondary"
                    }`}
                  >
                    <span>{o}</span>
                    {answer && isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {answer && isChosen && !isCorrect && <XCircle className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {answer && <p className="mt-3 text-sm font-semibold">{answer === d.part ? "නිවැරදියි!" : `වැරදියි. නිවැරදි පිළිතුර: ${d.part}`}</p>}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-8"><Link to="/tools"><Button variant="secondary">← Tools වෙත ආපසු</Button></Link></div>
    </SiteLayout>
  );
}
