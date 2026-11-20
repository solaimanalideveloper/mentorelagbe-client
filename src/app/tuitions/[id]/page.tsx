import { notFound } from "next/navigation";
import { ApplyForm } from "@/components/tuition/ApplyForm";
import { formatTaka, isObject, isTuition } from "@/lib/data";
import type { Tuition } from "@/types";

async function getTuition(id: string): Promise<{ tuition: Tuition | null; error: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return { tuition: null, error: "NEXT_PUBLIC_API_URL is not configured." };

  try {
    const response = await fetch(`${apiUrl}/api/tuitions/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (response.status === 404) notFound();
    if (!response.ok) return { tuition: null, error: `Could not load this tuition (HTTP ${response.status}).` };
    const data: unknown = await response.json();
    const item = isObject(data) && "data" in data ? data.data : data;
    return isTuition(item)
      ? { tuition: item, error: "" }
      : { tuition: null, error: "The server returned an invalid tuition record." };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_HTTP_ERROR_FALLBACK;404") throw error;
    return { tuition: null, error: error instanceof Error ? error.message : "Could not connect to the tuition service." };
  }
}

export default async function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { tuition, error } = await getTuition(id);

  if (!tuition) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">{error}</section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <article className="min-w-0">
        {tuition.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tuition.bannerImage} alt={`${tuition.title} tuition banner`} className="aspect-video w-full rounded-2xl object-cover" />
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
        <h2 className="font-heading text-xl font-bold">Apply for this tuition</h2>
        <p className="mt-1 text-sm text-muted-foreground">Share your contact details and preferred time.</p>
        <div className="mt-5"><ApplyForm tuitionId={tuition._id} /></div>
      </aside>
    </main>
  );
}
