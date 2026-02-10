"use client";

import { useAccount } from "wagmi";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardTable } from "@/components/LeaderboardTable";

export default function LeaderboardPage() {
  const { address } = useAccount();
  const { data, isLoading } = useLeaderboard();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Leaderboard</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <LeaderboardTable
          players={data?.players ?? []}
          recentAnchored={data?.recentAnchored ?? []}
          currentAddress={address}
        />
      )}
    </div>
  );
}
