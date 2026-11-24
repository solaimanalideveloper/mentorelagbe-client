"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/components/tuition/BookmarkProvider";
import { authClient } from "@/lib/auth-client";
import type { Tuition } from "@/types";

export function BookmarkButton({ tuition }: { tuition: Tuition }) {
  const { data: session } = authClient.useSession();
  const { error, isLoading, isSaved, isToggling, toggle } = useBookmarks();
  const saved = isSaved(tuition._id);

  if (session?.user.role !== "student") return null;

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      size="sm"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${tuition.title} from saved tuitions` : `Save ${tuition.title}`}
      disabled={isLoading || Boolean(error) || isToggling(tuition._id)}
      onClick={() => void toggle(tuition)}
    >
      <Bookmark aria-hidden="true" />
      {isToggling(tuition._id) ? "Saving..." : saved ? "Saved" : "Save"}
    </Button>
  );
}
