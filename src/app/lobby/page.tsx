"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { useDeck } from "@/hooks/useDeck";
import { LobbyList } from "@/components/LobbyList";

export default function LobbyPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const { deckCardIds } = useDeck();
  const [matches, setMatches] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const [openRes, myRes] = await Promise.all([
        fetch("/api/match/list?status=WAITING"),
        address
          ? fetch(`/api/match/list?player=${address.toLowerCase()}`)
          : Promise.resolve(null),
      ]);
      const openData = await openRes.json();
      const myData = myRes ? await myRes.json() : { matches: [] };

      const all = [...openData.matches, ...myData.matches];
      const unique = Array.from(
        new Map(all.map((m: any) => [m.id, m])).values()
      );
      setMatches(unique);
    } catch {
      // ignore
    }
  }, [address]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMatches();
      const interval = setInterval(fetchMatches, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchMatches]);

  const createMatch = async () => {
    if (!deckCardIds || deckCardIds.length !== 15) {
      setError("Build a deck first (need 15 cards)");
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/match/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckCardIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchMatches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const joinMatch = async (matchId: string) => {
    if (!deckCardIds || deckCardIds.length !== 15) {
      setError("Build a deck first (need 15 cards)");
      return;
    }

    setIsJoining(true);
    setError(null);
    try {
      const res = await fetch("/api/match/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, deckCardIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/match/${matchId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-gray-500">
        Connect wallet and sign in to access the lobby.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Lobby</h1>
        <button
          onClick={createMatch}
          disabled={isCreating}
          className="btn-primary"
        >
          {isCreating ? "Creating..." : "Create Match"}
        </button>
      </div>

      {error && (
        <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!deckCardIds && (
        <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400">
          You need to{" "}
          <a href="/deck-builder" className="underline">
            build a deck
          </a>{" "}
          before creating or joining a match.
        </div>
      )}

      <LobbyList
        matches={matches}
        currentAddress={address?.toLowerCase()}
        onJoin={joinMatch}
        isJoining={isJoining}
      />
    </div>
  );
}
