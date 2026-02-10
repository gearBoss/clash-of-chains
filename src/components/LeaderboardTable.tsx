"use client";

interface LeaderboardEntry {
  id: string;
  rating: number;
  wins: number;
  losses: number;
}

interface AnchoredMatch {
  id: string;
  matchHash: string;
  p1Id: string;
  p2Id: string | null;
  winnerId: string | null;
  ratingDeltaP1: number | null;
  ratingDeltaP2: number | null;
  txHash: string | null;
  updatedAt: string;
}

interface LeaderboardTableProps {
  players: LeaderboardEntry[];
  recentAnchored: AnchoredMatch[];
  currentAddress?: string;
}

export function LeaderboardTable({
  players,
  recentAnchored,
  currentAddress,
}: LeaderboardTableProps) {
  const addr = currentAddress?.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Rankings */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-xs">
              <th className="text-left py-2 px-3">#</th>
              <th className="text-left py-2 px-3">Player</th>
              <th className="text-right py-2 px-3">Rating</th>
              <th className="text-right py-2 px-3">W/L</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr
                key={p.id}
                className={`border-b border-white/5 ${
                  p.id === addr ? "bg-primary-600/10" : ""
                }`}
              >
                <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                <td className="py-2 px-3 font-mono text-xs">
                  {p.id.slice(0, 6)}...{p.id.slice(-4)}
                  {p.id === addr && (
                    <span className="ml-1 text-primary-400">(you)</span>
                  )}
                </td>
                <td className="py-2 px-3 text-right font-bold text-white">
                  {p.rating}
                </td>
                <td className="py-2 px-3 text-right text-gray-400">
                  <span className="text-green-400">{p.wins}</span>/
                  <span className="text-red-400">{p.losses}</span>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-600">
                  No players yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Anchored Matches */}
      {recentAnchored.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">
            Recent Anchored Matches
          </h3>
          <div className="space-y-2">
            {recentAnchored.map((m) => (
              <div key={m.id} className="glass-panel p-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-gray-400">
                    {m.p1Id.slice(0, 6)}... vs {m.p2Id?.slice(0, 6)}...
                  </div>
                  {m.txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${m.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:underline"
                    >
                      tx ↗
                    </a>
                  )}
                </div>
                <div className="mt-1 text-gray-500">
                  Winner: {m.winnerId?.slice(0, 8)}... | Delta: P1{" "}
                  <span
                    className={
                      (m.ratingDeltaP1 ?? 0) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {(m.ratingDeltaP1 ?? 0) > 0 ? "+" : ""}
                    {m.ratingDeltaP1}
                  </span>{" "}
                  P2{" "}
                  <span
                    className={
                      (m.ratingDeltaP2 ?? 0) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {(m.ratingDeltaP2 ?? 0) > 0 ? "+" : ""}
                    {m.ratingDeltaP2}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
