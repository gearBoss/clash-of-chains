/**
 * ChainClash Deterministic Game Engine
 *
 * Pure TS engine with seeded RNG. No side effects.
 * All randomness is derived from seeds passed in.
 */

import {
  getCardById,
  MAX_HP,
  MAX_HAND_SIZE,
  MAX_MANA,
  INITIAL_HAND_SIZE,
  type CardDef,
} from "./cards";

// ─── Types ───

export interface CardInstance {
  cardId: number;
  instanceId: string;
}

export interface PlayerState {
  hp: number;
  mana: number;
  maxMana: number;
  shield: number;
  hand: CardInstance[];
  deck: CardInstance[];
  graveyard: CardInstance[];
  turnsPlayed: number;
}

export interface GameState {
  players: [PlayerState, PlayerState];
  currentTurn: 0 | 1;
  turnNumber: number;
  status: "active" | "p1_wins" | "p2_wins";
  log: GameEvent[];
}

export interface GameEvent {
  type: "play_card" | "draw_card" | "turn_start" | "pass" | "game_over" | "fatigue";
  turn: number;
  player: 0 | 1;
  data: Record<string, unknown>;
}

export interface Move {
  cardIndex: number; // -1 = pass
}

// ─── Seeded PRNG (Mulberry32) ───

export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hexToSeed(hex: string): number {
  // Take first 8 hex chars and convert to 32-bit int
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return parseInt(clean.slice(0, 8), 16) | 0;
}

// ─── Shuffle (Fisher-Yates) ───

function shuffle<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ─── Init Game ───

export function initGame(
  deck1Ids: number[],
  deck2Ids: number[],
  seed: string
): GameState {
  const rng = mulberry32(hexToSeed(seed));

  const p1Deck: CardInstance[] = deck1Ids.map((id, i) => ({
    cardId: id,
    instanceId: `p1_${i}`,
  }));
  const p2Deck: CardInstance[] = deck2Ids.map((id, i) => ({
    cardId: id,
    instanceId: `p2_${i}`,
  }));

  shuffle(p1Deck, rng);
  shuffle(p2Deck, rng);

  // Draw initial hands
  const p1Hand = p1Deck.splice(0, INITIAL_HAND_SIZE);
  const p2Hand = p2Deck.splice(0, INITIAL_HAND_SIZE);

  const state: GameState = {
    players: [
      {
        hp: MAX_HP,
        mana: 0,
        maxMana: 0,
        shield: 0,
        hand: p1Hand,
        deck: p1Deck,
        graveyard: [],
        turnsPlayed: 0,
      },
      {
        hp: MAX_HP,
        mana: 0,
        maxMana: 0,
        shield: 0,
        hand: p2Hand,
        deck: p2Deck,
        graveyard: [],
        turnsPlayed: 0,
      },
    ],
    currentTurn: 0,
    turnNumber: 1,
    status: "active",
    log: [],
  };

  // Start P1's first turn
  startTurn(state);

  return state;
}

// ─── Turn Start ───

function startTurn(state: GameState): void {
  const idx = state.currentTurn;
  const player = state.players[idx];

  player.turnsPlayed++;
  player.maxMana = Math.min(MAX_MANA, player.turnsPlayed);
  player.mana = player.maxMana;

  state.log.push({
    type: "turn_start",
    turn: state.turnNumber,
    player: idx,
    data: { mana: player.mana, maxMana: player.maxMana },
  });

  // Draw a card (if hand not full)
  if (player.deck.length > 0 && player.hand.length < MAX_HAND_SIZE) {
    const drawn = player.deck.shift()!;
    player.hand.push(drawn);
    state.log.push({
      type: "draw_card",
      turn: state.turnNumber,
      player: idx,
      data: { cardId: drawn.cardId },
    });
  } else if (player.deck.length === 0 && player.hand.length === 0) {
    // Fatigue: no cards left at all, auto-lose
    state.log.push({
      type: "fatigue",
      turn: state.turnNumber,
      player: idx,
      data: {},
    });
    state.status = idx === 0 ? "p2_wins" : "p1_wins";
  }
}

// ─── Move Validation ───

export function isValidMove(state: GameState, move: Move): { valid: boolean; error?: string } {
  if (state.status !== "active") {
    return { valid: false, error: "Game is not active" };
  }

  // Pass is always valid
  if (move.cardIndex === -1) {
    return { valid: true };
  }

  const player = state.players[state.currentTurn];

  if (move.cardIndex < 0 || move.cardIndex >= player.hand.length) {
    return { valid: false, error: "Invalid card index" };
  }

  const cardInstance = player.hand[move.cardIndex];
  const card = getCardById(cardInstance.cardId);

  if (card.manaCost > player.mana) {
    return { valid: false, error: `Not enough mana (have ${player.mana}, need ${card.manaCost})` };
  }

  return { valid: true };
}

// ─── Apply Move ───

export function applyMove(state: GameState, move: Move): GameState {
  // Deep clone
  const next: GameState = JSON.parse(JSON.stringify(state));

  const activeIdx = next.currentTurn;
  const opponentIdx = (1 - activeIdx) as 0 | 1;
  const active = next.players[activeIdx];
  const opponent = next.players[opponentIdx];

  if (move.cardIndex === -1) {
    // Pass
    next.log.push({
      type: "pass",
      turn: next.turnNumber,
      player: activeIdx,
      data: {},
    });
  } else {
    // Play card
    const cardInstance = active.hand[move.cardIndex];
    const card = getCardById(cardInstance.cardId);

    active.mana -= card.manaCost;
    active.hand.splice(move.cardIndex, 1);
    active.graveyard.push(cardInstance);

    const effects: Record<string, number> = {};

    // Apply damage
    if (card.damage > 0) {
      let dmg = card.damage;
      if (opponent.shield > 0) {
        const absorbed = Math.min(opponent.shield, dmg);
        opponent.shield -= absorbed;
        dmg -= absorbed;
        if (absorbed > 0) effects.shieldAbsorbed = absorbed;
      }
      opponent.hp -= dmg;
      effects.damage = dmg;
    }

    // Apply shield
    if (card.shield > 0) {
      active.shield += card.shield;
      effects.shield = card.shield;
    }

    // Apply heal
    if (card.heal > 0) {
      const healed = Math.min(card.heal, MAX_HP - active.hp);
      active.hp += healed;
      effects.heal = healed;
    }

    // Apply draw
    if (card.draw > 0) {
      let drawn = 0;
      for (let i = 0; i < card.draw; i++) {
        if (active.deck.length > 0 && active.hand.length < MAX_HAND_SIZE) {
          const c = active.deck.shift()!;
          active.hand.push(c);
          drawn++;
        }
      }
      if (drawn > 0) effects.cardsDrawn = drawn;
    }

    next.log.push({
      type: "play_card",
      turn: next.turnNumber,
      player: activeIdx,
      data: { cardId: card.id, cardName: card.name, effects },
    });
  }

  // Check win after damage
  if (opponent.hp <= 0) {
    opponent.hp = 0;
    next.status = activeIdx === 0 ? "p1_wins" : "p2_wins";
    next.log.push({
      type: "game_over",
      turn: next.turnNumber,
      player: activeIdx,
      data: { winner: activeIdx },
    });
    return next;
  }

  // Switch turns
  next.currentTurn = opponentIdx;
  next.turnNumber++;

  // Start next player's turn
  startTurn(next);

  return next;
}

// ─── Public view: sanitize state for a player (hide opponent's deck) ───

export function sanitizeForPlayer(
  state: GameState,
  playerIndex: 0 | 1
): GameState {
  const clone: GameState = JSON.parse(JSON.stringify(state));
  const opponentIdx = (1 - playerIndex) as 0 | 1;

  // Hide opponent's deck contents
  clone.players[opponentIdx].deck = clone.players[opponentIdx].deck.map(() => ({
    cardId: 0,
    instanceId: "hidden",
  }));

  return clone;
}

// ─── Check if a player can make any move ───

export function canPlayerAct(state: GameState): boolean {
  if (state.status !== "active") return false;
  const player = state.players[state.currentTurn];
  // Can always pass
  return true;
}

// ─── Check for auto-forfeit conditions ───

export function shouldAutoForfeit(
  lastMoveAt: Date | null,
  timeoutMs: number = 24 * 60 * 60 * 1000
): boolean {
  if (!lastMoveAt) return false;
  return Date.now() - lastMoveAt.getTime() > timeoutMs;
}
