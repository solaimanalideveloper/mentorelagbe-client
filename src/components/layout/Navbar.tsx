"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { clearApiToken } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/how-it-works" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (pathname === "/" || pathname.startsWith("/dashboard")) {
    return null;
  }

  const user = session?.user;
  const role = user?.role;

  async function handleSignOut() {
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
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold text-foreground"
          aria-label="MentorLagbe home"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <span>MentorLagbe</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {!isPending && (
          <div className="hidden items-center gap-2 md:flex">
            {user && role ? (
              <>
                <span className="max-w-36 truncate text-sm font-medium text-foreground">{user.name}</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">{role}</span>
                <Button variant="outline" size="lg" render={<Link href={`/dashboard/${role}`} />}>Dashboard</Button>
                <Button variant="ghost" size="lg" render={<Link href="/dashboard/profile" />}>Update Profile</Button>
                <Button variant="ghost" size="lg" onClick={() => void handleSignOut()}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="lg" render={<Link href="/sign-in" />}>Sign In</Button>
                <Button variant="default" size="lg" render={<Link href="/sign-up" />}>Sign Up</Button>
              </>
            )}
          </div>
        )}

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="md:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(85vw,320px)]">
            <SheetHeader className="pr-12">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {navItems.map((item) => (
                <SheetClose key={item.href} nativeButton={false} render={<Link href={item.href} />}>
                  <span className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">
                    {item.label}
                  </span>
                </SheetClose>
              ))}
            </div>
            {user && role ? (
              <div className="mt-auto space-y-2 border-t border-border p-4">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{role}</p>
                <SheetClose nativeButton={false} render={<Link href={`/dashboard/${role}`} />}>
                  <Button variant="default" size="lg" className="w-full">Dashboard</Button>
                </SheetClose>
                <SheetClose nativeButton={false} render={<Link href="/dashboard/profile" />}>
                  <Button variant="outline" size="lg" className="w-full">Update Profile</Button>
                </SheetClose>
                <Button variant="ghost" size="lg" className="w-full" onClick={() => void handleSignOut()}>Sign Out</Button>
              </div>
            ) : (
              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border p-4">
                <SheetClose nativeButton={false} render={<Link href="/sign-in" />}>
                  <Button variant="outline" size="lg" className="w-full">Sign In</Button>
                </SheetClose>
                <SheetClose nativeButton={false} render={<Link href="/sign-up" />}>
                  <Button variant="default" size="lg" className="w-full">Sign Up</Button>
                </SheetClose>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
