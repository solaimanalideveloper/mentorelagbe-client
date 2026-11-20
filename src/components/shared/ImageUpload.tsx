"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/imgbb";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
};

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      toast.error(message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Selected upload preview" className="h-28 w-44 rounded-lg border border-border object-cover" />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
          <span>{value ? "Change image" : "Choose image"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => void handleFileChange(event)}
            disabled={isUploading}
          />
        </label>
        {isUploading && <Button type="button" size="sm" disabled>Uploading...</Button>}
        <span className="text-xs text-muted-foreground">JPG, PNG or WebP · up to 2MB</span>
      </div>
    </div>
  );
}
