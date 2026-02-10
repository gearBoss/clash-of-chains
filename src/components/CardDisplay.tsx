"use client";

import { type CardDef } from "@/lib/cards";
import { clsx } from "clsx";

const TYPE_COLORS: Record<string, string> = {
  attack: "border-red-500/40 bg-red-900/20",
  shield: "border-yellow-500/40 bg-yellow-900/20",
  heal: "border-green-500/40 bg-green-900/20",
  draw: "border-blue-500/40 bg-blue-900/20",
  multi: "border-purple-500/40 bg-purple-900/20",
};

const TYPE_ICONS: Record<string, string> = {
  attack: "⚔️",
  shield: "🛡️",
  heal: "💚",
  draw: "📜",
  multi: "✨",
};

const RARITY_STYLES: Record<string, string> = {
  common: "text-gray-300",
  uncommon: "text-blue-300",
  rare: "text-purple-300",
};

interface CardDisplayProps {
  card: CardDef;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
  playable?: boolean;
}

export function CardDisplay({
  card,
  onClick,
  selected,
  disabled,
  small,
  playable,
}: CardDisplayProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={clsx(
        "relative rounded-lg border-2 transition-all duration-200 select-none",
        TYPE_COLORS[card.type],
        small ? "p-2 w-24" : "p-3 w-36",
        onClick && !disabled && "cursor-pointer card-hover tap-feedback",
        selected && "ring-2 ring-primary-400 scale-105",
        disabled && "opacity-40 cursor-not-allowed",
        playable && "ring-1 ring-green-400/50"
      )}
    >
      {/* Mana cost badge */}
      <div
        className={clsx(
          "absolute -top-2 -right-2 bg-blue-600 text-white rounded-full font-bold flex items-center justify-center",
          small ? "w-5 h-5 text-xs" : "w-7 h-7 text-sm"
        )}
      >
        {card.manaCost}
      </div>

      {/* Type icon */}
      <div className={small ? "text-sm" : "text-lg"}>
        {TYPE_ICONS[card.type]}
      </div>

      {/* Name */}
      <div
        className={clsx(
          "font-semibold truncate",
          RARITY_STYLES[card.rarity],
          small ? "text-[10px] mt-0.5" : "text-xs mt-1"
        )}
      >
        {card.name}
      </div>

      {/* Stats */}
      <div className={clsx("flex gap-1 flex-wrap", small ? "mt-0.5" : "mt-1.5")}>
        {card.damage > 0 && (
          <span
            className={clsx(
              "bg-red-600/30 text-red-300 rounded px-1 font-mono",
              small ? "text-[9px]" : "text-[10px]"
            )}
          >
            {card.damage}dmg
          </span>
        )}
        {card.shield > 0 && (
          <span
            className={clsx(
              "bg-yellow-600/30 text-yellow-300 rounded px-1 font-mono",
              small ? "text-[9px]" : "text-[10px]"
            )}
          >
            {card.shield}shd
          </span>
        )}
        {card.heal > 0 && (
          <span
            className={clsx(
              "bg-green-600/30 text-green-300 rounded px-1 font-mono",
              small ? "text-[9px]" : "text-[10px]"
            )}
          >
            {card.heal}hp
          </span>
        )}
        {card.draw > 0 && (
          <span
            className={clsx(
              "bg-blue-600/30 text-blue-300 rounded px-1 font-mono",
              small ? "text-[9px]" : "text-[10px]"
            )}
          >
            +{card.draw}
          </span>
        )}
      </div>

      {/* Description tooltip - only on larger cards */}
      {!small && (
        <p className="text-[9px] text-gray-500 mt-1.5 line-clamp-2 leading-tight">
          {card.description}
        </p>
      )}
    </div>
  );
}
