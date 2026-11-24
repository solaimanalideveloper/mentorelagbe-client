"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page rendering failed.", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <section className="max-w-lg text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page could not be loaded. Please try again.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" onClick={reset}>Try Again</Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/" />}>Back to Home</Button>
        </div>
      </section>
    </main>
  );
}
