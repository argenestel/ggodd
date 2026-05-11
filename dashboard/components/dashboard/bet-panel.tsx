"use client";

import { useState } from "react";
import { useSolanaWallet } from "@/components/wallet/wallet-provider";
import { Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { buildPlaceBetInstructionData, findBetPda, findEscrowPda, getConnection, PROGRAM_ID, solToLamports } from "@/lib/solana";

interface Props {
  marketAddress: string;
  onBetPlaced: () => void;
}

export function BetPanel({ marketAddress, onBetPlaced }: Props) {
  const { publicKey, connected, signTransaction, signAllTransactions } = useSolanaWallet();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleBet() {
    if (!connected || !publicKey) {
      setError("Connect your wallet first");
      return;
    }
    const solAmount = parseFloat(amount);
    if (!amount || isNaN(solAmount) || solAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const connection = getConnection();
      const userPk = new PublicKey(publicKey);
      const marketPk = new PublicKey(marketAddress);
      const [escrowPda] = findEscrowPda(marketPk);
      const [betPda] = findBetPda(marketPk, userPk);

      const amountLamports = new BN(solToLamports(solAmount));
      const ixData = buildPlaceBetInstructionData(side, amountLamports);

      const ix = new TransactionInstruction({
        keys: [
          { pubkey: userPk, isSigner: true, isWritable: true },
          { pubkey: marketPk, isSigner: false, isWritable: true },
          { pubkey: escrowPda, isSigner: false, isWritable: true },
          { pubkey: betPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: ixData,
      });

      const tx = new Transaction().add(ix);
      tx.feePayer = userPk;
      const bh = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = bh.blockhash;
      const signed = await signTransaction(tx);
      const txSignature = await connection.sendRawTransaction(signed.serialize(), {
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction({ signature: txSignature, ...bh }, "confirmed");

      const txDetails = await connection.getParsedTransaction(txSignature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (txDetails?.meta?.err) {
        throw new Error(
          `Transaction landed but failed on-chain: ${JSON.stringify(txDetails.meta.err)}`
        );
      }

      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketAddress,
          side,
          amountSol: solAmount,
          txSignature,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to place bet");
      }

      setSuccess(`Bet placed: ${solAmount} SOL on ${side.toUpperCase()}`);
      setAmount("");
      onBetPlaced();
    } catch (e: any) {
      setError(e.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="mb-4 text-lg font-semibold">Place Bet</h2>

      {error && (
        <div className="mb-4 rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {success}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setSide("yes")}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
            side === "yes"
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] hover:border-emerald-500/50"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          YES
        </button>
        <button
          onClick={() => setSide("no")}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
            side === "no"
              ? "border-rose-500 bg-rose-500/10 text-rose-400"
              : "border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] hover:border-rose-500/50"
          }`}
        >
          <TrendingDown className="h-4 w-4" />
          NO
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-[var(--fg-muted)]">
          Amount (SOL)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--fg-muted)]">
            SOL
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--fg-muted)]">
          3% fee: 1.5% to platform, 1.5% to streamer
        </p>
      </div>

      <button
        onClick={handleBet}
        disabled={loading || !connected}
        className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition ${
          side === "yes"
            ? "bg-emerald-600 text-white hover:bg-emerald-500"
            : "bg-rose-600 text-white hover:bg-rose-500"
        } disabled:opacity-50`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : !connected ? (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet to Bet
          </>
        ) : (
          <>
            Bet {side.toUpperCase()} {amount ? `${amount} SOL` : ""}
          </>
        )}
      </button>
    </div>
  );
}
