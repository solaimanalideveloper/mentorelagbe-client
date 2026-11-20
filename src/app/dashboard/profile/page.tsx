"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DashboardTitle } from "@/components/dashboard/DashboardParts";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { getErrorMessage, readItem, isUser } from "@/lib/data";
import type { User } from "@/types";

type ProfileForm = {
  name: string;
  phone: string;
  bio: string;
  image: string;
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({ name: "", phone: "", bio: "", image: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const response = await api.get<unknown>("/api/users/me");
        const user = readItem<User>(response.data, isUser);
        if (active) setForm({
          name: user.name,
          phone: user.phone || "",
          bio: user.bio || "",
          image: user.image || "",
        });
      } catch (error) {
        if (active) {
          const message = getErrorMessage(error, "Unable to load your profile.");
          setErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  function updateField(key: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.patch("/api/users/me", form);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DashboardTitle title="Update Profile" description="Keep your contact details and public profile up to date." />
      {errorMessage && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</p>}
      {isLoading ? (
        <div className="h-80 animate-pulse rounded-xl bg-muted" role="status" />
      ) : (
        <form className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6" onSubmit={(event) => void saveProfile(event)}>
          <div className="space-y-2"><Label htmlFor="profile-name">Full name</Label><Input id="profile-name" required value={form.name} onChange={(event) => updateField("name", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="profile-bio">Bio</Label><Textarea id="profile-bio" rows={5} value={form.bio} onChange={(event) => updateField("bio", event.target.value)} /></div>
          <div className="space-y-2"><Label>Profile picture</Label><ImageUpload value={form.image} onChange={(url) => updateField("image", url)} /></div>
          <Button type="submit" size="lg" disabled={isSaving}>{isSaving ? "Saving..." : "Save Profile"}</Button>
        </form>
      )}
    </div>
  );
}
