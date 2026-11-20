"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardTitle, EmptyState } from "@/components/dashboard/DashboardParts";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getErrorMessage, readList, isApplication } from "@/lib/data";
import type { Application, AppStatus } from "@/types";

export default function TutorApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadApplicants = useCallback(async () => {
    try {
      const response = await api.get<unknown>("/api/tutor/applicants");
      setApplications(readList(response.data, isApplication));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load applicants.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadApplicants(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadApplicants]);

  async function setApplicationStatus(application: Application, status: Exclude<AppStatus, "pending">) {
    setBusyId(application._id);
    try {
      await api.patch(`/api/applications/${encodeURIComponent(application._id)}/status`, { status });
      toast.success(`Application ${status}.`);
      await loadApplicants();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update this application."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardTitle title="Applicants" description="Review student details and respond to pending applications." />
      {errorMessage && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</p>}
      {isLoading ? (
        <div className="space-y-3" role="status">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : applications.length === 0 ? (
        <EmptyState message="There are no applications for your tuitions yet." />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <article key={application._id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold">{application.studentName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{application.studentEmail} · {application.studentPhone || "No phone provided"}</p>
                  <p className="mt-3 text-sm font-medium">{application.tuitionTitle}</p>
                </div>
                <StatusBadge status={application.status} />
              </div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>Preferred schedule: {application.preferredSchedule || "Not specified"}</p>
                <p>Note: {application.studentNote || "No note provided"}</p>
              </div>
              {application.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" disabled={busyId === application._id} onClick={() => void setApplicationStatus(application, "accepted")}>{busyId === application._id ? "Saving..." : "Accept"}</Button>
                  <Button size="sm" variant="outline" disabled={busyId === application._id} onClick={() => void setApplicationStatus(application, "rejected")}>Reject</Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
