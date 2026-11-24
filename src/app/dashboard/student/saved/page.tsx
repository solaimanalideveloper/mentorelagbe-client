"use client";

import Link from "next/link";
import { BookmarkProvider, useBookmarks } from "@/components/tuition/BookmarkProvider";
import { TuitionCard } from "@/components/tuition/TuitionCard";
import { Button } from "@/components/ui/button";
import { DashboardTitle } from "@/components/dashboard/DashboardParts";

function SavedTuitionsContent() {
  const { error, isLoading, retry, tuitions } = useBookmarks();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardTitle
          title="Saved Tuitions"
          description="Keep the tuition opportunities you want to revisit in one place."
        />
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/tuitions" />}
        >
          Browse Tuitions
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <Button variant="outline" onClick={retry}>Try Again</Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading saved tuitions">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : !error && tuitions.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="font-heading text-lg font-semibold">No saved tuitions yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save a listing while browsing to keep it handy here.
          </p>
        </section>
      ) : (
        <section className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tuitions.map((tuition) => (
            <TuitionCard key={tuition._id} tuition={tuition} />
          ))}
        </section>
      )}
    </div>
  );
}

export default function SavedTuitionsPage() {
  return (
    <BookmarkProvider>
      <SavedTuitionsContent />
    </BookmarkProvider>
  );
}
