import Link from "next/link";
import { ArrowRight, BookOpenCheck, Search, UserRoundPlus } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";

const steps = [
  { number: "01", title: "Explore your options", text: "Browse approved tuition posts and compare subjects, schedules, and fees.", icon: Search },
  { number: "02", title: "Connect with a tutor", text: "Send an application with your preferred schedule and learning goals.", icon: UserRoundPlus },
  { number: "03", title: "Start learning", text: "Track your application and coordinate the next steps with your tutor.", icon: BookOpenCheck },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading as="h1" title="How MentorLagbe works" subtitle="A clear path from finding the right class to getting started." />
      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map(({ number, title, text, icon: Icon }) => (
          <article key={number} className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-bold text-primary">{number}</span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" /></span>
            </div>
            <h2 className="mt-5 font-heading text-xl font-semibold">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>
      <section className="mt-10 flex flex-col gap-5 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="font-heading text-xl font-bold">Ready to begin?</h2>
          <p className="mt-1 text-sm text-primary-foreground/80">Students can browse classes, and tutors can create a teaching profile.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="lg" nativeButton={false} render={<Link href="/tuitions" />}>Browse Tuitions <ArrowRight aria-hidden="true" /></Button>
          <Button variant="outline" size="lg" nativeButton={false} className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" render={<Link href="/sign-up" />}>Join MentorLagbe</Button>
        </div>
      </section>
    </main>
  );
}
