"use client";

import { useState } from "react";
import { StreamerSearch } from "./streamer-search";
import { useSolanaWallet } from "@/components/wallet/wallet-provider";
import { X, Loader2, Trophy, Calendar, Wallet } from "lucide-react";
import { format, addDays } from "date-fns";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateMarketModal({ onClose, onCreated }: Props) {
  const { publicKey, connected } = useSolanaWallet();
  const [step, setStep] = useState<"streamer" | "achievement" | "details">("streamer");
  const [selectedStreamer, setSelectedStreamer] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [streamerWallet, setStreamerWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSelectStreamer(streamer: any) {
    setSelectedStreamer(streamer);
    setLoading(true);
    try {
      const res = await fetch(`/api/steam/achievements?steamId=${streamer.steamid}&appId=730`);
      const data = await res.json();
      setAchievements(data.achievements || []);
      setStep("achievement");
    } catch (e) {
      setError("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!connected || !publicKey) {
      setError("Connect your wallet first");
      return;
    }
    if (!selectedStreamer || !selectedAchievement) {
      setError("Select a streamer and achievement");
      return;
    }
    if (!streamerWallet) {
      setError("Enter streamer's Solana wallet address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const deadline = Math.floor(addDays(new Date(), deadlineDays).getTime() / 1000);

      // For MVP, we mock the on-chain creation since the program isn't deployed yet.
      // In production, this would call the Anchor program createMarket instruction.
      const mockMarketAddress = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const res = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketAddress: mockMarketAddress,
          streamerSteamId: selectedStreamer.steamid,
          streamerName: selectedStreamer.personaname,
          achievementId: selectedAchievement.name,
          achievementName: selectedAchievement.displayName,
          achievementDescription: selectedAchievement.description,
          deadline,
          totalYesSol: 0,
          totalNoSol: 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create market");
      }

      onCreated();
    } catch (e: any) {
      setError(e.message || "Failed to create market");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
          <h2 className="text-lg font-semibold">Create Prediction Market</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--fg-muted)] hover:bg-[var(--surface-hover)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Step indicator */}
          <div className="mb-4 flex items-center gap-2">
            {(["streamer", "achievement", "details"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    step === s
                      ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                      : i < ["streamer", "achievement", "details"].indexOf(step)
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-[var(--border)] text-[var(--fg-muted)]"
                  }`}
                >
                  {i < ["streamer", "achievement", "details"].indexOf(step) ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs font-medium capitalize ${
                    step === s ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"
                  }`}
                >
                  {s}
                </span>
                {i < 2 && <div className="h-px w-4 bg-[var(--border)]" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-3 rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
              {error}
            </div>
          )}

          {step === "streamer" && (
            <StreamerSearch
              onSelect={handleSelectStreamer}
            />
          )}

          {step === "achievement" && (
            <div className="space-y-3">
              <div className="rounded-md bg-[var(--bg)] p-3">
                <p className="text-sm font-medium">{selectedStreamer?.personaname}</p>
                <p className="text-xs text-[var(--fg-muted)]">{selectedStreamer?.steamid}</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
                </div>
              ) : achievements.length === 0 ? (
                <div className="rounded-md border border-dashed border-[var(--border)] py-8 text-center">
                  <Trophy className="mx-auto mb-2 h-8 w-8 text-[var(--fg-muted)]" />
                  <p className="text-sm text-[var(--fg-muted)]">
                    No achievements found (or Steam API key not set)
                  </p>
                  <button
                    onClick={() =>
                      setAchievements([
                        {
                          name: "win_100_matches",
                          displayName: "Centurion",
                          description: "Win 100 competitive matches",
                        },
                        {
                          name: "knife_kill",
                          displayName: "Sharpshooter",
                          description: "Get 50 knife kills",
                        },
                        {
                          name: "mvp_50",
                          displayName: "MVP",
                          description: "Earn MVP 50 times",
                        },
                      ])
                    }
                    className="mt-2 text-xs text-[var(--accent)] hover:underline"
                  >
                    Load mock achievements
                  </button>
                </div>
              ) : (
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {achievements.map((ach) => (
                    <button
                      key={ach.name}
                      onClick={() => {
                        setSelectedAchievement(ach);
                        setStep("details");
                      }}
                      className={`w-full rounded-md border p-3 text-left transition ${
                        selectedAchievement?.name === ach.name
                          ? "border-[var(--accent)] bg-[var(--accent)]/5"
                          : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)]/50"
                      }`}
                    >
                      <p className="text-sm font-medium">{ach.displayName}</p>
                      <p className="text-xs text-[var(--fg-muted)]">{ach.description}</p>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep("streamer")}
                className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                ← Back to streamer
              </button>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-4">
              <div className="rounded-md bg-[var(--bg)] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{selectedStreamer?.personaname}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{selectedAchievement?.displayName}</p>
                  </div>
                  <button
                    onClick={() => setStep("achievement")}
                    className="text-xs text-[var(--accent)] hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--fg-muted)]">
                  <Calendar className="h-3 w-3" />
                  Deadline
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(parseInt(e.target.value))}
                    className="flex-1 accent-[var(--accent)]"
                  />
                  <span className="w-32 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm tabular-nums">
                    {deadlineDays} days
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--fg-muted)]">
                  Market resolves on {format(addDays(new Date(), deadlineDays), "MMM d, yyyy")}
                </p>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--fg-muted)]">
                  <Wallet className="h-3 w-3" />
                  Streamer SOL Wallet (for 1.5% fee)
                </label>
                <input
                  type="text"
                  value={streamerWallet}
                  onChange={(e) => setStreamerWallet(e.target.value)}
                  placeholder="Enter Solana address..."
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trophy className="h-4 w-4" />
                )}
                Create Market
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
