"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Monitor,
  Search,
  Sparkles,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/tuition/BookmarkButton";
import { BookmarkProvider } from "@/components/tuition/BookmarkProvider";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { isTuition } from "@/lib/data";
import type { Tuition } from "@/types";
import { authClient } from "@/lib/auth-client";
import { clearApiToken, publicApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type FeaturedState =
  | { status: "loading" }
  | { status: "ready"; tuitions: Tuition[] }
  | { status: "empty" }
  | { status: "error"; message: string };

const publicLinks = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Browse Tuitions", href: "/tuitions", icon: BookOpen },
  { label: "Pricing", href: "/pricing", icon: Wallet },
  { label: "How It Works", href: "/how-it-works", icon: Clock3 },
];

const subjects = [
  { name: "Mathematics", mark: "M", tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  { name: "Physics", mark: "P", tone: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
  { name: "Programming", mark: "</>", tone: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  { name: "IELTS", mark: "I", tone: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
];

async function fetchFeaturedTuitions(): Promise<FeaturedState> {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return {
      status: "error",
      message: "Featured tuitions need NEXT_PUBLIC_API_URL configured.",
    };
  }

  try {
    const response = await publicApi.get<unknown>("/api/tuitions/featured");
    const body = response.data;
    const entries = Array.isArray(body)
      ? body
      : typeof body === "object" &&
          body !== null &&
          "data" in body &&
          Array.isArray(body.data)
        ? body.data
        : null;

    if (!entries || !entries.every(isTuition)) {
      return {
        status: "error",
        message: "The featured tuitions response has an invalid format.",
      };
    }

    return entries.length
      ? { status: "ready", tuitions: entries.slice(0, 6) }
      : { status: "empty" };
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    return {
      status: "error",
      message: status
        ? `Featured tuitions could not be loaded (HTTP ${status}).`
        : "Featured tuitions are unavailable. Check your API connection and try again.",
    };
  }
}

type HomeUser = {
  name: string;
  role: "student" | "tutor" | "admin";
};

function isRole(value: unknown): value is HomeUser["role"] {
  return value === "student" || value === "tutor" || value === "admin";
}

function HomeSidebar({
  onNavigate,
  user,
  onSignOut,
  isSigningOut,
}: {
  onNavigate?: () => void;
  user?: HomeUser;
  onSignOut?: () => void;
  isSigningOut?: boolean;
}) {
  return (
    <aside className="flex h-full flex-col border-r border-border bg-card">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 font-heading text-xl font-bold text-foreground"
        aria-label="MentorLagbe home"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-5" aria-hidden="true" />
        </span>
        <span>MentorLagbe</span>
      </Link>

      <div className="flex items-center gap-3 border-b border-border px-4 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <GraduationCap className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">Learning Workspace</p>
          <p className="text-xs text-muted-foreground">Explore your next step</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Main menu">
        <div>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Main menu
          </p>
          <ul className="space-y-1">
            {publicLinks.map(({ label, href, icon: Icon }) => {
              const isActive = href === "/";
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_-3px_0_0_var(--primary)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {user ? "Your account" : "Get started"}
          </p>
          {user ? (
            <>
              <Link
                href={`/dashboard/${user.role}`}
                onClick={onNavigate}
                className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LayoutDashboard className="size-4 shrink-0" aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={onNavigate}
                className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <UsersRound className="size-4 shrink-0" aria-hidden="true" />
                <span>Update Profile</span>
              </Link>
            </>
          ) : (
            <Link
              href="/sign-in"
              onClick={onNavigate}
              className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <UsersRound className="size-4 shrink-0" aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        {user ? (
          <Button
            variant="ghost"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="mb-2 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Button>
        ) : (
          <Button
            nativeButton={false}
            render={<Link href="/sign-up" onClick={onNavigate} />}
            className="w-full"
          >
            Create Account
            <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </aside>
  );
}

function HomeWorkspaceShell({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const role = isRole(user?.role) ? user.role : null;
  const sidebarUser = user && role ? { name: user.name, role } : undefined;

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        toast.error(result.error.message || "Could not sign out.");
        return;
      }
      clearApiToken();
      toast.success("You have signed out.");
      router.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="sticky top-0 hidden h-screen w-60 shrink-0 md:block">
        <HomeSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation menu"
                  />
                }
              >
                <Menu aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(85vw,280px)] p-0">
                <SheetTitle className="sr-only">Main navigation</SheetTitle>
                <HomeSidebar
                  onNavigate={() => setMobileMenuOpen(false)}
                  user={sidebarUser}
                  onSignOut={() => void handleSignOut()}
                  isSigningOut={isSigningOut}
                />
              </SheetContent>
            </Sheet>
            <p className="font-heading text-sm font-semibold text-foreground sm:text-base">
              Learning Workspace
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isPending && sidebarUser ? (
              <>
                <Avatar className="hidden sm:flex">
                  <AvatarImage src={user?.image || undefined} alt="" />
                  <AvatarFallback>{sidebarUser.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm font-medium text-foreground xl:inline">
                  {sidebarUser.name}
                </span>
                <span className="hidden rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary md:inline-flex">
                  {sidebarUser.role}
                </span>
                <Button
                  variant="outline"
                  size="lg"
                  nativeButton={false}
                  render={<Link href={`/dashboard/${sidebarUser.role}`} />}
                  className="hidden md:inline-flex"
                >
                  Dashboard
                </Button>
                <Link
                  href={`/dashboard/${sidebarUser.role}`}
                  className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary md:hidden"
                  aria-label="Open dashboard"
                >
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/sign-in" />}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/sign-up" />}
                  className="hidden sm:inline-flex"
                >
                  Join as Tutor
                </Button>
                <Link
                  href="/sign-in"
                  className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                  aria-label="Sign in to your account"
                >
                  <UsersRound className="size-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/tuitions?q=${encodeURIComponent(value)}` : "/tuitions");
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full min-w-0 max-w-xl flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-sm sm:flex-row"
      role="search"
    >
      <label className="flex min-w-0 flex-1 items-center gap-2 px-2">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Search subject or class</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search subject, class, or tutor..."
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Find a Tutor
        <ArrowRight aria-hidden="true" />
      </Button>
    </form>
  );
}

function HeroSection() {
  return (
    <section
      id="home"
      className="grid min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[1.05fr_0.95fr]"
    >
      <div className="flex min-w-0 flex-col items-start justify-center p-6 sm:p-10 lg:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Your learning, your pace
        </span>
        <h1 className="mt-5 max-w-2xl break-words font-heading text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Find Your Ideal Tutor or Mentorship Batch Today
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          Explore trusted tutors and flexible classes for the subjects you want to master.
          Compare options and find a learning fit that works for you.
        </p>
        <div className="mt-6 w-full">
          <HeroSearch />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
            Browse approved listings
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Monitor className="size-4 text-primary" aria-hidden="true" />
            Online and in-person
          </span>
        </div>
      </div>
      <div className="relative min-h-64 bg-secondary/60 p-4 sm:min-h-80 sm:p-8 lg:min-h-[430px]">
        <Image
          src="/images/learning-session.svg"
          alt="Tutor and student learning together online"
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          loading="eager"
          className="object-contain p-2 sm:p-5"
        />
        <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 shadow-sm sm:bottom-8 sm:left-8">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <BookOpen className="size-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-xs font-semibold text-foreground">A better way to learn</span>
            <span className="block text-[11px] text-muted-foreground">Find a guide for your goals</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function FeaturedTuitions() {
  const [state, setState] = useState<FeaturedState>({ status: "loading" });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    void fetchFeaturedTuitions().then((result) => {
      if (active) setState(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="featured" className="scroll-mt-24 space-y-6 py-10 md:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          title="Featured Tuitions"
          subtitle="Explore recently approved opportunities from tutors on MentorLagbe."
        />
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/tuitions" />}
          className="self-start sm:self-auto"
        >
          Browse all
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      {state.status === "loading" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl bg-card ring-1 ring-border" />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {state.message}
        </div>
      )}

      {state.status === "empty" && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <BookOpen className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium text-foreground">No featured tuitions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon or browse all available listings.
          </p>
        </div>
      )}

      {state.status === "ready" && (
        <BookmarkProvider>
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.tuitions.map((tuition) => (
            <motion.article
              key={tuition._id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
              className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="relative aspect-video w-full bg-secondary">
                <Image
                  src={tuition.bannerImage || "/images/learning-session.svg"}
                  alt={tuition.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex justify-end">
                  <BookmarkButton tuition={tuition} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                    {tuition.subject}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    {tuition.mode}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 font-heading text-lg font-semibold text-foreground">
                  {tuition.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{tuition.classLevel}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">Tutor: {tuition.tutorName}</span>
                  <span className="font-semibold text-foreground">
                    ৳{tuition.monthlyFee.toLocaleString("en-BD")}
                    <span className="font-normal text-muted-foreground">/mo</span>
                  </span>
                </div>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={`/tuitions/${tuition._id}`} />}
                  className="mt-auto w-full"
                >
                  View Details
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
        </BookmarkProvider>
      )}
    </section>
  );
}

function HomeSections() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <section id="subjects" className="scroll-mt-24 py-10 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="Start with a subject"
            subtitle="Find focused support in the areas learners explore most."
          />
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/tuitions?subject=${encodeURIComponent(subject.name)}`}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${subject.tone}`}>
                    {subject.mark}
                  </span>
                  <span className="text-xs font-medium text-foreground sm:text-sm">{subject.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 space-y-6 py-10 md:py-12">
        <SectionHeading
          title="A clear path to better learning"
          subtitle="Get started in a few simple steps, whether you are learning or teaching."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { number: "01", title: "Explore", detail: "Search subjects, levels, and class formats.", icon: Search },
            { number: "02", title: "Compare", detail: "Review tutor listings and tuition details.", icon: BookOpen },
            { number: "03", title: "Connect", detail: "Apply to a tuition that fits your goals.", icon: UsersRound },
            { number: "04", title: "Teach", detail: "Tutors can create and manage tuition posts.", icon: GraduationCap },
          ].map(({ number, title, detail, icon: Icon }, index) => (
            <motion.article
              key={number}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold text-primary">{number}</span>
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{detail}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 space-y-6 py-10 md:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title="Plans for every learning journey"
            subtitle="Start free, then upgrade when you are ready for more."
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/pricing" />}
            className="self-start sm:self-auto"
          >
            Compare plans
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            {
              title: "Student plans",
              free: "$0",
              pro: "$10",
              description: "Find a tutor and keep your learning journey organized.",
              features: ["Browse approved tuitions", "Apply to suitable listings", "Pro learning features"],
            },
            {
              title: "Tutor plans",
              free: "$0",
              pro: "$15",
              description: "Start teaching and grow your reach when you are ready.",
              features: ["Post up to 2 tuitions", "Manage student applications", "Unlimited posts with Pro"],
            },
          ].map((plan, index) => (
            <motion.article
              key={plan.title}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{plan.title}</h3>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <p className="text-right font-heading text-lg font-bold text-foreground">
                  {plan.free}
                  <span className="text-xs font-normal text-muted-foreground"> / month Free</span>
                  <span className="mt-1 block text-2xl">
                    {plan.pro}
                    <span className="text-xs font-normal text-muted-foreground"> / month Pro</span>
                  </span>
                </p>
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/pricing" />}
                className="mt-5"
              >
                View plans
                <ArrowRight aria-hidden="true" />
              </Button>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mb-4 flex flex-col gap-5 rounded-2xl border border-primary/15 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <ArrowDownRight className="size-4" aria-hidden="true" />
            Your next step starts here
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-foreground">
            Ready to find your learning match?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse available tuitions or create an account to start teaching.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/tuitions" />}>
            Browse Tuitions
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/sign-up" />}>
            Join as Tutor
          </Button>
        </div>
      </section>
    </>
  );
}

export function HomeWorkspace() {
  return (
    <HomeWorkspaceShell>
      <div className="mx-auto w-full max-w-7xl">
        <HeroSection />
        <FeaturedTuitions />
        <HomeSections />
      </div>
    </HomeWorkspaceShell>
  );
}
