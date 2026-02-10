import { z } from "zod";

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

export const verifySchema = z.object({
  address: addressSchema,
  message: z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, "Invalid signature"),
  nonce: z.string().min(1),
});

export const createMatchSchema = z.object({
  deckCardIds: z.array(z.number().int().min(1).max(40)).length(15),
});

export const joinMatchSchema = z.object({
  matchId: z.string().min(1),
  deckCardIds: z.array(z.number().int().min(1).max(40)).length(15),
});

export const moveSchema = z.object({
  matchId: z.string().min(1),
  cardIndex: z.number().int().min(-1).max(14),
});

export const forfeitSchema = z.object({
  matchId: z.string().min(1),
});

export const anchorSchema = z.object({
  matchId: z.string().min(1),
});

export const deckSchema = z.object({
  cardIds: z.array(z.number().int().min(1).max(40)).length(15),
});
