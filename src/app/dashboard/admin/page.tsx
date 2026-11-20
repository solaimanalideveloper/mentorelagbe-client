"use client";

import { useEffect, useState } from "react";
import { CircleDollarSign, GraduationCap, UsersRound, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardTitle, MetricCard } from "@/components/dashboard/DashboardParts";
import { api } from "@/lib/api";
import { getErrorMessage, isObject } from "@/lib/data";

type AdminStats = Record<string, unknown>;

function readMetric(stats: AdminStats | null, names: string[]) {
  if (!stats) return "—";
  for (const name of names) {
    const value = stats[name];
    if (typeof value === "number") return value;
  }
  return "—";
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const response = await api.get<unknown>("/api/admin/stats");
        const result = isObject(response.data) && "data" in response.data ? response.data.data : response.data;
        if (!isObject(result)) throw new Error("The admin stats response is invalid.");
        if (active) setStats(result);
      } catch (error) {
        if (active) {
          const message = getErrorMessage(error, "Unable to load platform statistics.");
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

  const revenue = readMetric(stats, ["totalRevenue", "revenue"]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardTitle title="Admin Dashboard" description="Monitor platform activity and manage the MentorLagbe community." />
      {errorMessage && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</p>}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform statistics">
        <MetricCard label="Total Users" description="All registered accounts" icon={UsersRound} value={readMetric(stats, ["totalUsers", "users"])} loading={isLoading} />
        <MetricCard label="Total Tutors" description="Tutors in the community" icon={GraduationCap} value={readMetric(stats, ["totalTutors", "tutors"])} loading={isLoading} />
        <MetricCard label="Pending Tuitions" description="Waiting for admin review" icon={ClipboardCheck} value={readMetric(stats, ["pendingTuitions", "pending"])} loading={isLoading} />
        <MetricCard label="Approved Tuitions" description="Approved platform listings" icon={ClipboardCheck} value={readMetric(stats, ["approvedTuitions", "approved"])} loading={isLoading} />
        <MetricCard label="Total Revenue" description="Successful platform payments" icon={CircleDollarSign} value={typeof revenue === "number" ? `$${revenue.toFixed(2)}` : revenue} loading={isLoading} />
      </section>
    </div>
  );
}
