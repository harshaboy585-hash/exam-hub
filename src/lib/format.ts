export const mediumLabelSi: Record<string, string> = {
  sinhala: "Sinhala Medium",
  english: "English Medium",
};
export const paperTypeLabelSi: Record<string, string> = {
  past: "Past Paper",
  model: "Model Paper",
};
export function formatPercent(n: number) {
  return `${n.toFixed(1)}%`;
}
export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
