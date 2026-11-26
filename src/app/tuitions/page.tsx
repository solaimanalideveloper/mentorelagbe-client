import { Suspense } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TuitionCard } from "@/components/tuition/TuitionCard";
import { TuitionFilters } from "@/components/tuition/TuitionFilters";
import { BookmarkProvider } from "@/components/tuition/BookmarkProvider";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { publicApi } from "@/lib/api";
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
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return { tuitions: [], page: 1, totalPages: 1, error: "NEXT_PUBLIC_API_URL is not configured." };
  }

  const query = new URLSearchParams();
  for (const key of ["q", "subject", "classLevel", "mode", "page"]) {
    const value = params[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  query.set("limit", "9");

  try {
    const response = await publicApi.get<unknown>("/api/tuitions", { params: query });
    const result = response.data;
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
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return {
      tuitions: [],
      page: 1,
      totalPages: 1,
      error: status
        ? `Could not load tuitions (HTTP ${status}).`
        : error instanceof Error
          ? error.message
          : "Could not connect to the tuition service.",
    };
  }
}

type FilterOptions = {
  subjects: string[];
  classLevels: string[];
  error: string;
};

async function getFilterOptions(): Promise<FilterOptions> {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return {
      subjects: [],
      classLevels: [],
      error: "Filter options need NEXT_PUBLIC_API_URL configured.",
    };
  }
  try {
    const response = await publicApi.get<unknown>("/api/tuitions/filters");
    const data = response.data;
    if (
      !isObject(data) ||
      !Array.isArray(data.subjects) ||
      !data.subjects.every((item) => typeof item === "string") ||
      !Array.isArray(data.classLevels) ||
      !data.classLevels.every((item) => typeof item === "string")
    ) {
      return {
        subjects: [],
        classLevels: [],
        error: "The server returned invalid tuition filter options.",
      };
    }
    return {
      subjects: data.subjects,
      classLevels: data.classLevels,
      error: "",
    };
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return {
      subjects: [],
      classLevels: [],
      error: status
        ? `Could not load tuition filters (HTTP ${status}).`
        : error instanceof Error
          ? error.message
          : "Could not connect to the tuition filters.",
    };
  }
}

async function TuitionBrowseContent({
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
      <SectionHeading as="h1" title="Browse Tuitions" subtitle="Find the right tutor, subject, and schedule for your learning goals." />
      {filters.error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {filters.error}
        </p>
      )}
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
          <BookmarkProvider>
          {result.tuitions.map((tuition) => <TuitionCard key={tuition._id} tuition={tuition} />)}
          </BookmarkProvider>
        </section>
      )}

      {!result.error && result.totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Tuition pagination">
          <Button variant="outline" nativeButton={false} disabled={result.page <= 1} render={<Link href={pageHref(result.page - 1)} />}>Previous</Button>
          {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((page) => (
            <Button key={page} variant={page === result.page ? "default" : "outline"} nativeButton={false} aria-current={page === result.page ? "page" : undefined} render={<Link href={pageHref(page)} />}>
              {page}
            </Button>
          ))}
          <Button variant="outline" nativeButton={false} disabled={result.page >= result.totalPages} render={<Link href={pageHref(result.page + 1)} />}>Next</Button>
        </nav>
      )}
    </main>
  );
}

function TuitionBrowseFallback() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8" role="status" aria-label="Loading tuitions">
      <div className="h-16 max-w-2xl animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-80 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </main>
  );
}

export default function TuitionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense fallback={<TuitionBrowseFallback />}>
      <TuitionBrowseContent searchParams={searchParams} />
    </Suspense>
  );
}
