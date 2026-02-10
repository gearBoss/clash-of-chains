import { describe, it, expect } from "vitest";
import {
  CARD_POOL,
  CARD_MAP,
  getCardById,
  validateDeck,
  DECK_SIZE,
  CARD_POOL_SIZE,
} from "@/lib/cards";

describe("Card Pool", () => {
  it("has exactly 40 cards", () => {
    expect(CARD_POOL.length).toBe(CARD_POOL_SIZE);
  });

  it("all cards have unique IDs", () => {
    const ids = CARD_POOL.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("IDs are 1 through 40", () => {
    const ids = CARD_POOL.map((c) => c.id).sort((a, b) => a - b);
    expect(ids[0]).toBe(1);
    expect(ids[ids.length - 1]).toBe(40);
  });

  it("all cards have valid mana costs", () => {
    CARD_POOL.forEach((c) => {
      expect(c.manaCost).toBeGreaterThanOrEqual(0);
      expect(c.manaCost).toBeLessThanOrEqual(10);
    });
  });

  it("all cards have at least one positive effect", () => {
    CARD_POOL.forEach((c) => {
      const total = c.damage + c.shield + c.heal + c.draw;
      expect(total).toBeGreaterThan(0);
    });
  });

  it("CARD_MAP matches CARD_POOL", () => {
    expect(CARD_MAP.size).toBe(CARD_POOL.length);
    CARD_POOL.forEach((c) => {
      expect(CARD_MAP.get(c.id)).toBe(c);
    });
  });
});

describe("getCardById", () => {
  it("returns correct card", () => {
    const card = getCardById(1);
    expect(card.name).toBe("Spark");
    expect(card.manaCost).toBe(1);
  });

  it("throws for invalid ID", () => {
    expect(() => getCardById(999)).toThrow("Card not found: 999");
  });
});

describe("validateDeck", () => {
  it("accepts valid deck of 15 unique cards", () => {
    const ids = Array.from({ length: DECK_SIZE }, (_, i) => i + 1);
    expect(validateDeck(ids)).toEqual({ valid: true });
  });

  it("rejects wrong size", () => {
    const result = validateDeck([1, 2, 3]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exactly 15");
  });

  it("rejects duplicate cards", () => {
    const ids = [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const result = validateDeck(ids);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Duplicate");
  });

  it("rejects invalid card IDs", () => {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 99];
    const result = validateDeck(ids);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid card ID");
  });
});
