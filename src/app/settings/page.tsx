"use client";

import { useAccount, useChainId } from "wagmi";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isAuthenticated, sessionAddress, signOut } = useAuth();

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="glass-panel p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-500">Connection Status</label>
          <div className="mt-1 text-sm">
            {isConnected ? (
              <span className="text-green-400">Connected</span>
            ) : (
              <span className="text-red-400">Not connected</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Wallet Address</label>
          <div className="mt-1 text-sm font-mono text-gray-300 break-all">
            {address ?? "—"}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Chain ID</label>
          <div className="mt-1 text-sm text-gray-300">{chainId ?? "—"}</div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Session</label>
          <div className="mt-1 text-sm">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-green-400">Authenticated</span>
                <span className="text-gray-600 font-mono text-xs">
                  ({sessionAddress?.slice(0, 8)}...)
                </span>
              </div>
            ) : (
              <span className="text-gray-500">Not signed in</span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Network</label>
          <div className="mt-1 text-sm text-gray-300">
            {process.env.NEXT_PUBLIC_CHAIN === "base"
              ? "Base Mainnet"
              : "Base Sepolia (testnet)"}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Contract</label>
          <div className="mt-1 text-xs font-mono text-gray-500 break-all">
            {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "Not configured"}
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <button onClick={signOut} className="btn-danger text-sm">
          Sign Out
        </button>
      )}
    </div>
  );
}
