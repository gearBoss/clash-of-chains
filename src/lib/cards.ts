export interface CardDef {
  id: number;
  name: string;
  manaCost: number;
  damage: number;
  shield: number;
  heal: number;
  draw: number;
  rarity: "common" | "uncommon" | "rare";
  description: string;
  type: "attack" | "shield" | "heal" | "draw" | "multi";
}

/** Full 40-card pool. Players pick 15 for their deck. */
export const CARD_POOL: CardDef[] = [
  // ─── Attack cards (14) ───
  { id: 1,  name: "Spark",         manaCost: 1, damage: 2,  shield: 0, heal: 0, draw: 0, rarity: "common",   type: "attack",  description: "A small burst of energy. Deals 2 damage." },
  { id: 2,  name: "Slash",         manaCost: 2, damage: 4,  shield: 0, heal: 0, draw: 0, rarity: "common",   type: "attack",  description: "A swift blade strike. Deals 4 damage." },
  { id: 3,  name: "Fireball",      manaCost: 3, damage: 6,  shield: 0, heal: 0, draw: 0, rarity: "common",   type: "attack",  description: "A blazing orb of fire. Deals 6 damage." },
  { id: 4,  name: "Lightning Bolt",manaCost: 4, damage: 8,  shield: 0, heal: 0, draw: 0, rarity: "uncommon", type: "attack",  description: "A crackling bolt from the sky. Deals 8 damage." },
  { id: 5,  name: "Heavy Blow",    manaCost: 5, damage: 11, shield: 0, heal: 0, draw: 0, rarity: "uncommon", type: "attack",  description: "A devastating strike. Deals 11 damage." },
  { id: 6,  name: "Meteor Strike",  manaCost: 7, damage: 15, shield: 0, heal: 0, draw: 0, rarity: "rare",     type: "attack",  description: "A meteor crashes down. Deals 15 damage." },
  { id: 7,  name: "Quick Jab",     manaCost: 1, damage: 2,  shield: 0, heal: 0, draw: 0, rarity: "common",   type: "attack",  description: "A fast punch. Deals 2 damage." },
  { id: 8,  name: "Arcane Blast",  manaCost: 3, damage: 5,  shield: 0, heal: 0, draw: 0, rarity: "common",   type: "attack",  description: "Raw arcane energy. Deals 5 damage." },
  { id: 9,  name: "Shadow Strike", manaCost: 4, damage: 9,  shield: 0, heal: 0, draw: 0, rarity: "uncommon", type: "attack",  description: "A strike from the shadows. Deals 9 damage." },
  { id: 10, name: "Flame Wave",    manaCost: 6, damage: 13, shield: 0, heal: 0, draw: 0, rarity: "rare",     type: "attack",  description: "A sweeping wall of fire. Deals 13 damage." },
  { id: 11, name: "Ice Shard",     manaCost: 2, damage: 3,  shield: 0, heal: 0, draw: 0, rarity: "common",   type: "attack",  description: "A shard of frozen ice. Deals 3 damage." },
  { id: 12, name: "Void Bolt",     manaCost: 5, damage: 10, shield: 0, heal: 0, draw: 0, rarity: "uncommon", type: "attack",  description: "Energy from the void. Deals 10 damage." },
  { id: 13, name: "Thunder Clap",  manaCost: 3, damage: 5,  shield: 0, heal: 0, draw: 0, rarity: "common",   type: "attack",  description: "A thunderous shockwave. Deals 5 damage." },
  { id: 14, name: "Dragon Breath", manaCost: 8, damage: 18, shield: 0, heal: 0, draw: 0, rarity: "rare",     type: "attack",  description: "Ancient dragon flame. Deals 18 damage." },

  // ─── Shield cards (9) ───
  { id: 15, name: "Block",         manaCost: 1, damage: 0, shield: 3,  heal: 0, draw: 0, rarity: "common",   type: "shield",  description: "Raise your guard. Gain 3 shield." },
  { id: 16, name: "Iron Wall",     manaCost: 2, damage: 0, shield: 5,  heal: 0, draw: 0, rarity: "common",   type: "shield",  description: "An iron barrier. Gain 5 shield." },
  { id: 17, name: "Barrier",       manaCost: 3, damage: 0, shield: 7,  heal: 0, draw: 0, rarity: "common",   type: "shield",  description: "A magical barrier. Gain 7 shield." },
  { id: 18, name: "Fortify",       manaCost: 4, damage: 0, shield: 10, heal: 0, draw: 0, rarity: "uncommon", type: "shield",  description: "Harden defenses. Gain 10 shield." },
  { id: 19, name: "Stone Skin",    manaCost: 5, damage: 0, shield: 12, heal: 0, draw: 0, rarity: "uncommon", type: "shield",  description: "Skin turns to stone. Gain 12 shield." },
  { id: 20, name: "Divine Shield", manaCost: 6, damage: 0, shield: 15, heal: 0, draw: 0, rarity: "rare",     type: "shield",  description: "A divine ward. Gain 15 shield." },
  { id: 21, name: "Aegis",         manaCost: 1, damage: 0, shield: 2,  heal: 0, draw: 0, rarity: "common",   type: "shield",  description: "A minor ward. Gain 2 shield." },
  { id: 22, name: "Ward",          manaCost: 2, damage: 0, shield: 4,  heal: 0, draw: 0, rarity: "common",   type: "shield",  description: "A protective ward. Gain 4 shield." },
  { id: 23, name: "Magic Armor",   manaCost: 3, damage: 0, shield: 6,  heal: 0, draw: 0, rarity: "common",   type: "shield",  description: "Enchanted armor. Gain 6 shield." },

  // ─── Heal cards (9) ───
  { id: 24, name: "First Aid",     manaCost: 1, damage: 0, shield: 0, heal: 2,  draw: 0, rarity: "common",   type: "heal",    description: "Quick patch-up. Restore 2 HP." },
  { id: 25, name: "Heal",          manaCost: 2, damage: 0, shield: 0, heal: 4,  draw: 0, rarity: "common",   type: "heal",    description: "Healing magic. Restore 4 HP." },
  { id: 26, name: "Regenerate",    manaCost: 3, damage: 0, shield: 0, heal: 6,  draw: 0, rarity: "common",   type: "heal",    description: "Accelerated healing. Restore 6 HP." },
  { id: 27, name: "Greater Heal",  manaCost: 4, damage: 0, shield: 0, heal: 8,  draw: 0, rarity: "uncommon", type: "heal",    description: "Powerful restoration. Restore 8 HP." },
  { id: 28, name: "Holy Light",    manaCost: 5, damage: 0, shield: 0, heal: 10, draw: 0, rarity: "uncommon", type: "heal",    description: "Blessed light. Restore 10 HP." },
  { id: 29, name: "Divine Blessing",manaCost: 6, damage: 0, shield: 0, heal: 12, draw: 0, rarity: "rare",    type: "heal",    description: "A divine gift. Restore 12 HP." },
  { id: 30, name: "Bandage",       manaCost: 1, damage: 0, shield: 0, heal: 3,  draw: 0, rarity: "common",   type: "heal",    description: "Simple bandage. Restore 3 HP." },
  { id: 31, name: "Restoration",   manaCost: 3, damage: 0, shield: 0, heal: 5,  draw: 0, rarity: "common",   type: "heal",    description: "Nature's touch. Restore 5 HP." },
  { id: 32, name: "Life Surge",    manaCost: 7, damage: 0, shield: 0, heal: 14, draw: 0, rarity: "rare",     type: "heal",    description: "A surge of life force. Restore 14 HP." },

  // ─── Multi-effect / Draw cards (8) ───
  { id: 33, name: "Chain Strike",  manaCost: 2, damage: 3,  shield: 0, heal: 0, draw: 1, rarity: "uncommon", type: "multi",   description: "Strike and pull. Deal 3 damage, draw 1 card." },
  { id: 34, name: "Reflect",       manaCost: 3, damage: 2,  shield: 4, heal: 0, draw: 0, rarity: "uncommon", type: "multi",   description: "Deflect and counter. Gain 4 shield, deal 2 damage." },
  { id: 35, name: "Life Tap",      manaCost: 2, damage: 0,  shield: 0, heal: 2, draw: 1, rarity: "uncommon", type: "multi",   description: "Drain life essence. Restore 2 HP, draw 1 card." },
  { id: 36, name: "War Cry",       manaCost: 3, damage: 3,  shield: 2, heal: 0, draw: 0, rarity: "uncommon", type: "multi",   description: "A rallying cry. Deal 3 damage, gain 2 shield." },
  { id: 37, name: "Tactical Retreat",manaCost: 2, damage: 0, shield: 3, heal: 0, draw: 1, rarity: "uncommon", type: "multi",  description: "Fall back wisely. Gain 3 shield, draw 1 card." },
  { id: 38, name: "Meditate",      manaCost: 3, damage: 0,  shield: 0, heal: 3, draw: 1, rarity: "uncommon", type: "multi",   description: "Focus the mind. Restore 3 HP, draw 1 card." },
  { id: 39, name: "Scout",         manaCost: 1, damage: 0,  shield: 0, heal: 0, draw: 2, rarity: "common",   type: "draw",    description: "Send scouts ahead. Draw 2 cards." },
  { id: 40, name: "Knowledge",     manaCost: 3, damage: 0,  shield: 0, heal: 0, draw: 3, rarity: "rare",     type: "draw",    description: "Ancient knowledge. Draw 3 cards." },
];

export const CARD_MAP = new Map<number, CardDef>(
  CARD_POOL.map((c) => [c.id, c])
);

export function getCardById(id: number): CardDef {
  const card = CARD_MAP.get(id);
  if (!card) throw new Error(`Card not found: ${id}`);
  return card;
}

export const DECK_SIZE = 15;
export const CARD_POOL_SIZE = 40;
export const MAX_HP = 30;
export const MAX_HAND_SIZE = 8;
export const MAX_MANA = 10;
export const INITIAL_HAND_SIZE = 3;

/** Validate that a deck is legal: exactly DECK_SIZE cards, all valid IDs, no duplicates beyond pool limits. */
export function validateDeck(cardIds: number[]): { valid: boolean; error?: string } {
  if (cardIds.length !== DECK_SIZE) {
    return { valid: false, error: `Deck must have exactly ${DECK_SIZE} cards, got ${cardIds.length}` };
  }

  const seen = new Set<number>();
  for (const id of cardIds) {
    if (!CARD_MAP.has(id)) {
      return { valid: false, error: `Invalid card ID: ${id}` };
    }
    if (seen.has(id)) {
      return { valid: false, error: `Duplicate card ID: ${id}` };
    }
    seen.add(id);
  }

  return { valid: true };
}
