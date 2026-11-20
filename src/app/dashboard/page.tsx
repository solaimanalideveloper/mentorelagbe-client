"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const role = session?.user.role;
    if (role === "student" || role === "tutor" || role === "admin") {
      router.replace(`/dashboard/${role}`);
    }
  }, [router, session]);

  return (
    <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground" role="status">
      Opening your dashboard...
    </div>
  );
}
