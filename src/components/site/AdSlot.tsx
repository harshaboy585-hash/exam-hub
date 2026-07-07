export function AdSlot({ label = "Google AdSense", className = "" }: { label?: string; className?: string }) {
  return (
    <div
      className={`w-full rounded-lg border border-dashed border-border bg-muted/40 flex items-center justify-center text-xs text-muted-foreground py-6 ${className}`}
    >
      {label}
    </div>
  );
}
