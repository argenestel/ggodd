"use client";

import { useSolanaWallet } from "./wallet-provider";
import { Wallet, LogOut, Loader2 } from "lucide-react";

export function WalletButton() {
  const { publicKey, connected, connecting, connect, disconnect } = useSolanaWallet();

  if (connecting) {
    return (
      <button className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] opacity-70">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  if (connected && publicKey) {
    const short = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
    return (
      <button
        onClick={disconnect}
        className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]"
      >
        <LogOut className="h-4 w-4" />
        {short}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] transition hover:brightness-110"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </button>
  );
}
