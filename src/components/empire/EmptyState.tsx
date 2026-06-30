import { Crest } from "./Crest";

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-card/40 px-6 py-10 text-center">
      <div className="opacity-40">
        <img src="/logo.png" alt="Empty" className="size-12 object-contain opacity-70 grayscale" />
      </div>
      <p className="font-display text-lg text-foreground">{title}</p>
      {hint ? <p className="text-sm text-muted-foreground max-w-xs">{hint}</p> : null}
    </div>
  );
}
