"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionAddress, setSessionAddress] = useState<string | null>(null);

  // Check session on mount and when account changes
  useEffect(() => {
    checkSession();
  }, [address]);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.authenticated && data.address === address?.toLowerCase()) {
        setIsAuthenticated(true);
        setSessionAddress(data.address);
      } else {
        setIsAuthenticated(false);
        setSessionAddress(null);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, [address]);

  const signIn = useCallback(async () => {
    if (!isConnected || !address) return;

    setIsLoading(true);
    try {
      // Get nonce
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // Sign message
      const message = `Sign in to ChainClash\n\nNonce: ${nonce}`;
      const signature = await signMessageAsync({ message });

      // Verify
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          message,
          signature,
          nonce,
        }),
      });

      const result = await verifyRes.json();
      if (result.ok) {
        setIsAuthenticated(true);
        setSessionAddress(result.address);
      }
    } catch (err) {
      console.error("Sign in failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setSessionAddress(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    sessionAddress,
    signIn,
    signOut,
    checkSession,
  };
}
