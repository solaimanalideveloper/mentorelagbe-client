import type { AppStatus, Approval } from "@/types";

export function StatusBadge({ status }: { status: AppStatus | Approval }) {
  const style =
    status === "accepted" || status === "approved"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : status === "rejected"
        ? "bg-destructive/10 text-destructive"
        : "bg-amber-500/15 text-amber-800 dark:text-amber-300";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  );
}
