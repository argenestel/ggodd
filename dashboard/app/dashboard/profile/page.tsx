"use client";

import { useEffect, useState } from "react";
import { Wallet, Trophy, BarChart3, Coins } from "lucide-react";
import { useSolanaWallet } from "@/components/wallet/wallet-provider";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export default function ProfilePage() {
  const { connected, publicKey, signTransaction } = useSolanaWallet();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [binding, setBinding] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [p, s, r] = await Promise.all([
      fetch("/api/profile/me").then((x) => x.json()),
      fetch("/api/profile/stats").then((x) => x.json()),
      fetch("/api/rewards/pending").then((x) => x.json()),
    ]);
    const b = await fetch("/api/profile/binding").then((x) => x.json()).catch(() => ({ binding: null }));
    setProfile(p.profile);
    setWalletAddress(p.profile?.wallet_address || "");
    setStats(s.stats);
    setRewards(r.rewards || []);
    setBinding(b.binding || null);
  }

  async function saveWallet() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error || "Failed to save wallet");
      return;
    }
    setMessage("Wallet updated.");
    await load();
  }

  async function claimRewards() {
    const res = await fetch("/api/rewards/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: publicKey || "" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to claim rewards");
      return;
    }
    setMessage(`Claimed ${data.total.toFixed(2)} SOL across ${data.count} rewards.`);
    await load();
  }

  const pendingTotal = rewards
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount_sol, 0);

  async function linkSteamWallet() {
    if (!connected || !publicKey) {
      setMessage("Connect wallet first.");
      return;
    }

    let txSignature = "";
    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
        "confirmed"
      );
      const payer = new PublicKey(publicKey);

      const ix = SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: payer,
        lamports: 0,
      });
      const tx = new Transaction().add(ix);
      tx.feePayer = payer;
      const bh = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = bh.blockhash;
      const signed = await signTransaction(tx);
      txSignature = await connection.sendRawTransaction(signed.serialize(), {
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction({ signature: txSignature, ...bh }, "confirmed");
    } catch (e: any) {
      setMessage(e.message || "Failed to create wallet proof transaction");
      return;
    }

    const res = await fetch("/api/profile/binding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: publicKey, txSignature }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to link Steam and wallet");
      return;
    }
    setMessage("Steam and wallet linked.");
    await load();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="font-display text-3xl">Streamer Profile</h1>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 space-y-2">
        <h2 className="font-display text-xl">Identity Link</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Connect wallet first, sign in with Steam, then link both identities for reward claims.
        </p>
        <p className="font-mono text-xs text-[var(--text-tertiary)]">
          Connected wallet: {publicKey || "not connected"}
        </p>
        <p className="font-mono text-xs text-[var(--text-tertiary)]">
          Bound wallet: {binding?.wallet_address || "not linked"}
        </p>
        <button className="btn-primary" onClick={linkSteamWallet} disabled={!connected || !publicKey}>
          Link Steam + Wallet
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Markets" value={stats?.totalMarkets ?? 0} icon={<BarChart3 className="h-4 w-4" />} />
        <Stat label="Total Volume" value={`${(stats?.totalVolume ?? 0).toFixed?.(2) || "0.00"} SOL`} icon={<Coins className="h-4 w-4" />} />
        <Stat label="Pending Rewards" value={`${(stats?.pendingRewards ?? 0).toFixed?.(2) || "0.00"} SOL`} icon={<Trophy className="h-4 w-4" />} />
        <Stat label="Claimed Rewards" value={`${(stats?.claimedRewards ?? 0).toFixed?.(2) || "0.00"} SOL`} icon={<Trophy className="h-4 w-4" />} />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-3">
        <h2 className="font-display text-xl">Wallet</h2>
        <p className="text-sm text-[var(--text-secondary)]">Set your Solana wallet to receive challenge rewards.</p>
        <div className="flex gap-2">
          <input
            className="input-arena w-full"
            placeholder="Enter wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
          <button className="btn-primary" disabled={saving} onClick={saveWallet}>
            <Wallet className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={claimRewards} disabled={pendingTotal <= 0 || !publicKey}>
            Claim Pending ({pendingTotal.toFixed(2)} SOL)
          </button>
          {message && <p className="text-xs text-[var(--text-secondary)]">{message}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
        <h2 className="font-display text-xl mb-3">Reward History</h2>
        <div className="space-y-2">
          {rewards.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No rewards yet.</p>
          ) : (
            rewards.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                <div>
                  <p className="font-mono text-xs">{r.market_address}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{r.status.toUpperCase()}</p>
                </div>
                <p className="font-mono text-sm">{r.amount_sol.toFixed(2)} SOL</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="mb-1 flex items-center gap-2 text-[var(--text-secondary)]">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}
