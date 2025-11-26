"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "../../lib/panel/api";
import { fetchSession } from "../../lib/panel/auth";
import { clearPanelSession, getPanelUser } from "../../lib/panel/session";
import type { PanelUser } from "../../lib/panel/session";

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function useAdminAuth() {
  const initial = getPanelUser() ?? null;

  const query = useQuery<PanelUser | null>({
    queryKey: ["admin", "me"],
    queryFn: async () => {
      try {
        return await fetchSession();
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          clearPanelSession();
          return null;
        }

        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    initialData: initial,
    refetchOnMount: "always",
    enabled: typeof window !== "undefined"
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(query.data),
    error: query.error,
    refetch: query.refetch
  };
}
