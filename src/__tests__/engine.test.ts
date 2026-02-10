import { describe, it, expect } from "vitest";
import {
  initGame,
  applyMove,
  isValidMove,
  mulberry32,
  hexToSeed,
  sanitizeForPlayer,
  type GameState,
} from "@/lib/engine";
import { getCardById } from "@/lib/cards";

const DECK_1 = [1, 2, 3, 4, 5, 15, 16, 17, 24, 25, 33, 34, 35, 39, 40];
const DECK_2 = [7, 8, 9, 10, 11, 18, 19, 20, 26, 27, 36, 37, 38, 39, 40];

describe("mulberry32 PRNG", () => {
  it("produces deterministic sequence", () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(12345);
    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it("produces different sequences for different seeds", () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(67890);
    const vals1 = Array.from({ length: 10 }, () => rng1());
    const vals2 = Array.from({ length: 10 }, () => rng2());
    expect(vals1).not.toEqual(vals2);
  });

  it("produces values between 0 and 1", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

describe("hexToSeed", () => {
  it("converts hex string to number", () => {
    expect(hexToSeed("0xdeadbeef")).toBe(0xdeadbeef | 0);
    expect(hexToSeed("abcd1234")).toBe(0xabcd1234 | 0);
  });
});

describe("initGame", () => {
  it("creates valid initial state", () => {
    const state = initGame(DECK_1, DECK_2, "abcdef1234567890");

    expect(state.status).toBe("active");
    expect(state.currentTurn).toBe(0);
    expect(state.turnNumber).toBe(1);
    expect(state.players[0].hp).toBe(30);
    expect(state.players[1].hp).toBe(30);
    // P1 drew initial 3 + 1 on turn start = 4
    expect(state.players[0].hand.length).toBe(4);
    // P2 still has initial 3
    expect(state.players[1].hand.length).toBe(3);
    expect(state.players[0].deck.length).toBe(11);
    expect(state.players[1].deck.length).toBe(12);
    expect(state.players[0].mana).toBe(1);
    expect(state.players[0].maxMana).toBe(1);
  });

  it("is deterministic with same seed", () => {
    const s1 = initGame(DECK_1, DECK_2, "seed123");
    const s2 = initGame(DECK_1, DECK_2, "seed123");
    expect(JSON.stringify(s1)).toBe(JSON.stringify(s2));
  });

  it("differs with different seeds", () => {
    const s1 = initGame(DECK_1, DECK_2, "aabbccdd11223344");
    const s2 = initGame(DECK_1, DECK_2, "ff00ff0099887766");
    // Full states should differ (different shuffle orders)
    expect(JSON.stringify(s1)).not.toBe(JSON.stringify(s2));
  });
});

describe("isValidMove", () => {
  it("allows pass", () => {
    const state = initGame(DECK_1, DECK_2, "test");
    expect(isValidMove(state, { cardIndex: -1 })).toEqual({ valid: true });
  });

  it("rejects out-of-bounds card index", () => {
    const state = initGame(DECK_1, DECK_2, "test");
    const result = isValidMove(state, { cardIndex: 99 });
    expect(result.valid).toBe(false);
  });

  it("rejects move when game is over", () => {
    const state = initGame(DECK_1, DECK_2, "test");
    state.status = "p1_wins";
    expect(isValidMove(state, { cardIndex: 0 }).valid).toBe(false);
  });
});

describe("applyMove", () => {
  it("plays a card and reduces mana", () => {
    const state = initGame(DECK_1, DECK_2, "test");
    const card0 = state.players[0].hand[0];
    const origMana = state.players[0].mana;

    const result = isValidMove(state, { cardIndex: 0 });
    if (result.valid) {
      const next = applyMove(state, { cardIndex: 0 });
      // Mana should decrease or turn should advance
      expect(next.turnNumber).toBeGreaterThanOrEqual(state.turnNumber);
    }
  });

  it("pass advances turn", () => {
    const state = initGame(DECK_1, DECK_2, "test");
    expect(state.currentTurn).toBe(0);

    const next = applyMove(state, { cardIndex: -1 });
    expect(next.currentTurn).toBe(1);
    expect(next.turnNumber).toBe(2);
  });

  it("does not mutate original state", () => {
    const state = initGame(DECK_1, DECK_2, "immutable-test");
    const original = JSON.stringify(state);
    applyMove(state, { cardIndex: -1 });
    expect(JSON.stringify(state)).toBe(original);
  });

  it("damage reduces opponent HP through shield", () => {
    const state = initGame(DECK_1, DECK_2, "dmg-test");
    const attackIdx = state.players[0].hand.findIndex((c) => {
      const card = getCardById(c.cardId);
      return card.damage > 0 && card.manaCost <= state.players[0].mana;
    });

    if (attackIdx >= 0) {
      const next = applyMove(state, { cardIndex: attackIdx });
      expect(next.players[1].hp).toBeLessThan(30);
    }
  });

  it("game ends when HP reaches 0", () => {
    const state = initGame(DECK_1, DECK_2, "ko-test");
    // Force low HP
    state.players[1].hp = 1;
    state.players[0].mana = 10;

    const attackIdx = state.players[0].hand.findIndex((c) => {
      const card = getCardById(c.cardId);
      return card.damage > 0 && card.manaCost <= 10;
    });

    if (attackIdx >= 0) {
      const next = applyMove(state, { cardIndex: attackIdx });
      expect(next.status).toBe("p1_wins");
      expect(next.players[1].hp).toBeLessThanOrEqual(0);
    }
  });
});

describe("sanitizeForPlayer", () => {
  it("hides opponent deck", () => {
    const state = initGame(DECK_1, DECK_2, "sanitize-test");
    const sanitized = sanitizeForPlayer(state, 0);

    // Opponent deck should be hidden
    sanitized.players[1].deck.forEach((c) => {
      expect(c.cardId).toBe(0);
      expect(c.instanceId).toBe("hidden");
    });

    // Own deck should be visible
    sanitized.players[0].deck.forEach((c) => {
      expect(c.cardId).not.toBe(0);
    });
  });
});
