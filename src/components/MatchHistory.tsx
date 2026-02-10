"use client";

import Link from "next/link";

interface MatchRecord {
  id: string;
  p1Id: string;
  p2Id: string | null;
  winnerId: string | null;
  ratingDeltaP1: number | null;
  ratingDeltaP2: number | null;
  status: string;
  txHash: string | null;
  turnNumber: number;
  createdAt: string;
}

interface MatchHistoryProps {
  matches: MatchRecord[];
  address: string;
}

export function MatchHistory({ matches, address }: MatchHistoryProps) {
  const addr = address.toLowerCase();

  return (
    <div className="space-y-2">
      {matches.map((m) => {
        const isP1 = m.p1Id === addr;
        const won = m.winnerId === addr;
        const delta = isP1 ? m.ratingDeltaP1 : m.ratingDeltaP2;
        const opponent = isP1 ? m.p2Id : m.p1Id;

        return (
          <Link
            key={m.id}
            href={`/match/${m.id}`}
            className="glass-panel p-3 flex items-center justify-between hover:bg-white/5 transition-colors block"
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold ${
                    won ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {won ? "W" : "L"}
                </span>
                <span className="font-mono text-xs text-gray-400">
                  vs {opponent?.slice(0, 6)}...{opponent?.slice(-4)}
                </span>
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                {m.turnNumber} turns • {m.status}
                {m.txHash && " • anchored"}
              </div>
            </div>
            <div className="text-right">
              {delta !== null && (
                <span
                  className={`text-sm font-bold ${
                    delta >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              )}
            </div>
          </Link>
        );
      })}
      {matches.length === 0 && (
        <div className="text-center text-gray-600 text-sm py-6">
          No matches yet
        </div>
      )}
    </div>
  );
}
