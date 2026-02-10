"use client";

import { useState } from "react";
import type { GameState } from "@/lib/engine";
import { getCardById } from "@/lib/cards";
import { PlayerStats } from "./PlayerStats";
import { HandDisplay } from "./HandDisplay";
import { clsx } from "clsx";

interface MatchBoardProps {
  gameState: GameState;
  playerIndex: 0 | 1;
  onPlayCard: (cardIndex: number) => void;
  onPass: () => void;
  isSubmitting: boolean;
  matchStatus: string;
}

export function MatchBoard({
  gameState,
  playerIndex,
  onPlayCard,
  onPass,
  isSubmitting,
  matchStatus,
}: MatchBoardProps) {
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const isMyTurn = gameState.currentTurn === playerIndex;
  const myState = gameState.players[playerIndex];
  const opponentState = gameState.players[playerIndex === 0 ? 1 : 0];
  const isGameOver = gameState.status !== "active";

  // Show last event
  const latestLog = gameState.log[gameState.log.length - 1];

  return (
    <div className="space-y-4">
      {/* Game status banner */}
      {isGameOver && (
        <div
          className={clsx(
            "text-center py-3 rounded-xl font-bold text-lg animate-fade-in",
            (gameState.status === "p1_wins" && playerIndex === 0) ||
              (gameState.status === "p2_wins" && playerIndex === 1)
              ? "bg-green-600/20 text-green-400"
              : "bg-red-600/20 text-red-400"
          )}
        >
          {(gameState.status === "p1_wins" && playerIndex === 0) ||
          (gameState.status === "p2_wins" && playerIndex === 1)
            ? "Victory!"
            : "Defeat"}
        </div>
      )}

      {/* Turn indicator */}
      {!isGameOver && (
        <div className="text-center">
          <span
            className={clsx(
              "text-sm font-medium px-4 py-1.5 rounded-full",
              isMyTurn
                ? "bg-primary-600/20 text-primary-400"
                : "bg-gray-700/50 text-gray-400"
            )}
          >
            {isMyTurn ? "Your Turn" : "Opponent's Turn"} — Turn{" "}
            {gameState.turnNumber}
          </span>
        </div>
      )}

      {/* Opponent stats (top) */}
      <PlayerStats
        player={opponentState}
        label="Opponent"
        isActive={!isMyTurn && !isGameOver}
        animationClass={
          latestLog?.type === "play_card" &&
          latestLog.player !== playerIndex
            ? "animate-damage-shake"
            : undefined
        }
      />

      {/* Battle log - latest event */}
      {latestLog && (
        <div className="glass-panel p-2 text-center text-xs text-gray-400 animate-fade-in">
          {latestLog.type === "play_card" && (
            <span>
              {latestLog.player === playerIndex ? "You" : "Opponent"} played{" "}
              <span className="text-white font-semibold">
                {String(latestLog.data.cardName)}
              </span>
              {latestLog.data.effects != null ? (
                <span>
                  {Object.entries(
                    latestLog.data.effects as Record<string, number>
                  ).map(([key, val]) => (
                    <span key={key} className="ml-1">
                      ({key}: {String(val)})
                    </span>
                  ))}
                </span>
              ) : null}
            </span>
          )}
          {latestLog.type === "pass" && (
            <span>
              {latestLog.player === playerIndex ? "You" : "Opponent"} passed
            </span>
          )}
        </div>
      )}

      {/* My stats (bottom) */}
      <PlayerStats
        player={myState}
        label="You"
        isActive={isMyTurn && !isGameOver}
      />

      {/* Hand */}
      {!isGameOver && (
        <>
          <HandDisplay
            hand={myState.hand}
            currentMana={myState.mana}
            onPlayCard={onPlayCard}
            disabled={!isMyTurn || isSubmitting}
          />

          {/* Pass button */}
          {isMyTurn && (
            <div className="text-center">
              <button
                onClick={onPass}
                disabled={isSubmitting}
                className="btn-secondary text-sm"
              >
                {isSubmitting ? "Submitting..." : "Pass Turn"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
