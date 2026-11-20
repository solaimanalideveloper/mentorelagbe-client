"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { authClient } from "@/lib/auth-client";
import { clearApiToken } from "@/lib/api";
import { toast } from "sonner";

type Role = "student" | "tutor" | "admin";

function isRole(value: unknown): value is Role {
  return value === "student" || value === "tutor" || value === "admin";
}

function getPathRole(pathname: string): Role | null {
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/student")) return "student";
  if (pathname.startsWith("/dashboard/tutor")) return "tutor";
  return null;
}

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = session?.user;
  const role = isRole(user?.role) ? user.role : null;
  const pathRole = getPathRole(pathname);
  const needsRedirect =
    pathname === "/dashboard" || (role !== null && pathRole !== null && role !== pathRole);

  useEffect(() => {
    if (isPending || error) return;
    if (!session || !role) {
      router.replace("/sign-in");
      return;
    }
    if (needsRedirect) {
      router.replace(`/dashboard/${role}`);
    }
  }, [error, isPending, needsRedirect, role, router, session]);

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
    } catch (signOutError) {
      toast.error(
        signOutError instanceof Error ? signOutError.message : "Could not sign out.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isPending) {
    return <DashboardLoading />;
  }

  if (error && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="font-heading text-lg font-semibold text-foreground">
            Could not verify your session
          </h1>
          <p role="alert" className="mt-2 text-sm text-muted-foreground">
            {error.message || "Check the API connection and try again."}
          </p>
          <Button className="mt-5" onClick={() => void refetch()}>
            Try Again
          </Button>
        </section>
      </div>
    );
  }

  if (!session || !user || !role || needsRedirect) {
    return <DashboardLoading />;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div
        className={`sticky top-0 hidden h-screen shrink-0 transition-[width] duration-200 md:block ${
          collapsed ? "w-[76px]" : "w-60"
        }`}
      >
        <DashboardSidebar
          role={role}
          pathname={pathname}
          userName={user.name}
          userEmail={user.email}
          plan={user.plan || "free"}
          collapsed={collapsed}
          onSignOut={() => void handleSignOut()}
          isSigningOut={isSigningOut}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" />
              ) : (
                <PanelLeftClose aria-hidden="true" />
              )}
            </Button>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open dashboard menu"
                  />
                }
              >
                <Menu aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(85vw,280px)] p-0">
                <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
                <DashboardSidebar
                  role={role}
                  pathname={pathname}
                  userName={user.name}
                  userEmail={user.email}
                  plan={user.plan || "free"}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                  onSignOut={() => void handleSignOut()}
                  isSigningOut={isSigningOut}
                />
              </SheetContent>
            </Sheet>

            <p className="font-heading text-sm font-semibold capitalize text-foreground sm:text-base">
              {role} Workspace
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary">
              {user.name.slice(0, 1)}
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
        <span className="size-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        Checking your session...
      </div>
    </div>
  );
}
