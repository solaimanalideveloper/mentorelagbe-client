"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardTitle, EmptyState } from "@/components/dashboard/DashboardParts";
import { api } from "@/lib/api";
import { formatDate, getErrorMessage, readList, isPayment } from "@/lib/data";
import type { Payment } from "@/types";

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadPayments() {
      try {
        const response = await api.get<unknown>("/api/admin/transactions");
        const list = readList(response.data, isPayment);
        if (active) setPayments(list);
      } catch (error) {
        if (active) {
          const message = getErrorMessage(error, "Unable to load transactions.");
          setErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadPayments();
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardTitle title="Transactions" description="Review successful Pro plan payments." />
      {errorMessage && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</p>}
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-muted" role="status" />
      ) : payments.length === 0 ? (
        <EmptyState message="No payments have been recorded yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role / Plan</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Transaction ID</th><th className="px-4 py-3">Date</th></tr></thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="px-4 py-4"><p className="font-medium">{payment.userName}</p><p className="mt-1 text-xs text-muted-foreground">{payment.userEmail}</p></td>
                  <td className="px-4 py-4 capitalize text-muted-foreground">{payment.userRole} · {payment.planName}</td>
                  <td className="px-4 py-4 font-medium">${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}</td>
                  <td className="max-w-48 truncate px-4 py-4 font-mono text-xs text-muted-foreground" title={payment.transactionId}>{payment.transactionId}</td>
                  <td className="px-4 py-4 text-muted-foreground">{formatDate(payment.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
