import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/tuition/ApplyForm";
import { BookmarkButton } from "@/components/tuition/BookmarkButton";
import { BookmarkProvider } from "@/components/tuition/BookmarkProvider";
import axios from "axios";
import { publicApi } from "@/lib/api";
import { formatTaka, isObject, isTuition } from "@/lib/data";
import type { Tuition } from "@/types";
import Image from "next/image";

async function getTuition(id: string): Promise<{ tuition: Tuition | null; error: string }> {
  if (!process.env.NEXT_PUBLIC_API_URL) return { tuition: null, error: "NEXT_PUBLIC_API_URL is not configured." };

  try {
    const response = await publicApi.get<unknown>(`/api/tuitions/${encodeURIComponent(id)}`);
    const data = response.data;
    const item = isObject(data) && "data" in data ? data.data : data;
    return isTuition(item)
      ? { tuition: item, error: "" }
      : { tuition: null, error: "The server returned an invalid tuition record." };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) notFound();
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return {
      tuition: null,
      error: status
        ? `Could not load this tuition (HTTP ${status}).`
        : error instanceof Error
          ? error.message
          : "Could not connect to the tuition service.",
    };
  }
}

async function TuitionDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tuition, error } = await getTuition(id);

  if (!tuition) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <h1 className="font-heading text-xl font-bold text-foreground">Could not load this tuition</h1>
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <Link href="/tuitions" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
            Browse all tuitions
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <article className="min-w-0">
        {tuition.bannerImage ? (
          <Image
            src={tuition.bannerImage}
            alt={`${tuition.title} tuition banner`}
            width={1280}
            height={720}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="aspect-video w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl bg-primary/10 font-heading text-3xl font-bold text-primary">{tuition.subject}</div>
        )}
        <div className="mt-7 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{tuition.subject}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{tuition.classLevel}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{tuition.mode}</span>
        </div>
        <h1 className="mt-4 font-heading text-3xl font-bold text-foreground md:text-4xl">{tuition.title}</h1>
        <div className="mt-5 grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
          <p><span className="text-sm text-muted-foreground">Monthly fee</span><strong className="mt-1 block text-lg">{formatTaka(tuition.monthlyFee)}</strong></p>
          <p><span className="text-sm text-muted-foreground">Schedule</span><strong className="mt-1 block">{tuition.daysPerWeek} days per week</strong></p>
          <p><span className="text-sm text-muted-foreground">Location</span><strong className="mt-1 block">{tuition.location || tuition.mode}</strong></p>
          <p><span className="text-sm text-muted-foreground">Tutor</span><strong className="mt-1 block">{tuition.tutorName}</strong></p>
        </div>
        <section className="mt-8">
          <h2 className="font-heading text-xl font-bold">About this tuition</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{tuition.description}</p>
        </section>
        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-xl font-bold">Tutor summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">{tuition.tutorName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{tuition.tutorEmail}</p>
        </section>
      </article>
      <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
        <BookmarkProvider>
          <div className="mb-5 flex justify-end">
            <BookmarkButton tuition={tuition} />
          </div>
          <h2 className="font-heading text-xl font-bold">Apply for this tuition</h2>
          <p className="mt-1 text-sm text-muted-foreground">Share your contact details and preferred time.</p>
          <div className="mt-5"><ApplyForm tuitionId={tuition._id} /></div>
        </BookmarkProvider>
      </aside>
    </main>
  );
}

function TuitionDetailsFallback() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8" role="status" aria-label="Loading tuition details">
      <div className="space-y-5">
        <div className="aspect-video animate-pulse rounded-2xl bg-muted" />
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-muted" />
    </main>
  );
}

export default function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TuitionDetailsFallback />}>
      <TuitionDetailsContent params={params} />
    </Suspense>
  );
}
