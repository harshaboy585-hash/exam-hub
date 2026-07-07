import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/tools/calculators")({
  head: () => ({ meta: [{ title: "Calculators — TechMaster" }] }),
  component: Page,
});

type Field = { key: string; label: string; unit?: string };
type CalculatorDef = {
  title: string;
  category: string;
  formula: string;
  explanation: string;
  example: string;
  fields: Field[];
  unit: string;
  calculate: (values: Record<string, number>) => number | null;
};

const calculators: Record<string, CalculatorDef> = {
  ohmVoltage: {
    title: "Ohm’s Law — Voltage",
    category: "Electrical",
    formula: "V = I × R",
    explanation: "Current සහ resistance දන්නා විට voltage ගණනය කරයි.",
    example: "I = 2 A, R = 6 Ω නම් V = 12 V",
    fields: [
      { key: "i", label: "Current", unit: "A" },
      { key: "r", label: "Resistance", unit: "Ω" },
    ],
    unit: "V",
    calculate: (v) => v.i * v.r,
  },
  ohmCurrent: {
    title: "Ohm’s Law — Current",
    category: "Electrical",
    formula: "I = V / R",
    explanation: "Voltage සහ resistance දන්නා විට current ගණනය කරයි.",
    example: "V = 12 V, R = 6 Ω නම් I = 2 A",
    fields: [
      { key: "v", label: "Voltage", unit: "V" },
      { key: "r", label: "Resistance", unit: "Ω" },
    ],
    unit: "A",
    calculate: (v) => (v.r === 0 ? null : v.v / v.r),
  },
  ohmResistance: {
    title: "Ohm’s Law — Resistance",
    category: "Electrical",
    formula: "R = V / I",
    explanation: "Voltage සහ current දන්නා විට resistance ගණනය කරයි.",
    example: "V = 12 V, I = 2 A නම් R = 6 Ω",
    fields: [
      { key: "v", label: "Voltage", unit: "V" },
      { key: "i", label: "Current", unit: "A" },
    ],
    unit: "Ω",
    calculate: (v) => (v.i === 0 ? null : v.v / v.i),
  },
  electricalPower: {
    title: "Electrical Power",
    category: "Electrical",
    formula: "P = V × I",
    explanation: "Voltage සහ current ගුණ කළාම electrical power ලැබේ.",
    example: "V = 230 V, I = 2 A නම් P = 460 W",
    fields: [
      { key: "v", label: "Voltage", unit: "V" },
      { key: "i", label: "Current", unit: "A" },
    ],
    unit: "W",
    calculate: (v) => v.v * v.i,
  },
  pressure: {
    title: "Pressure Calculator",
    category: "Hydraulic / Pneumatic",
    formula: "P = F / A",
    explanation: "බලය ප්‍රදේශයෙන් බෙදා pressure ගණනය කරයි.",
    example: "F = 100 N, A = 0.02 m² නම් P = 5000 Pa",
    fields: [
      { key: "f", label: "Force", unit: "N" },
      { key: "a", label: "Area", unit: "m²" },
    ],
    unit: "Pa",
    calculate: (v) => (v.a === 0 ? null : v.f / v.a),
  },
  hydraulicForce: {
    title: "Hydraulic Force",
    category: "Hydraulic / Pneumatic",
    formula: "F = P × A",
    explanation: "Hydraulic pressure සහ piston area අනුව force ගණනය කරයි.",
    example: "P = 500 kPa, A = 0.01 m² නම් F = 5000 N",
    fields: [
      { key: "p", label: "Pressure", unit: "Pa" },
      { key: "a", label: "Area", unit: "m²" },
    ],
    unit: "N",
    calculate: (v) => v.p * v.a,
  },
  cylinderArea: {
    title: "Cylinder Area",
    category: "Hydraulic / Pneumatic",
    formula: "A = πd² / 4",
    explanation: "Cylinder bore diameter එකෙන් piston area ගණනය කරයි.",
    example: "d = 0.05 m නම් A = 0.001963 m²",
    fields: [{ key: "d", label: "Diameter", unit: "m" }],
    unit: "m²",
    calculate: (v) => (Math.PI * v.d * v.d) / 4,
  },
  torque: {
    title: "Torque Calculator",
    category: "Engineering",
    formula: "T = F × d",
    explanation: "බලය සහ perpendicular distance ගුණ කළාම torque ලැබේ.",
    example: "F = 50 N, d = 0.2 m නම් T = 10 Nm",
    fields: [
      { key: "f", label: "Force", unit: "N" },
      { key: "d", label: "Distance", unit: "m" },
    ],
    unit: "Nm",
    calculate: (v) => v.f * v.d,
  },
  mechanicalPower: {
    title: "Mechanical Power",
    category: "Engineering",
    formula: "P = W / t",
    explanation: "කරන ලද වැඩ ප්‍රමාණය කාලයෙන් බෙදා power ගණනය කරයි.",
    example: "W = 1000 J, t = 5 s නම් P = 200 W",
    fields: [
      { key: "w", label: "Work", unit: "J" },
      { key: "t", label: "Time", unit: "s" },
    ],
    unit: "W",
    calculate: (v) => (v.t === 0 ? null : v.w / v.t),
  },
  efficiency: {
    title: "Efficiency Calculator",
    category: "Engineering",
    formula: "η = Output / Input × 100",
    explanation: "Input එකට සාපේක්ෂව useful output ප්‍රතිශතය ගණනය කරයි.",
    example: "Output = 80, Input = 100 නම් η = 80%",
    fields: [
      { key: "out", label: "Output" },
      { key: "input", label: "Input" },
    ],
    unit: "%",
    calculate: (v) => (v.input === 0 ? null : (v.out / v.input) * 100),
  },
  gearRatio: {
    title: "Gear Ratio",
    category: "Engineering",
    formula: "Gear Ratio = Driven Teeth / Driver Teeth",
    explanation: "Driven gear teeth count එක driver gear teeth count එකෙන් බෙදා gear ratio ගණනය කරයි.",
    example: "Driven = 40, Driver = 20 නම් Ratio = 2:1",
    fields: [
      { key: "driven", label: "Driven Gear Teeth" },
      { key: "driver", label: "Driver Gear Teeth" },
    ],
    unit: ":1",
    calculate: (v) => (v.driver === 0 ? null : v.driven / v.driver),
  },
  speedRatio: {
    title: "Speed Ratio",
    category: "Engineering",
    formula: "Speed Ratio = Input Speed / Output Speed",
    explanation: "Input speed සහ output speed අතර ratio එක ගණනය කරයි.",
    example: "Input = 1500 rpm, Output = 500 rpm නම් Ratio = 3",
    fields: [
      { key: "input", label: "Input Speed", unit: "rpm" },
      { key: "output", label: "Output Speed", unit: "rpm" },
    ],
    unit: ":1",
    calculate: (v) => (v.output === 0 ? null : v.input / v.output),
  },
  stress: {
    title: "Stress Calculator",
    category: "Engineering",
    formula: "σ = F / A",
    explanation: "Cross-sectional area එකකට ක්‍රියා කරන force එකෙන් stress ගණනය කරයි.",
    example: "F = 1000 N, A = 0.0005 m² නම් σ = 2 MPa",
    fields: [
      { key: "f", label: "Force", unit: "N" },
      { key: "a", label: "Area", unit: "m²" },
    ],
    unit: "Pa",
    calculate: (v) => (v.a === 0 ? null : v.f / v.a),
  },
  strain: {
    title: "Strain Calculator",
    category: "Engineering",
    formula: "ε = ΔL / L",
    explanation: "Length change එක original length එකෙන් බෙදා strain ගණනය කරයි.",
    example: "ΔL = 2 mm, L = 1000 mm නම් ε = 0.002",
    fields: [
      { key: "change", label: "Change in Length" },
      { key: "original", label: "Original Length" },
    ],
    unit: "",
    calculate: (v) => (v.original === 0 ? null : v.change / v.original),
  },
  fuelCost: {
    title: "Fuel Cost Calculator",
    category: "Automobile Tools",
    formula: "Cost = Distance / km per litre × Price",
    explanation: "ගමන් දුර, fuel economy, fuel price අනුව fuel cost ගණනය කරයි.",
    example: "Distance = 100 km, 10 km/L, Rs. 370/L නම් Cost = Rs. 3700",
    fields: [
      { key: "distance", label: "Distance", unit: "km" },
      { key: "economy", label: "Fuel economy", unit: "km/L" },
      { key: "price", label: "Fuel price", unit: "Rs/L" },
    ],
    unit: "Rs",
    calculate: (v) => (v.economy === 0 ? null : (v.distance / v.economy) * v.price),
  },
  tyreDiameter: {
    title: "Tyre Diameter",
    category: "Automobile Tools",
    formula: "Diameter = Rim × 25.4 + 2 × Width × Aspect Ratio / 100",
    explanation: "Tyre size 205/55R16 වගේ values වලින් total diameter ගණනය කරයි.",
    example: "205/55R16 නම් diameter ≈ 632 mm",
    fields: [
      { key: "width", label: "Width", unit: "mm" },
      { key: "aspect", label: "Aspect Ratio", unit: "%" },
      { key: "rim", label: "Rim", unit: "inch" },
    ],
    unit: "mm",
    calculate: (v) => v.rim * 25.4 + 2 * v.width * (v.aspect / 100),
  },
  engineRpm: {
    title: "Engine RPM Estimate",
    category: "Automobile Tools",
    formula: "RPM = Wheel RPM × Gear Ratio × Final Drive",
    explanation: "Wheel RPM, gear ratio සහ final drive ratio මගින් engine RPM approximate ගණනය කරයි.",
    example: "Wheel RPM = 500, Gear = 2, Final = 4 නම් RPM = 4000",
    fields: [
      { key: "wheel", label: "Wheel RPM", unit: "rpm" },
      { key: "gear", label: "Gear Ratio" },
      { key: "final", label: "Final Drive Ratio" },
    ],
    unit: "rpm",
    calculate: (v) => v.wheel * v.gear * v.final,
  },
};

type CalcKey = keyof typeof calculators;

function Page() {
  const [type, setType] = useState<CalcKey>("ohmVoltage");
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<number | null>(null);
  const meta = calculators[type];

  const categories = useMemo(() => Array.from(new Set(Object.values(calculators).map((c) => c.category))), []);

  const runCalculation = () => {
    const parsed: Record<string, number> = {};
    for (const field of meta.fields) {
      const value = Number(values[field.key]);
      if (!Number.isFinite(value)) {
        setResult(null);
        return;
      }
      parsed[field.key] = value;
    }
    const out = meta.calculate(parsed);
    setResult(out == null || !Number.isFinite(out) ? null : out);
  };

  const reset = () => {
    setValues({});
    setResult(null);
  };

  const selectCalculator = (value: string) => {
    setType(value as CalcKey);
    setValues({});
    setResult(null);
  };

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-7 w-7 text-gold-cta" /> Calculators
          </h1>
          <p className="mt-2 opacity-80">Engineering, Electrical, Hydraulic / Pneumatic සහ Automobile calculators.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-4 shadow-soft h-fit">
          <div className="text-sm font-bold mb-3">Calculator තෝරන්න</div>
          {categories.map((cat) => (
            <div key={cat} className="mb-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2">{cat}</div>
              <div className="space-y-2">
                {Object.entries(calculators)
                  .filter(([, c]) => c.category === cat)
                  .map(([key, calc]) => (
                    <button
                      key={key}
                      onClick={() => selectCalculator(key)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        type === key ? "bg-navy text-white" : "bg-secondary hover:bg-secondary/70"
                      }`}
                    >
                      {calc.title}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="rounded-xl bg-secondary p-4 text-center">
            <div className="text-xs font-semibold text-muted-foreground">{meta.category}</div>
            <h2 className="text-xl md:text-2xl font-bold">{meta.title}</h2>
            <div className="mt-2 font-mono text-xl md:text-2xl text-navy">{meta.formula}</div>
            <p className="mt-2 text-sm text-muted-foreground">{meta.explanation}</p>
            <p className="mt-2 text-xs text-muted-foreground"><b>Example:</b> {meta.example}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {meta.fields.map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium">
                  {field.label} {field.unit ? <span className="text-muted-foreground">({field.unit})</span> : null}
                </label>
                <Input
                  type="number"
                  value={values[field.key] ?? ""}
                  onChange={(e) => {
                    setValues({ ...values, [field.key]: e.target.value });
                    setResult(null);
                  }}
                  placeholder="Value"
                  className="mt-1"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button className="btn-gold" onClick={runCalculation}>Calculate</Button>
            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
            <Select value={type} onValueChange={selectCalculator}>
              <SelectTrigger className="w-full sm:w-[280px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(calculators).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 rounded-xl border border-border p-6 text-center">
            <div className="text-sm text-muted-foreground">Answer</div>
            <div className="mt-1 text-3xl font-bold text-navy">
              {result == null ? "—" : result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {meta.unit}
            </div>
            {result == null && (
              <p className="mt-2 text-xs text-muted-foreground">Values දාලා Calculate button එක click කරන්න.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <Link to="/tools"><Button variant="secondary">← Tools වෙත ආපසු</Button></Link>
        </div>
      </section>
    </SiteLayout>
  );
}
