"use client";

import { clsx } from "clsx";
import type { PlayerState } from "@/lib/engine";
import { ManaBar } from "./ManaBar";

interface PlayerStatsProps {
  player: PlayerState;
  label: string;
  isActive: boolean;
  animationClass?: string;
}

export function PlayerStats({
  player,
  label,
  isActive,
  animationClass,
}: PlayerStatsProps) {
  const hpPercent = Math.max(0, (player.hp / 30) * 100);

  return (
    <div
      className={clsx(
        "glass-panel p-3 rounded-xl transition-all duration-300",
        isActive && "ring-2 ring-primary-400/50",
        animationClass
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-300">{label}</span>
        {isActive && (
          <span className="text-xs bg-primary-600/30 text-primary-300 px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      {/* HP Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-0.5">
          <span className="text-red-400">HP</span>
          <span className="font-mono text-red-300">{player.hp}/30</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              hpPercent > 50
                ? "bg-green-500"
                : hpPercent > 25
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Mana */}
      <ManaBar current={player.mana} max={player.maxMana} />

      {/* Shield */}
      {player.shield > 0 && (
        <div className="mt-1 flex items-center gap-1 animate-shield-up">
          <span className="text-yellow-400 text-sm">🛡️</span>
          <span className="text-xs font-mono text-yellow-300">
            {player.shield}
          </span>
        </div>
      )}

      {/* Cards info */}
      <div className="mt-2 flex gap-3 text-[10px] text-gray-500">
        <span>Hand: {player.hand.length}</span>
        <span>Deck: {player.deck.length}</span>
      </div>
    </div>
  );
}
