"use client";

import Link from "next/link";

interface MatchListItem {
  id: string;
  p1Id: string;
  p2Id: string | null;
  status: string;
  winnerId: string | null;
  turnNumber: number;
  createdAt: string;
}

interface LobbyListProps {
  matches: MatchListItem[];
  currentAddress?: string;
  onJoin: (matchId: string) => void;
  isJoining: boolean;
}

export function LobbyList({
  matches,
  currentAddress,
  onJoin,
  isJoining,
}: LobbyListProps) {
  const addr = currentAddress?.toLowerCase();

  const openMatches = matches.filter(
    (m) => m.status === "WAITING" && m.p1Id !== addr
  );
  const myMatches = matches.filter(
    (m) => m.p1Id === addr || m.p2Id === addr
  );

  return (
    <div className="space-y-6">
      {/* Open Challenges */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">
          Open Challenges ({openMatches.length})
        </h3>
        {openMatches.length === 0 ? (
          <div className="glass-panel p-6 text-center text-gray-600 text-sm">
            No open challenges. Create one!
          </div>
        ) : (
          <div className="space-y-2">
            {openMatches.map((m) => (
              <div
                key={m.id}
                className="glass-panel p-3 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-xs text-gray-300">
                    {m.p1Id.slice(0, 8)}...{m.p1Id.slice(-4)}
                  </span>
                  <span className="text-xs text-gray-600 ml-2">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => onJoin(m.id)}
                  disabled={isJoining || !addr}
                  className="btn-primary text-xs py-1"
                >
                  {isJoining ? "Joining..." : "Accept"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Matches */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">
          My Matches ({myMatches.length})
        </h3>
        {myMatches.length === 0 ? (
          <div className="glass-panel p-6 text-center text-gray-600 text-sm">
            No matches yet.
          </div>
        ) : (
          <div className="space-y-2">
            {myMatches.map((m) => {
              const isMyTurnNext =
                m.status === "ACTIVE" &&
                ((m.p1Id === addr && m.turnNumber % 2 === 1) ||
                  (m.p2Id === addr && m.turnNumber % 2 === 0));

              return (
                <Link
                  key={m.id}
                  href={`/match/${m.id}`}
                  className="glass-panel p-3 flex items-center justify-between hover:bg-white/5 transition-colors block"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          m.status === "WAITING"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : m.status === "ACTIVE"
                            ? "bg-green-600/20 text-green-400"
                            : m.status === "COMPLETED" ||
                              m.status === "ANCHORED"
                            ? "bg-gray-600/20 text-gray-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {m.status}
                      </span>
                      {isMyTurnNext && (
                        <span className="text-[10px] bg-primary-600/30 text-primary-300 px-2 py-0.5 rounded-full">
                          Your turn
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-gray-400 mt-1">
                      vs{" "}
                      {m.p1Id === addr
                        ? m.p2Id
                          ? `${m.p2Id.slice(0, 6)}...`
                          : "waiting..."
                        : `${m.p1Id.slice(0, 6)}...`}
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs">
                    Turn {m.turnNumber}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
