"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { getErrorMessage, isObject } from "@/lib/data";

const plans = [
  { name: "Student Free", role: "student", isPro: false, price: "$0", description: "Start exploring learning opportunities.", features: ["Browse approved tuitions", "Apply to suitable listings", "Track your applications"] },
  { name: "Student Pro", role: "student", isPro: true, price: "$10", description: "For learners who want more from their journey.", features: ["Everything in Free", "Access Pro learning features", "Keep learning organized"] },
  { name: "Tutor Free", role: "tutor", isPro: false, price: "$0", description: "Start teaching and meet new students.", features: ["Create up to 2 tuition posts", "Manage student applications", "Build your teaching profile"] },
  { name: "Tutor Pro", role: "tutor", isPro: true, price: "$15", description: "For tutors ready to grow their teaching practice.", features: ["Everything in Free", "Unlimited tuition posts", "Manage applicants in one place"] },
] as const;

export default function PricingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [checkoutRole, setCheckoutRole] = useState("");

  async function subscribe(targetRole: "student" | "tutor") {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    if (session.user.plan === "pro") {
      toast.info("Your Pro plan is already active.");
      return;
    }
    if (session.user.role !== targetRole) {
      toast.error(`The ${targetRole} plan is only available to ${targetRole} accounts.`);
      return;
    }
    if (session.user.role !== "student" && session.user.role !== "tutor") {
      toast.error("Admin accounts do not have a Pro subscription.");
      return;
    }

    setCheckoutRole(session.user.role);
    try {
      const response = await api.post<unknown>("/api/payments/create-checkout-session", {
        planName: "pro",
      });
      if (!isObject(response.data) || typeof response.data.url !== "string") {
        throw new Error("The checkout response did not include a valid URL.");
      }
      window.location.assign(response.data.url);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not start checkout."));
    } finally {
      setCheckoutRole("");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent/20 text-amber-700 dark:text-amber-300"><Crown aria-hidden="true" /></div>
        <div className="mt-5 flex justify-center"><SectionHeading as="h1" title="Simple plans for better learning" subtitle="Start free and upgrade when you are ready for more." /></div>
      </div>
      <section className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2">
        {plans.map((plan) => {
          const isCurrentRole = session?.user.role === plan.role;
          const isCurrentPlan =
            isCurrentRole &&
            (plan.isPro ? session?.user.plan === "pro" : session?.user.plan !== "pro");
          const isIncludedWithPro =
            isCurrentRole && !plan.isPro && session?.user.plan === "pro";
          return (
            <article key={plan.name} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">{plan.name}</p>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">{plan.role}</span>
              </div>
              <p className="mt-3 font-heading text-4xl font-bold text-foreground">{plan.price}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-muted-foreground"><Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />{feature}</li>)}
              </ul>
              <Button
                size="lg"
                className="mt-7 w-full"
                variant={isCurrentPlan ? "outline" : plan.isPro ? "default" : "outline"}
                disabled={
                  isPending ||
                  Boolean(checkoutRole) ||
                  isCurrentPlan ||
                  isIncludedWithPro ||
                  Boolean(session && !isCurrentRole) ||
                  (plan.isPro && session?.user.role === "admin")
                }
                onClick={plan.isPro ? () => void subscribe(plan.role) : undefined}
                nativeButton={plan.isPro || Boolean(session)}
                render={
                  !plan.isPro && !session
                    ? <Link href="/sign-up" />
                    : undefined
                }
              >
                {isPending
                  ? "Checking account..."
                  : isCurrentPlan
                    ? "Current Plan"
                    : checkoutRole
                      ? "Opening checkout..."
                      : plan.isPro
                        ? "Subscribe with Stripe"
                        : session?.user.plan === "pro"
                          ? "Included with Pro"
                          : session
                            ? "Free Plan"
                            : "Create Free Account"}
              </Button>
              {session && !isCurrentRole && <p className="mt-2 text-center text-xs text-muted-foreground">This plan is for {plan.role}s.</p>}
            </article>
          );
        })}
      </section>
      {!session && <p className="mt-6 text-center text-sm text-muted-foreground">New here? <Link href="/sign-up" className="font-medium text-primary hover:underline">Create a free account</Link> before subscribing.</p>}
    </main>
  );
}
