"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardTitle, EmptyState } from "@/components/dashboard/DashboardParts";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatTaka, getErrorMessage, readList, isTuition } from "@/lib/data";
import type { Approval, Tuition } from "@/types";

export default function AdminTuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadTuitions = useCallback(async () => {
    try {
      const response = await api.get<unknown>("/api/admin/tuitions");
      setTuitions(readList(response.data, isTuition));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load platform tuitions.");
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

  async function reviewTuition(tuition: Tuition, status: Exclude<Approval, "pending">) {
    setBusyId(tuition._id);
    try {
      await api.patch(`/api/admin/tuitions/${encodeURIComponent(tuition._id)}/approval`, { approvalStatus: status });
      toast.success(`Tuition ${status}.`);
      await loadTuitions();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update tuition approval."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardTitle title="Manage Tuitions" description="Review tutor listings before they appear publicly." />
      {errorMessage && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</p>}
      {isLoading ? (
        <div className="space-y-3" role="status">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : tuitions.length === 0 ? (
        <EmptyState message="There are no tuition posts to review." />
      ) : (
        <div className="space-y-4">
          {tuitions.map((tuition) => (
            <article key={tuition._id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-heading text-lg font-semibold">{tuition.title}</h2><StatusBadge status={tuition.approvalStatus} /></div>
                <p className="mt-1 text-sm text-muted-foreground">{tuition.subject} · {tuition.classLevel} · {tuition.mode}</p>
                <p className="mt-1 text-sm text-muted-foreground">Tutor: {tuition.tutorName} · {formatTaka(tuition.monthlyFee)} / month</p>
              </div>
              {tuition.approvalStatus === "pending" && (
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" disabled={busyId === tuition._id} onClick={() => void reviewTuition(tuition, "approved")}>{busyId === tuition._id ? "Saving..." : "Approve"}</Button>
                  <Button size="sm" variant="outline" disabled={busyId === tuition._id} onClick={() => void reviewTuition(tuition, "rejected")}>Reject</Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
