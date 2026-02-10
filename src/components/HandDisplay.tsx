"use client";

import { type CardDef, getCardById } from "@/lib/cards";
import type { CardInstance } from "@/lib/engine";
import { CardDisplay } from "./CardDisplay";

interface HandDisplayProps {
  hand: CardInstance[];
  currentMana: number;
  onPlayCard: (index: number) => void;
  disabled: boolean;
}

export function HandDisplay({
  hand,
  currentMana,
  onPlayCard,
  disabled,
}: HandDisplayProps) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-2">
        Your Hand ({hand.length} cards)
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
        {hand.map((instance, idx) => {
          const card = getCardById(instance.cardId);
          const canPlay = card.manaCost <= currentMana;

          return (
            <div key={instance.instanceId} className="snap-start flex-shrink-0">
              <CardDisplay
                card={card}
                onClick={() => onPlayCard(idx)}
                disabled={disabled || !canPlay}
                playable={!disabled && canPlay}
                small
              />
            </div>
          );
        })}
        {hand.length === 0 && (
          <div className="text-sm text-gray-600 italic py-4">
            No cards in hand
          </div>
        )}
      </div>
    </div>
  );
}
