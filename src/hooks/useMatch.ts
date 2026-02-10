"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useMatch(matchId: string | null) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const res = await fetch(`/api/match/${matchId}`);
      if (!res.ok) throw new Error("Failed to fetch match");
      return res.json();
    },
    enabled: !!matchId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 3s if it's opponent's turn, otherwise 10s
      if (data?.status === "ACTIVE" && data?.gameState?.status === "active") {
        const isMyTurn = data.gameState.currentTurn === data.playerIndex;
        return isMyTurn ? 10_000 : 3_000;
      }
      return false;
    },
  });

  const playCard = useCallback(
    async (cardIndex: number) => {
      if (!matchId) return;
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/match/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId, cardIndex }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        await refetch();
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [matchId, refetch]
  );

  const pass = useCallback(async () => {
    return playCard(-1);
  }, [playCard]);

  const forfeit = useCallback(async () => {
    if (!matchId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/match/forfeit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      await refetch();
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [matchId, refetch]);

  const anchor = useCallback(async () => {
    if (!matchId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/match/anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      await refetch();
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [matchId, refetch]);

  return {
    match: data,
    isLoading,
    error,
    isSubmitting,
    playCard,
    pass,
    forfeit,
    anchor,
    refetch,
  };
}
