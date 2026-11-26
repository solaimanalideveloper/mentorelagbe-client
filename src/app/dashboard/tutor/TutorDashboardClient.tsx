"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Crown,
  Plus,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { TutorStats } from "@/types";
import { toast } from "sonner";

const statCards = [
  {
    key: "totalTuitions",
    label: "Total Tuitions",
    description: "All of your tuition listings",
    icon: BookOpen,
  },
  {
    key: "activeApproved",
    label: "Active & Approved",
    description: "Publicly listed and accepting students",
    icon: CheckCircle2,
  },
  {
    key: "totalApplicants",
    label: "Total Applicants",
    description: "Students interested in your tuitions",
    icon: UsersRound,
  },
] as const;

function isTutorStats(value: unknown): value is TutorStats {
  if (typeof value !== "object" || value === null) return false;
  const stats = value as Record<string, unknown>;

  return (
    typeof stats.totalTuitions === "number" &&
    typeof stats.activeApproved === "number" &&
    typeof stats.totalApplicants === "number" &&
    (stats.plan === "free" || stats.plan === "pro")
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;
    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response &&
      typeof response.data === "object" &&
      response.data !== null &&
      "message" in response.data &&
      typeof response.data.message === "string"
    ) {
      return response.data.message;
    }
  }
  return error instanceof Error ? error.message : "Unable to load tutor dashboard data.";
}

export default function TutorDashboardClient() {
  const { data: session } = authClient.useSession();
  const [stats, setStats] = useState<TutorStats | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await api.get<unknown>("/api/tutor/stats");
        if (!isTutorStats(response.data)) {
          throw new Error("The tutor stats response has an invalid format.");
        }
        if (active) setStats(response.data);
      } catch (error) {
        if (active) {
          const message = getErrorMessage(error);
          setErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadStats();
    return () => {
      active = false;
    };
  }, []);

  const userName = session?.user.name || "Tutor";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Tutor Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Welcome back, {userName}! Track your tuition listings and incoming student applicants.
          </p>
        </div>
        <Button size="lg" nativeButton={false} render={<Link href="/dashboard/tutor/post-tuition" />}>
          <Plus aria-hidden="true" />
          Post New Tuition
        </Button>
      </section>

      {errorMessage && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Tutor statistics">
        {statCards.map(({ key, label, description, icon: Icon }) => (
          <article key={key} className="flex min-h-36 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">{label}</p>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </div>
            {isLoading ? (
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <p className="mt-3 font-heading text-2xl font-bold text-foreground">
                {stats?.[key] ?? "—"}
              </p>
            )}
            <p className="mt-auto pt-3 text-xs text-muted-foreground">{description}</p>
          </article>
        ))}

        <article className="flex min-h-36 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Crown className="size-4" aria-hidden="true" />
            </span>
          </div>
          {isLoading ? (
            <div className="mt-4 h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-3 font-heading text-2xl font-bold uppercase text-foreground">
              {stats?.plan ?? "—"}
            </p>
          )}
          <p className="mt-auto pt-3 text-xs text-muted-foreground">
            {stats?.plan === "pro"
              ? "Unlimited tuition posts unlocked"
              : "Upgrade for unlimited tuition posts"}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Tutor Controls</h2>
        <div className="mt-4 space-y-2">
          {[
            {
              title: "Post New Tuition",
              description: "Create a new course offering",
              href: "/dashboard/tutor/post-tuition",
              icon: Plus,
            },
            {
              title: "My Tuitions",
              description: "Edit, activate, or delete posts",
              href: "/dashboard/tutor/my-tuitions",
              icon: BookOpen,
            },
            {
              title: "Manage Applicants",
              description: "Accept or reject students",
              href: "/dashboard/tutor/applicants",
              icon: UsersRound,
            },
          ].map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 transition-colors hover:bg-muted sm:px-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{title}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      {!isLoading && stats?.plan === "pro" && (
        <section className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
          <Crown className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Pro Membership Active</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Unlimited tuition postings and your verified tutor badge are enabled.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
