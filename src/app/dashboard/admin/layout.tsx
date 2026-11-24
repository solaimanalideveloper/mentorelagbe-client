import type { ReactNode } from "react";

export const instant = false;

export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
