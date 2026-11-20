import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  loading = false,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
}) {
  return (
    <article className="flex min-h-36 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      {loading ? (
        <div className="mt-4 h-8 w-16 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-3 font-heading text-2xl font-bold text-foreground">{value}</p>
      )}
      <p className="mt-auto pt-3 text-xs text-muted-foreground">{description}</p>
    </article>
  );
}

export function DashboardTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
