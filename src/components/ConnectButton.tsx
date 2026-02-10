"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useAuth } from "@/hooks/useAuth";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, signIn, signOut, isLoading } = useAuth();

  if (!isConnected) {
    return (
      <button
        className="btn-primary text-sm"
        onClick={() => {
          const connector = connectors[0];
          if (connector) connect({ connector });
        }}
      >
        Connect
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 hidden sm:inline">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          className="btn-primary text-sm"
          onClick={signIn}
          disabled={isLoading}
        >
          {isLoading ? "Signing..." : "Sign In"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-primary-400 font-mono">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
      <button
        className="btn-secondary text-xs py-1 px-2"
        onClick={() => {
          signOut();
          disconnect();
        }}
      >
        Out
      </button>
    </div>
  );
}
