"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { getErrorMessage, isObject } from "@/lib/data";
import { authClient } from "@/lib/auth-client";

type ApplyFormProps = {
  tuitionId: string;
};

export function ApplyForm({ tuitionId }: ApplyFormProps) {
  const { data: session, isPending } = authClient.useSession();
  const role = session?.user.role;
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [studentNote, setStudentNote] = useState("");

  useEffect(() => {
    if (isPending || role !== "student") return;
    let active = true;
    api.get<unknown>(`/api/applications/check/${encodeURIComponent(tuitionId)}`)
      .then(({ data }) => {
        if (!isObject(data) || typeof data.applied !== "boolean") {
          throw new Error("The application status response is invalid.");
        }
        if (active) setAlreadyApplied(data.applied);
      })
      .catch((error: unknown) => {
        if (active) toast.error(getErrorMessage(error, "Could not check your application."));
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });

    return () => {
      active = false;
    };
  }, [isPending, role, tuitionId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/api/applications", {
        tuitionId,
        studentPhone: phone,
        preferredSchedule,
        studentNote,
      });
      setAlreadyApplied(true);
      toast.success("Your application has been sent.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not submit your application."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground" role="status">Checking application access...</p>;
  }

  if (!session) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">Sign in as a student to apply for this tuition.</p>
        <Button className="mt-3" render={<Link href="/sign-in" />}>Sign In</Button>
      </div>
    );
  }

  if (role !== "student") {
    return <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">Only student accounts can apply to a tuition.</p>;
  }

  if (isChecking) {
    return <p className="text-sm text-muted-foreground" role="status">Checking application access...</p>;
  }

  if (alreadyApplied) {
    return <p className="rounded-lg bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">Already Applied</p>;
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="apply-phone">Phone number</Label>
        <Input id="apply-phone" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apply-schedule">Preferred schedule</Label>
        <Input id="apply-schedule" required value={preferredSchedule} onChange={(event) => setPreferredSchedule(event.target.value)} placeholder="e.g. Weekdays after 5 PM" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apply-note">Learning note</Label>
        <Textarea id="apply-note" rows={4} value={studentNote} onChange={(event) => setStudentNote(event.target.value)} placeholder="Share what you want the tutor to know" />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending application..." : "Apply for this tuition"}
      </Button>
    </form>
  );
}
