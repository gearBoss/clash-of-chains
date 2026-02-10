"use client";

import { useQuery } from "@tanstack/react-query";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}
