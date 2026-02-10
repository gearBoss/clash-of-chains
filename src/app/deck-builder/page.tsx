"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDeck } from "@/hooks/useDeck";
import { CARD_POOL, DECK_SIZE, type CardDef } from "@/lib/cards";
import { CardDisplay } from "@/components/CardDisplay";

const TYPE_FILTERS = ["all", "attack", "shield", "heal", "draw", "multi"];

export default function DeckBuilderPage() {
  const { isAuthenticated } = useAuth();
  const { deckCardIds, isSaving, saveDeck } = useDeck();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState(false);

  // Load saved deck
  useEffect(() => {
    if (deckCardIds) {
      setSelected(new Set(deckCardIds));
    }
  }, [deckCardIds]);

  const toggleCard = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < DECK_SIZE) {
        next.add(id);
      }
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    const ids = Array.from(selected).sort((a, b) => a - b);
    try {
      await saveDeck(ids);
      setSaved(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCards =
    filter === "all"
      ? CARD_POOL
      : CARD_POOL.filter((c) => c.type === filter);

  // Mana curve
  const manaCurve = Array.from(selected).reduce(
    (acc, id) => {
      const card = CARD_POOL.find((c) => c.id === id);
      if (card) {
        const bucket = Math.min(card.manaCost, 7);
        acc[bucket] = (acc[bucket] || 0) + 1;
      }
      return acc;
    },
    {} as Record<number, number>
  );

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-gray-500">
        Connect wallet and sign in to build your deck.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Deck Builder</h1>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-mono ${
              selected.size === DECK_SIZE ? "text-green-400" : "text-gray-400"
            }`}
          >
            {selected.size}/{DECK_SIZE}
          </span>
          <button
            onClick={handleSave}
            disabled={selected.size !== DECK_SIZE || isSaving}
            className="btn-primary text-sm"
          >
            {isSaving ? "Saving..." : saved ? "Saved!" : "Save Deck"}
          </button>
        </div>
      </div>

      {/* Mana curve */}
      <div className="glass-panel p-3">
        <div className="text-xs text-gray-500 mb-2">Mana Curve</div>
        <div className="flex items-end gap-1 h-16">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((cost) => {
            const count = manaCurve[cost] || 0;
            const maxCount = Math.max(...Object.values(manaCurve), 1);
            const height = count > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div
                key={cost}
                className="flex-1 flex flex-col items-center gap-0.5"
              >
                <span className="text-[9px] text-gray-500">{count || ""}</span>
                <div
                  className="w-full bg-primary-600/40 rounded-t transition-all duration-300"
                  style={{ height: `${height}%`, minHeight: count > 0 ? 4 : 0 }}
                />
                <span className="text-[9px] text-gray-600">
                  {cost === 7 ? "7+" : cost}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              filter === f
                ? "bg-primary-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredCards.map((card) => (
          <CardDisplay
            key={card.id}
            card={card}
            selected={selected.has(card.id)}
            onClick={() => toggleCard(card.id)}
            disabled={!selected.has(card.id) && selected.size >= DECK_SIZE}
          />
        ))}
      </div>
    </div>
  );
}
