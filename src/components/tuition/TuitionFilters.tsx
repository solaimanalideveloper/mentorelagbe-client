"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TuitionFiltersProps = {
  subjects: string[];
  classLevels: string[];
};

function SearchField({
  initialQuery,
  onChange,
}: {
  initialQuery: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div className="space-y-2">
      <Label htmlFor="tuition-search">Search tuitions</Label>
      <Input
        id="tuition-search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange(event.target.value);
        }}
        placeholder="Title or subject"
      />
    </div>
  );
}

export function TuitionFilters({ subjects, classLevels }: TuitionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
  }, []);

  function updateSearch(value: string) {
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const trimmedQuery = value.trim();
      if (trimmedQuery) params.set("q", trimmedQuery);
      else params.delete("q");
      params.delete("page");
      const nextQuery = params.toString();
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, {
        scroll: false,
      });
    }, 400);
  }

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const nextQuery = params.toString();
    router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, {
      scroll: false,
    });
  }

  return (
    <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr_1fr]">
      <SearchField
        key={searchParams.get("q") || ""}
        initialQuery={searchParams.get("q") || ""}
        onChange={updateSearch}
      />
      <div className="space-y-2">
        <Label htmlFor="subject-filter">Subject</Label>
        <select
          id="subject-filter"
          value={searchParams.get("subject") || ""}
          onChange={(event) => updateFilter("subject", event.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All subjects</option>
          {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="class-filter">Class level</Label>
        <select
          id="class-filter"
          value={searchParams.get("classLevel") || ""}
          onChange={(event) => updateFilter("classLevel", event.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All classes</option>
          {classLevels.map((level) => <option key={level} value={level}>{level}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mode-filter">Mode</Label>
        <select
          id="mode-filter"
          value={searchParams.get("mode") || ""}
          onChange={(event) => updateFilter("mode", event.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Online &amp; offline</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
      </div>
    </section>
  );
}
