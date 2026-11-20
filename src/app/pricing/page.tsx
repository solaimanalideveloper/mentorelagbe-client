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
  { name: "Student Pro", role: "student", price: "$10", description: "For learners who want the best fit.", features: ["Apply to available tuitions", "Track every application", "Access Pro learning features"] },
  { name: "Tutor Pro", role: "tutor", price: "$15", description: "For tutors ready to grow their reach.", features: ["Unlimited tuition posts", "Manage all applicants", "Build your teaching profile"] },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [checkoutRole, setCheckoutRole] = useState("");

  async function subscribe() {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    if (session.user.plan === "pro") {
      toast.info("Your Pro plan is already active.");
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
        <div className="mt-5 flex justify-center"><SectionHeading title="Simple plans for better learning" subtitle="Start free and upgrade when you are ready for more." /></div>
      </div>
      <section className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrentRole = session?.user.role === plan.role;
          const isCurrentPlan = isCurrentRole && session?.user.plan === "pro";
          return (
            <article key={plan.name} className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold text-primary">{plan.name}</p>
              <p className="mt-3 font-heading text-4xl font-bold text-foreground">{plan.price}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-muted-foreground"><Check className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />{feature}</li>)}
              </ul>
              <Button
                size="lg"
                className="mt-7 w-full"
                variant={isCurrentPlan ? "outline" : "default"}
                disabled={isPending || Boolean(checkoutRole) || isCurrentPlan || Boolean(session && !isCurrentRole)}
                onClick={() => void subscribe()}
              >
                {isPending ? "Checking account..." : isCurrentPlan ? "Current Plan" : checkoutRole ? "Opening checkout..." : "Subscribe with Stripe"}
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
