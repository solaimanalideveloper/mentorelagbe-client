export default function StudentDashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" role="status" aria-label="Loading student dashboard">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-36 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}
