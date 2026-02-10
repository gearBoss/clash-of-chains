import { base, baseSepolia } from "wagmi/chains";

export const CHAIN_CONFIG = {
  base: {
    chain: base,
    name: "Base",
    blockExplorer: "https://basescan.org",
  },
  "base-sepolia": {
    chain: baseSepolia,
    name: "Base Sepolia",
    blockExplorer: "https://sepolia.basescan.org",
  },
} as const;

export type ChainKey = keyof typeof CHAIN_CONFIG;

export function getChainKey(): ChainKey {
  const env = process.env.NEXT_PUBLIC_CHAIN;
  if (env === "base" || env === "base-sepolia") return env;
  return "base-sepolia";
}

export function getChain() {
  return CHAIN_CONFIG[getChainKey()];
}

export const MOVE_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
export const NONCE_TTL_SECONDS = 5 * 60; // 5 minutes
