import Link from "next/link";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TuitionCard } from "@/components/tuition/TuitionCard";
import { TuitionFilters } from "@/components/tuition/TuitionFilters";
import { Button } from "@/components/ui/button";
import { isObject, isTuition } from "@/lib/data";
import type { Tuition } from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;

type TuitionResult = {
  tuitions: Tuition[];
  page: number;
  totalPages: number;
  error: string;
};

async function getTuitionPage(params: SearchParams): Promise<TuitionResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return { tuitions: [], page: 1, totalPages: 1, error: "NEXT_PUBLIC_API_URL is not configured." };
  }

  const query = new URLSearchParams();
  for (const key of ["q", "subject", "classLevel", "mode", "page"]) {
    const value = params[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  query.set("limit", "9");

  try {
    const response = await fetch(`${apiUrl}/api/tuitions?${query}`, { cache: "no-store" });
    if (!response.ok) {
      return { tuitions: [], page: 1, totalPages: 1, error: `Could not load tuitions (HTTP ${response.status}).` };
    }
    const result: unknown = await response.json();
    if (
      !isObject(result) ||
      !Array.isArray(result.data) ||
      !result.data.every(isTuition) ||
      typeof result.page !== "number" ||
      typeof result.totalPages !== "number"
    ) {
      return { tuitions: [], page: 1, totalPages: 1, error: "The server returned an invalid tuition list." };
    }
    return {
      tuitions: result.data,
      page: result.page,
      totalPages: Math.max(result.totalPages, 1),
      error: "",
    };
  } catch (error) {
    return {
      tuitions: [],
      page: 1,
      totalPages: 1,
      error: error instanceof Error ? error.message : "Could not connect to the tuition service.",
    };
  }
}

async function getFilterOptions() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return { subjects: [], classLevels: [] };
  try {
    const response = await fetch(`${apiUrl}/api/tuitions/filters`, { cache: "no-store" });
    if (!response.ok) return { subjects: [], classLevels: [] };
    const data: unknown = await response.json();
    if (!isObject(data)) return { subjects: [], classLevels: [] };
    return {
      subjects: Array.isArray(data.subjects) ? data.subjects.filter((item): item is string => typeof item === "string") : [],
      classLevels: Array.isArray(data.classLevels) ? data.classLevels.filter((item): item is string => typeof item === "string") : [],
    };
  } catch {
    return { subjects: [], classLevels: [] };
  }
}

export default async function TuitionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [result, filters] = await Promise.all([getTuitionPage(params), getFilterOptions()]);
  const query = new URLSearchParams();
  for (const key of ["q", "subject", "classLevel", "mode"]) {
    const value = params[key];
    if (typeof value === "string" && value) query.set(key, value);
  }

  function pageHref(page: number) {
    const next = new URLSearchParams(query);
    next.set("page", String(page));
    return `/tuitions?${next.toString()}`;
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading title="Browse Tuitions" subtitle="Find the right tutor, subject, and schedule for your learning goals." />
      <TuitionFilters subjects={filters.subjects} classLevels={filters.classLevels} />

      {result.error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{result.error}</p>
      ) : result.tuitions.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="font-heading text-lg font-semibold">No tuitions found</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try another search or clear some filters.</p>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.tuitions.map((tuition) => <TuitionCard key={tuition._id} tuition={tuition} />)}
        </section>
      )}

      {!result.error && result.totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Tuition pagination">
          <Button variant="outline" disabled={result.page <= 1} render={<Link href={pageHref(result.page - 1)} />}>Previous</Button>
          {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((page) => (
            <Button key={page} variant={page === result.page ? "default" : "outline"} aria-current={page === result.page ? "page" : undefined} render={<Link href={pageHref(page)} />}>
              {page}
            </Button>
          ))}
          <Button variant="outline" disabled={result.page >= result.totalPages} render={<Link href={pageHref(result.page + 1)} />}>Next</Button>
        </nav>
      )}
    </main>
  );
}
