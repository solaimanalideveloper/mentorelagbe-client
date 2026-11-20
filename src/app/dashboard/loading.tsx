export default function DashboardLoadingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" role="status" aria-label="Loading dashboard">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}
