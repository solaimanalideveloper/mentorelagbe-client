"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardTitle, EmptyState } from "@/components/dashboard/DashboardParts";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { getErrorMessage, readList, isUser } from "@/lib/data";
import type { Role, User } from "@/types";

const roles: Role[] = ["student", "tutor", "admin"];

export default function AdminUsersPage() {
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Role>>({});
  const [savingId, setSavingId] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get<unknown>("/api/admin/users");
      const list = readList(response.data, isUser);
      setUsers(list);
      setSelectedRoles(Object.fromEntries(list.map((user) => [user._id, user.role])));
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load users.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { void loadUsers(); });
    return () => window.cancelAnimationFrame(frame);
  }, [loadUsers]);

  async function updateRole(user: User) {
    const role = selectedRoles[user._id];
    if (role === user.role) return;
    if (user.email === session?.user.email && role !== "admin") {
      toast.error("You cannot demote your own account.");
      setSelectedRoles((current) => ({ ...current, [user._id]: user.role }));
      return;
    }
    setSavingId(user._id);
    try {
      await api.patch(`/api/admin/users/${encodeURIComponent(user._id)}/role`, { role });
      toast.success(`${user.name}'s role was updated.`);
      await loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update this account."));
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardTitle title="Manage Users" description="Review user accounts and update their platform role." />
      {errorMessage && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</p>}
      {isLoading ? (
        <div className="space-y-3" role="status">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : users.length === 0 ? (
        <EmptyState message="There are no users to display." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Action</th></tr></thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const isSelf = user.email === session?.user.email;
                return (
                  <tr key={user._id}>
                    <td className="px-4 py-4 font-medium">{user.name}{isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</td>
                    <td className="px-4 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-4">
                      <label className="sr-only" htmlFor={`role-${user._id}`}>Role for {user.name}</label>
                      <select id={`role-${user._id}`} value={selectedRoles[user._id] || user.role} onChange={(event) => {
                        const value = event.target.value;
                        if (roles.includes(value as Role)) setSelectedRoles((current) => ({ ...current, [user._id]: value as Role }));
                      }} className="h-9 rounded-lg border border-input bg-background px-2 text-sm" disabled={savingId === user._id || (isSelf && user.role === "admin")}>
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <Button size="sm" variant="outline" disabled={savingId === user._id || selectedRoles[user._id] === user.role} onClick={() => void updateRole(user)}>{savingId === user._id ? "Saving..." : "Save Role"}</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
