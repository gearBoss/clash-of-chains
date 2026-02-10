"use client";

import { use } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMatch } from "@/hooks/useMatch";
import { MatchBoard } from "@/components/MatchBoard";
import { TransactionStatus } from "@/components/TransactionStatus";

export default function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const {
    match,
    isLoading,
    isSubmitting,
    playCard,
    pass,
    forfeit,
    anchor,
  } = useMatch(id);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-gray-500">
        Connect wallet and sign in to view this match.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm mt-3">Loading match...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20 text-gray-500">Match not found</div>
    );
  }

  const isFinished = ["COMPLETED", "FORFEITED", "ANCHORED"].includes(
    match.status
  );

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Match header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Match</h1>
          <p className="text-xs text-gray-600 font-mono">
            {match.id.slice(0, 12)}...
          </p>
        </div>
        <div className="flex gap-2">
          {match.status === "ACTIVE" && match.isPlayer && (
            <button
              onClick={forfeit}
              disabled={isSubmitting}
              className="btn-danger text-xs py-1"
            >
              Forfeit
            </button>
          )}
          {isFinished && !match.txHash && match.isPlayer && (
            <button
              onClick={anchor}
              disabled={isSubmitting}
              className="btn-primary text-xs py-1"
            >
              {isSubmitting ? "Anchoring..." : "Anchor Onchain"}
            </button>
          )}
        </div>
      </div>

      {/* Waiting state */}
      {match.status === "WAITING" && (
        <div className="glass-panel p-8 text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-gray-400">Waiting for opponent to join...</p>
          <p className="text-xs text-gray-600 mt-2 font-mono">
            Share match ID: {match.id}
          </p>
        </div>
      )}

      {/* Game board */}
      {match.gameState && match.playerIndex !== null && (
        <MatchBoard
          gameState={match.gameState}
          playerIndex={match.playerIndex}
          onPlayCard={playCard}
          onPass={pass}
          isSubmitting={isSubmitting}
          matchStatus={match.status}
        />
      )}

      {/* Tx status */}
      {match.txHash && (
        <TransactionStatus
          status="success"
          txHash={match.txHash}
        />
      )}

      {/* Match info footer */}
      <div className="glass-panel p-3 text-xs text-gray-600 space-y-1">
        <div>Status: {match.status}</div>
        <div>
          P1: {match.p1Id?.slice(0, 10)}... | P2:{" "}
          {match.p2Id?.slice(0, 10) ?? "—"}...
        </div>
        {match.winnerId && (
          <div>Winner: {match.winnerId.slice(0, 10)}...</div>
        )}
        {match.ratingDeltaP1 !== null && (
          <div>
            Rating delta: P1 {match.ratingDeltaP1 > 0 ? "+" : ""}
            {match.ratingDeltaP1} | P2 {match.ratingDeltaP2 > 0 ? "+" : ""}
            {match.ratingDeltaP2}
          </div>
        )}
      </div>
    </div>
  );
}
