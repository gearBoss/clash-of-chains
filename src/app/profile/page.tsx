"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { MatchHistory } from "@/components/MatchHistory";

export default function ProfilePage() {
  const { isAuthenticated, sessionAddress } = useAuth();
  const { data, isLoading } = useProfile();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-gray-500">
        Connect wallet and sign in to view your profile.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!data) return null;

  const winRate =
    data.wins + data.losses > 0
      ? ((data.wins / (data.wins + data.losses)) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Profile</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-primary-400">
            {data.rating}
          </div>
          <div className="text-xs text-gray-500 mt-1">Rating</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{data.wins}</div>
          <div className="text-xs text-gray-500 mt-1">Wins</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{data.losses}</div>
          <div className="text-xs text-gray-500 mt-1">Losses</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-bold text-gray-300">{winRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Win Rate</div>
        </div>
      </div>

      {/* Address */}
      <div className="glass-panel p-3 text-xs">
        <span className="text-gray-500">Address: </span>
        <span className="font-mono text-gray-300">{data.address}</span>
      </div>

      {/* Match history */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 mb-3">
          Recent Matches
        </h2>
        <MatchHistory
          matches={data.recentMatches ?? []}
          address={data.address}
        />
      </div>
    </div>
  );
}
