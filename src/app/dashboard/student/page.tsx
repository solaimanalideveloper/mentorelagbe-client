"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck, CheckCircle2, Clock3, Crown } from "lucide-react";
import { toast } from "sonner";
import { DashboardTitle, MetricCard } from "@/components/dashboard/DashboardParts";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getErrorMessage, isObject } from "@/lib/data";
import type { StudentStats } from "@/types";
import Link from "next/link";

const cards = [
  { key: "totalApplied", label: "Total Applied", description: "Tuition applications sent", icon: BookOpenCheck },
  { key: "accepted", label: "Accepted", description: "Applications accepted by tutors", icon: CheckCircle2 },
  { key: "pending", label: "Pending", description: "Applications awaiting a response", icon: Clock3 },
] as const;

function isStudentStats(value: unknown): value is StudentStats {
  if (!isObject(value)) return false;
  return (
    typeof value.totalApplied === "number" &&
    typeof value.accepted === "number" &&
    typeof value.pending === "number" &&
    (value.currentPlan === "free" || value.currentPlan === "pro")
  );
}

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const response = await api.get<unknown>("/api/student/stats");
        if (!isStudentStats(response.data)) throw new Error("The student stats response is invalid.");
        if (active) setStats(response.data);
      } catch (error) {
        if (active) {
          const message = getErrorMessage(error, "Unable to load student dashboard data.");
          setErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadStats();
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardTitle title="Student Dashboard" description="Keep up with your applications and learning plan." />
        <Button size="lg" nativeButton={false} render={<Link href="/tuitions" />}>Browse Tuitions</Button>
      </div>
      {errorMessage && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</p>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Student statistics">
        {cards.map(({ key, label, description, icon }) => (
          <MetricCard key={key} label={label} description={description} icon={icon} value={stats?.[key] ?? "—"} loading={isLoading} />
        ))}
        <MetricCard label="Current Plan" description={stats?.currentPlan === "pro" ? "Pro learning plan active" : "Upgrade for Pro features"} icon={Crown} value={stats?.currentPlan ?? "—"} loading={isLoading} />
      </section>
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Your learning activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">Review tutor responses and manage your pending applications.</p>
        <Button className="mt-4" variant="outline" nativeButton={false} render={<Link href="/dashboard/student/my-applications" />}>View My Applications</Button>
      </section>
    </div>
  );
}
