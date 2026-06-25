"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Sends already-signed-in users straight to the dashboard so the marketing
 * landing page never shows once you're logged in.
 */
export function RedirectIfAuthed() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  return null;
}
