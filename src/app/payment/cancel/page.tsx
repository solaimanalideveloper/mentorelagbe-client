import Link from "next/link";
import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 text-center shadow-sm sm:p-9">
        <CircleX className="mx-auto size-12 text-amber-600" aria-hidden="true" />
        <h1 className="mt-5 font-heading text-2xl font-bold text-foreground">Checkout was cancelled</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">No payment was completed. You can compare the plans and try again whenever you are ready.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/pricing" />}>View Pricing</Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/" />}>Back to Home</Button>
        </div>
      </section>
    </main>
  );
}
