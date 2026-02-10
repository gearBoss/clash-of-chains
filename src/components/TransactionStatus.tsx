"use client";

import { clsx } from "clsx";

interface TransactionStatusProps {
  status: "idle" | "pending" | "success" | "error";
  txHash?: string | null;
  error?: string;
  explorerUrl?: string;
}

export function TransactionStatus({
  status,
  txHash,
  error,
  explorerUrl = "https://sepolia.basescan.org",
}: TransactionStatusProps) {
  if (status === "idle") return null;

  return (
    <div
      className={clsx(
        "glass-panel p-3 text-sm animate-slide-up",
        status === "pending" && "border-yellow-500/30",
        status === "success" && "border-green-500/30",
        status === "error" && "border-red-500/30"
      )}
    >
      <div className="flex items-center gap-2">
        {status === "pending" && (
          <>
            <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-yellow-400">Transaction pending...</span>
          </>
        )}
        {status === "success" && (
          <>
            <span className="text-green-400">✓</span>
            <span className="text-green-400">Transaction confirmed!</span>
          </>
        )}
        {status === "error" && (
          <>
            <span className="text-red-400">✗</span>
            <span className="text-red-400">{error || "Transaction failed"}</span>
          </>
        )}
      </div>
      {txHash && (
        <a
          href={`${explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-400 hover:underline mt-1 block font-mono"
        >
          {txHash.slice(0, 10)}...{txHash.slice(-8)} ↗
        </a>
      )}
    </div>
  );
}
