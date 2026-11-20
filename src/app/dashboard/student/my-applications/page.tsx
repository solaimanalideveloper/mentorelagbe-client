"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardTitle, EmptyState } from "@/components/dashboard/DashboardParts";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate, formatTaka, getErrorMessage, readList, isApplication } from "@/lib/data";
import type { Application } from "@/types";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const loadApplications = useCallback(async () => {
    try {
      const response = await api.get<unknown>("/api/applications/my");
      setApplications(readList(response.data, isApplication));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load your applications.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadApplications(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadApplications]);

  async function cancelApplication(application: Application) {
    if (!window.confirm(`Cancel your application for "${application.tuitionTitle}"?`)) return;
    setCancellingId(application._id);
    try {
      await api.delete(`/api/applications/${encodeURIComponent(application._id)}`);
      toast.success("Application cancelled.");
      await loadApplications();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not cancel this application."));
    } finally {
      setCancellingId("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardTitle title="My Applications" description="Check application status and cancel a pending request." />
      {errorMessage && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</p>}
      {isLoading ? (
        <div className="space-y-3" role="status">{[1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : applications.length === 0 ? (
        <EmptyState message="You have not applied to any tuitions yet." />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <article key={application._id} className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="font-heading text-lg font-semibold">{application.tuitionTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{application.subject} · Tutor: {application.tutorEmail}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatTaka(application.monthlyFee)} / month · Applied {formatDate(application.appliedAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={application.status} />
                {application.status === "pending" && (
                  <Button variant="outline" size="sm" disabled={cancellingId === application._id} onClick={() => void cancelApplication(application)}>
                    {cancellingId === application._id ? "Cancelling..." : "Cancel"}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
