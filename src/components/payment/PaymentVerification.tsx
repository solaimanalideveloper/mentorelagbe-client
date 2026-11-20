"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/data";
import { authClient } from "@/lib/auth-client";

function VerificationContent() {
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your payment...");
  const accessMessage = !isPending && !session
    ? "Sign in with the account used for checkout to verify your payment."
    : !isPending && !sessionId
      ? "The payment session ID is missing from this page."
      : "";

  useEffect(() => {
    if (isPending || !session || !sessionId) return;

    let active = true;
    async function verifyPayment() {
      try {
        await api.get("/api/payments/verify", { params: { session_id: sessionId } });
        await api.get("/api/users/me");
        if (active) {
          setStatus("success");
          setMessage("Your payment is confirmed and your Pro plan is active.");
        }
      } catch (error) {
        if (active) {
          setStatus("error");
          setMessage(getErrorMessage(error, "We could not verify this payment."));
        }
      }
    }

    void verifyPayment();
    return () => {
      active = false;
    };
  }, [isPending, session, sessionId]);

  const displayStatus = accessMessage ? "error" : status;
  const displayMessage = accessMessage || message;

  return (
    <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 text-center shadow-sm sm:p-9">
      {displayStatus === "success" ? (
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" aria-hidden="true" />
      ) : displayStatus === "error" ? (
        <CircleAlert className="mx-auto size-12 text-destructive" aria-hidden="true" />
      ) : (
        <span className="mx-auto block size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" role="status" aria-label="Verifying payment" />
      )}
      <h1 className="mt-5 font-heading text-2xl font-bold text-foreground">
        {displayStatus === "success" ? "Payment successful" : displayStatus === "error" ? "Payment not verified" : "Verifying payment"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{displayMessage}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {displayStatus === "success" ? (
          <Button size="lg" render={<Link href="/dashboard" />}>Go to Dashboard</Button>
        ) : displayStatus === "error" ? (
          <Button size="lg" variant="outline" render={<Link href="/pricing" />}>Back to Pricing</Button>
        ) : null}
        <Button size="lg" variant="outline" render={<Link href="/" />}>Home</Button>
      </div>
    </section>
  );
}

export function PaymentVerification() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <Suspense fallback={<p className="text-sm text-muted-foreground" role="status">Loading payment status...</p>}>
        <VerificationContent />
      </Suspense>
    </main>
  );
}
