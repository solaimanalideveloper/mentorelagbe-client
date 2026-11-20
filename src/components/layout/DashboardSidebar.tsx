"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  UsersRound,
  Wallet,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Role = "student" | "tutor" | "admin";

type DashboardSidebarProps = {
  role: Role;
  pathname: string;
  userName: string;
  userEmail: string;
  plan: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
};

const roleNavigation = {
  student: [
    { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "My Applications", href: "/dashboard/student/my-applications", icon: FileText },
    { label: "Saved Tuitions", href: "/dashboard/student/saved", icon: BookOpen },
  ],
  tutor: [
    { label: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard },
    { label: "Post Tuition", href: "/dashboard/tutor/post-tuition", icon: Plus },
    { label: "My Tuitions", href: "/dashboard/tutor/my-tuitions", icon: BookOpen },
    { label: "Applicants", href: "/dashboard/tutor/applicants", icon: UsersRound },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/admin/users", icon: UsersRound },
    { label: "Tuitions", href: "/dashboard/admin/tuitions", icon: BookOpen },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: Wallet },
  ],
} satisfies Record<Role, { label: string; href: string; icon: typeof LayoutDashboard }[]>;

export function DashboardSidebar({
  role,
  pathname,
  userName,
  userEmail,
  plan,
  collapsed = false,
  onNavigate,
  onSignOut,
  isSigningOut,
}: DashboardSidebarProps) {
  const links = roleNavigation[role];

  return (
    <aside className="flex h-full flex-col border-r border-border bg-card">
      <Link
        href="/"
        className={`flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 font-heading text-xl font-bold text-foreground ${
          collapsed ? "justify-center px-2" : ""
        }`}
        aria-label="MentorLagbe home"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-5" aria-hidden="true" />
        </span>
        {!collapsed && <span>MentorLagbe</span>}
      </Link>

      <div className={`border-b border-border px-4 py-4 ${collapsed ? "px-2" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-4" aria-hidden="true" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              <span className="mt-1 inline-flex rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
                {plan} · {role}
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Dashboard navigation">
        <div>
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Main menu
            </p>
          )}
          <ul className="space-y-1">
            {links.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    title={collapsed ? label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                      collapsed ? "justify-center px-2" : ""
                    } ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_-3px_0_0_var(--primary)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Preferences
            </p>
          )}
          <Link
            href="/dashboard/profile"
            onClick={onNavigate}
            title={collapsed ? "Update Profile" : undefined}
            aria-current={pathname === "/dashboard/profile" ? "page" : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
              collapsed ? "justify-center px-2" : ""
            } ${
              pathname === "/dashboard/profile"
                ? "bg-primary/10 text-primary shadow-[inset_-3px_0_0_var(--primary)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed && <span>Update Profile</span>}
          </Link>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="lg"
          onClick={onSignOut}
          disabled={isSigningOut}
          title={collapsed ? "Sign out" : undefined}
          className={`mb-1 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>}
        </Button>
        <Link
          href="/"
          title={collapsed ? "Back to website" : undefined}
          className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Back to website</span>}
        </Link>
      </div>
    </aside>
  );
}
