"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DashboardTitle, EmptyState } from "@/components/dashboard/DashboardParts";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatTaka, getErrorMessage, readList, isTuition } from "@/lib/data";
import type { Tuition } from "@/types";

type EditForm = {
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

function toEditForm(tuition: Tuition): EditForm {
  return {
    title: tuition.title,
    subject: tuition.subject,
    classLevel: tuition.classLevel,
    mode: tuition.mode,
    location: tuition.location,
    monthlyFee: String(tuition.monthlyFee),
    daysPerWeek: String(tuition.daysPerWeek),
    description: tuition.description,
    bannerImage: tuition.bannerImage || "",
  };
}

export default function MyTuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<EditForm | null>(null);
  const [busyId, setBusyId] = useState("");

  const loadTuitions = useCallback(async () => {
    try {
      const response = await api.get<unknown>("/api/tutor/tuitions");
      setTuitions(readList(response.data, isTuition));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load your tuition posts.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadTuitions(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadTuitions]);

  function updateField<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setForm((current) => current ? { ...current, [key]: value } : current);
  }

  async function saveEdits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || !form) return;
    setBusyId(editingId);
    try {
      await api.patch(`/api/tuitions/${encodeURIComponent(editingId)}`, {
        ...form,
        monthlyFee: Number(form.monthlyFee),
        daysPerWeek: Number(form.daysPerWeek),
      });
      toast.success("Tuition updated.");
      setEditingId("");
      setForm(null);
      await loadTuitions();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update this tuition."));
    } finally {
      setBusyId("");
    }
  }

  async function toggleActive(tuition: Tuition) {
    setBusyId(tuition._id);
    try {
      await api.patch(`/api/tuitions/${encodeURIComponent(tuition._id)}/toggle-active`);
      toast.success(tuition.isActive ? "Tuition closed." : "Tuition activated.");
      await loadTuitions();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not change tuition status."));
    } finally {
      setBusyId("");
    }
  }

  async function deleteTuition(tuition: Tuition) {
    if (!window.confirm(`Delete "${tuition.title}"? This cannot be undone.`)) return;
    setBusyId(tuition._id);
    try {
      await api.delete(`/api/tuitions/${encodeURIComponent(tuition._id)}`);
      toast.success("Tuition deleted.");
      await loadTuitions();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete this tuition."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardTitle title="My Tuitions" description="Review, update, and manage your tuition listings." />
      {errorMessage && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</p>}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : tuitions.length === 0 ? (
        <EmptyState message="You have not posted a tuition yet." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tuitions.map((tuition) => (
            <article key={tuition._id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold">{tuition.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{tuition.subject} · {tuition.classLevel} · {formatTaka(tuition.monthlyFee)} / month</p>
                </div>
                <div className="flex gap-2"><StatusBadge status={tuition.approvalStatus} /><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tuition.isActive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>{tuition.isActive ? "Active" : "Closed"}</span></div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tuition.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingId(tuition._id); setForm(toEditForm(tuition)); }}>Edit</Button>
                <Button size="sm" variant="outline" disabled={busyId === tuition._id} onClick={() => void toggleActive(tuition)}>{tuition.isActive ? "Close" : "Activate"}</Button>
                <Button size="sm" variant="destructive" disabled={busyId === tuition._id} onClick={() => void deleteTuition(tuition)}>Delete</Button>
              </div>
              {editingId === tuition._id && form && (
                <form className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2" onSubmit={(event) => void saveEdits(event)}>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" required value={form.title} onChange={(event) => updateField("title", event.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="edit-subject">Subject</Label><Input id="edit-subject" required value={form.subject} onChange={(event) => updateField("subject", event.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="edit-class">Class level</Label><Input id="edit-class" required value={form.classLevel} onChange={(event) => updateField("classLevel", event.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="edit-mode">Mode</Label><select id="edit-mode" value={form.mode} onChange={(event) => updateField("mode", event.target.value as EditForm["mode"])} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"><option>Online</option><option>Offline</option></select></div>
                  <div className="space-y-2"><Label htmlFor="edit-location">Location</Label><Input id="edit-location" required value={form.location} onChange={(event) => updateField("location", event.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="edit-fee">Monthly fee (৳)</Label><Input id="edit-fee" type="number" min="1" required value={form.monthlyFee} onChange={(event) => updateField("monthlyFee", event.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="edit-days">Days per week</Label><Input id="edit-days" type="number" min="1" max="7" required value={form.daysPerWeek} onChange={(event) => updateField("daysPerWeek", event.target.value)} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Banner image</Label><ImageUpload value={form.bannerImage} onChange={(url) => updateField("bannerImage", url)} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" required minLength={20} rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} /></div>
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="submit" size="sm" disabled={busyId === tuition._id}>{busyId === tuition._id ? "Saving..." : "Save Changes"}</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setEditingId(""); setForm(null); }}>Cancel</Button>
                  </div>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
