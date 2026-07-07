import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tools/converters")({
  head: () => ({ meta: [{ title: "Unit Converters — TechMaster" }] }),
  component: Page,
});

const UNIT_GROUPS = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048 },
  Mass: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592 },
  Time: { s: 1, min: 60, h: 3600 },
  Pressure: { Pa: 1, kPa: 1000, bar: 100000, psi: 6894.757 },
  Power: { W: 1, kW: 1000, hp: 745.7 },
  Energy: { J: 1, kJ: 1000, Wh: 3600, kWh: 3600000 },
  Speed: { "m/s": 1, "km/h": 0.277778, mph: 0.44704 },
} as const;

const TEMPERATURE_UNITS = ["°C", "°F", "K"] as const;
type NormalGroupName = keyof typeof UNIT_GROUPS;
type GroupName = NormalGroupName | "Temperature";

function convertTemperature(value: number, from: string, to: string) {
  let celsius = value;
  if (from === "°F") celsius = (value - 32) * (5 / 9);
  if (from === "K") celsius = value - 273.15;
  if (to === "°F") return celsius * (9 / 5) + 32;
  if (to === "K") return celsius + 273.15;
  return celsius;
}

function getUnits(group: GroupName) {
  if (group === "Temperature") return [...TEMPERATURE_UNITS];
  return Object.keys(UNIT_GROUPS[group]);
}

function Page() {
  const [group, setGroup] = useState<GroupName>("Length");
  const units = getUnits(group);
  const [from, setFrom] = useState(units[0]);
  const [to, setTo] = useState(units[1] ?? units[0]);
  const [val, setVal] = useState("1");

  const result = useMemo(() => {
    const input = Number(val || 0);
    if (!Number.isFinite(input)) return null;
    if (group === "Temperature") return convertTemperature(input, from, to);
    const map = UNIT_GROUPS[group] as Record<string, number>;
    return (input * map[from]) / map[to];
  }, [group, from, to, val]);

  const changeGroup = (g: string) => {
    const next = g as GroupName;
    const u = getUnits(next);
    setGroup(next);
    setFrom(u[0]);
    setTo(u[1] ?? u[0]);
  };

  const swapUnits = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <SiteLayout>
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="h-7 w-7 text-gold-cta" /> Unit Converters
          </h1>
          <p className="mt-2 opacity-80">Length, mass, time, pressure, power, energy, speed සහ temperature convert කරන්න.</p>
        </div>
      </section>
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
          <div>
            <label className="text-sm font-medium">Unit category</label>
            <Select value={group} onValueChange={changeGroup}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...Object.keys(UNIT_GROUPS), "Temperature"].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Input value</label>
            <Input className="mt-1" type="number" value={val} onChange={(e) => setVal(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="text-sm font-medium">From</label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{units.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="secondary" onClick={swapUnits} className="sm:mb-0">
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <div>
              <label className="text-sm font-medium">To</label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{units.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border bg-secondary p-6 text-center">
            <div className="text-sm text-muted-foreground">ප්‍රතිඵලය</div>
            <div className="text-3xl font-bold text-navy mt-1">
              {result == null ? "—" : result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {to}
            </div>
          </div>
        </div>
        <Link to="/tools"><Button variant="secondary" className="w-full">← Tools වෙත ආපසු</Button></Link>
      </div>
    </SiteLayout>
  );
}
