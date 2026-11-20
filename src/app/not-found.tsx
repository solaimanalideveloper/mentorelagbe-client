import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <section className="max-w-lg text-center">
        <p className="font-heading text-6xl font-bold text-primary">404</p>
        <h1 className="mt-3 font-heading text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page may have moved or the link may be incorrect.</p>
        <Button className="mt-6" size="lg" render={<Link href="/" />}>Back to Home</Button>
      </section>
    </main>
  );
}
