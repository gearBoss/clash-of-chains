"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useDeck() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["deck"],
    queryFn: async () => {
      const res = await fetch("/api/deck");
      if (!res.ok) return { cardIds: null };
      return res.json();
    },
  });

  const saveDeck = useCallback(
    async (cardIds: number[]) => {
      setIsSaving(true);
      try {
        const res = await fetch("/api/deck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardIds }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        queryClient.invalidateQueries({ queryKey: ["deck"] });
        return result;
      } finally {
        setIsSaving(false);
      }
    },
    [queryClient]
  );

  return {
    deckCardIds: data?.cardIds as number[] | null,
    isLoading,
    isSaving,
    saveDeck,
  };
}
