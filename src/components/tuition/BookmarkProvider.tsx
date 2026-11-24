"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getErrorMessage, isTuition, readList } from "@/lib/data";
import { authClient } from "@/lib/auth-client";
import type { Tuition } from "@/types";

type BookmarkContextValue = {
  error: string;
  isLoading: boolean;
  isSaved: (tuitionId: string) => boolean;
  isToggling: (tuitionId: string) => boolean;
  retry: () => void;
  toggle: (tuition: Tuition) => Promise<void>;
  tuitions: Tuition[];
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

async function fetchBookmarks() {
  const response = await api.get<unknown>("/api/bookmarks");
  return readList(response.data, isTuition);
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const role = session?.user.role;
  const userEmail = session?.user.email;
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [requestStatus, setRequestStatus] = useState<"idle" | "ready" | "error">("idle");
  const [loadedFor, setLoadedFor] = useState("");
  const [error, setError] = useState("");
  const [togglingIds, setTogglingIds] = useState<string[]>([]);

  const loadBookmarks = useCallback(async () => {
    try {
      const saved = await fetchBookmarks();
      setTuitions(saved);
      setLoadedFor(userEmail || "");
      setRequestStatus("ready");
      setError("");
    } catch (loadError) {
      const message = getErrorMessage(loadError, "Unable to load saved tuitions.");
      setError(message);
      setRequestStatus("error");
      toast.error(message);
    }
  }, [userEmail]);

  useEffect(() => {
    if (isPending) return;
    if (role !== "student") return;
    let active = true;
    void fetchBookmarks()
      .then((saved) => {
        if (!active) return;
        setTuitions(saved);
        setLoadedFor(userEmail || "");
        setRequestStatus("ready");
        setError("");
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        const message = getErrorMessage(loadError, "Unable to load saved tuitions.");
        setError(message);
        setRequestStatus("error");
        toast.error(message);
      });
    return () => {
      active = false;
    };
  }, [isPending, role, userEmail]);

  const isLoading =
    isPending ||
    (role === "student" &&
      requestStatus !== "error" &&
      (requestStatus !== "ready" || loadedFor !== userEmail));

  const toggle = useCallback(
    async (tuition: Tuition) => {
      if (role !== "student") return;
      const wasSaved = tuitions.some((saved) => saved._id === tuition._id);
      setTogglingIds((current) => [...current, tuition._id]);
      try {
        await api.post(`/api/bookmarks/${encodeURIComponent(tuition._id)}`);
        setTuitions((current) =>
          wasSaved
            ? current.filter((saved) => saved._id !== tuition._id)
            : [tuition, ...current.filter((saved) => saved._id !== tuition._id)],
        );
        setRequestStatus("ready");
        setLoadedFor(userEmail || "");
        setError("");
        toast.success(wasSaved ? "Tuition removed from saved items." : "Tuition saved.");
      } catch (toggleError) {
        toast.error(getErrorMessage(toggleError, "Could not update saved tuitions."));
      } finally {
        setTogglingIds((current) => current.filter((id) => id !== tuition._id));
      }
    },
    [role, tuitions, userEmail],
  );

  const retry = useCallback(() => {
    setRequestStatus("idle");
    void loadBookmarks();
  }, [loadBookmarks]);

  const value = useMemo<BookmarkContextValue>(
    () => ({
      error,
      isLoading,
      isSaved: (tuitionId) => tuitions.some((tuition) => tuition._id === tuitionId),
      isToggling: (tuitionId) => togglingIds.includes(tuitionId),
      retry,
      toggle,
      tuitions,
    }),
    [error, isLoading, retry, togglingIds, toggle, tuitions],
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider.");
  }
  return context;
}
