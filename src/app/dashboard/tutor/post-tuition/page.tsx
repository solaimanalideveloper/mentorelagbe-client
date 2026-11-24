"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { DashboardTitle } from "@/components/dashboard/DashboardParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { getErrorMessage, readList, isTuition } from "@/lib/data";
import { authClient } from "@/lib/auth-client";

type TuitionForm = {
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  description: string;
  bannerImage: string;
};

const emptyForm: TuitionForm = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "Online",
  location: "",
  monthlyFee: "",
  daysPerWeek: "",
  description: "",
  bannerImage: "",
};

export default function PostTuitionPage() {
  const { data: session } = authClient.useSession();
  const [form, setForm] = useState<TuitionForm>(emptyForm);
  const [postCount, setPostCount] = useState(0);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);
  const [limitError, setLimitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadMyTuitions() {
      try {
        const response = await api.get<unknown>("/api/tutor/tuitions");
        const tuitions = readList(response.data, isTuition);
        if (active) setPostCount(tuitions.length);
      } catch (error) {
        if (active) {
          const message = getErrorMessage(error, "Could not check your tuition post limit.");
          setLimitError(message);
          toast.error(message);
        }
      } finally {
        if (active) setIsCheckingLimit(false);
      }
    }
    void loadMyTuitions();
    return () => { active = false; };
  }, []);

  const isFreeLimitReached = session?.user.plan !== "pro" && postCount >= 2;

  function updateField<K extends keyof TuitionForm>(key: K, value: TuitionForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isFreeLimitReached) {
      toast.error("Free accounts can post up to two tuitions. Upgrade to Pro to continue.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/api/tuitions", {
        ...form,
        monthlyFee: Number(form.monthlyFee),
        daysPerWeek: Number(form.daysPerWeek),
      });
      toast.success("Tuition posted for review.");
      setForm(emptyForm);
      setPostCount((count) => count + 1);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not post this tuition."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DashboardTitle title="Post a Tuition" description="Share a clear description so the right students can find your class." />
      {limitError && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{limitError}</p>}
      {isFreeLimitReached && (
        <section className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading font-semibold">Free plan post limit reached</h2>
            <p className="mt-1 text-sm text-muted-foreground">Upgrade to Pro to post unlimited tuitions.</p>
          </div>
          <Button size="lg" nativeButton={false} render={<Link href="/pricing" />}>View Pro Plans</Button>
        </section>
      )}
      <form className="grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2 sm:p-6" onSubmit={(event) => void handleSubmit(event)}>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tuition-title">Title</Label>
          <Input id="tuition-title" required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tuition-subject">Subject</Label>
          <Input id="tuition-subject" required value={form.subject} onChange={(event) => updateField("subject", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tuition-class">Class level</Label>
          <Input id="tuition-class" required value={form.classLevel} onChange={(event) => updateField("classLevel", event.target.value)} placeholder="e.g. HSC, Class 10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tuition-mode">Mode</Label>
          <select id="tuition-mode" value={form.mode} onChange={(event) => updateField("mode", event.target.value as TuitionForm["mode"])} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="Online">Online</option><option value="Offline">Offline</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tuition-location">Location</Label>
          <Input id="tuition-location" required value={form.location} onChange={(event) => updateField("location", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tuition-fee">Monthly fee (৳)</Label>
          <Input id="tuition-fee" type="number" min="1" required value={form.monthlyFee} onChange={(event) => updateField("monthlyFee", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tuition-days">Days per week</Label>
          <Input id="tuition-days" type="number" min="1" max="7" required value={form.daysPerWeek} onChange={(event) => updateField("daysPerWeek", event.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Banner image</Label>
          <ImageUpload value={form.bannerImage} onChange={(url) => updateField("bannerImage", url)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tuition-description">Description</Label>
          <Textarea id="tuition-description" required minLength={20} rows={6} value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting || isCheckingLimit || isFreeLimitReached || Boolean(limitError)}>
            {isSubmitting ? "Posting..." : isCheckingLimit ? "Checking post limit..." : "Post Tuition"}
          </Button>
        </div>
      </form>
    </div>
  );
}
