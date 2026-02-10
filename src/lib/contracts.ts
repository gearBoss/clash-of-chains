export const CHAIN_CLASH_ARENA_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_signer", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "recordResult",
    inputs: [
      { name: "matchId", type: "bytes32" },
      { name: "p1", type: "address" },
      { name: "p2", type: "address" },
      { name: "winner", type: "address" },
      { name: "ratingDeltaP1", type: "int32" },
      { name: "ratingDeltaP2", type: "int32" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "matchRecorded",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalMatchesRecorded",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "authorizedSigner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDomainSeparator",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "MatchRecorded",
    inputs: [
      { name: "matchId", type: "bytes32", indexed: true },
      { name: "p1", type: "address", indexed: true },
      { name: "p2", type: "address", indexed: true },
      { name: "winner", type: "address", indexed: false },
      { name: "ratingDeltaP1", type: "int32", indexed: false },
      { name: "ratingDeltaP2", type: "int32", indexed: false },
    ],
  },
] as const;

export function getContractAddress(): `0x${string}` {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!addr || !addr.startsWith("0x")) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS not set");
  }
  return addr as `0x${string}`;
}
