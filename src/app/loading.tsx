export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" role="status" aria-label="Loading page">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-video animate-pulse bg-muted" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
