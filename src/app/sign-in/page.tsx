"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrlMissing = !process.env.NEXT_PUBLIC_API_URL;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (apiUrlMissing) {
      setErrorMessage("Set NEXT_PUBLIC_API_URL in .env.local before signing in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        const message = result.error.message || "Sign in failed. Check your credentials.";
        setErrorMessage(message);
        toast.error(message);
        return;
      }
      toast.success("Signed in successfully.");
      router.replace("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The sign-in request could not be completed.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 font-heading text-xl font-bold text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          MentorLagbe
        </Link>
        <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to open your MentorLagbe dashboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {apiUrlMissing && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Set NEXT_PUBLIC_API_URL in .env.local before signing in.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting || apiUrlMissing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting || apiUrlMissing}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || apiUrlMissing}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New to MentorLagbe?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
