import type { ReactNode } from "react";
import DashboardLayoutClient from "./DashboardLayoutClient";

export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
