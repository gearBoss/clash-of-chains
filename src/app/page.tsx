"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { isConnected } = useAccount();
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4">
        ChainClash
      </h1>
      <p className="text-gray-400 text-lg mb-2">
        Turn-Based Card Battler on Base
      </p>
      <p className="text-gray-600 text-sm max-w-md mb-8">
        Build your deck from 40 unique cards, challenge players asynchronously,
        and anchor your victories onchain.
      </p>

      {!isConnected ? (
        <div className="glass-panel p-6 text-center">
          <p className="text-gray-400 mb-4">Connect your wallet to start</p>
          <p className="text-xs text-gray-600">
            Uses Base Sepolia testnet by default
          </p>
        </div>
      ) : !isAuthenticated ? (
        <div className="glass-panel p-6 text-center">
          <p className="text-gray-400 mb-2">Wallet connected!</p>
          <p className="text-sm text-gray-500">
            Sign in with your wallet to play
          </p>
        </div>
      ) : (
        <div className="grid gap-3 w-full max-w-sm">
          <Link
            href="/lobby"
            className="btn-primary text-center py-3 text-lg block"
          >
            Enter Lobby
          </Link>
          <Link
            href="/deck-builder"
            className="btn-secondary text-center py-3 block"
          >
            Build Deck
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/leaderboard"
              className="glass-panel p-3 text-center hover:bg-white/5 transition-colors block"
            >
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs text-gray-400">Leaderboard</div>
            </Link>
            <Link
              href="/profile"
              className="glass-panel p-3 text-center hover:bg-white/5 transition-colors block"
            >
              <div className="text-2xl mb-1">👤</div>
              <div className="text-xs text-gray-400">Profile</div>
            </Link>
          </div>
        </div>
      )}

      {/* Game features */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 w-full max-w-lg">
        {[
          { icon: "⚔️", label: "40 Cards", desc: "Unique pool" },
          { icon: "🎴", label: "15-Card Deck", desc: "Strategic picks" },
          { icon: "🔗", label: "Onchain", desc: "Anchored results" },
          { icon: "📊", label: "Elo Rating", desc: "Skill-based" },
        ].map((f) => (
          <div
            key={f.label}
            className="glass-panel p-3 text-center"
          >
            <div className="text-xl">{f.icon}</div>
            <div className="text-xs font-semibold text-gray-300 mt-1">
              {f.label}
            </div>
            <div className="text-[10px] text-gray-600">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
