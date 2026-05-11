"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSolanaWallet } from "@/components/wallet/wallet-provider";
import { BN } from "@coral-xyz/anchor";
import {
  X,
  Loader2,
  Trophy,
  Calendar,
  Wallet,
  Swords,
  Gamepad2,
  CheckCircle2,
  Search,
  ChevronRight,
} from "lucide-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { format, addDays } from "date-fns";
import {
  buildCreateMarketInstructionData,
  findConfigPda,
  findEscrowPda,
  findMarketPda,
  getConnection,
  PROGRAM_ID,
} from "@/lib/solana";

function toBnSafe(value: any, field: string): BN {
  if (BN.isBN(value)) return value;
  if (typeof value === "bigint") return new BN(value.toString());
  if (typeof value === "number") return new BN(value);
  if (typeof value === "string") return new BN(value);
  throw new Error(`Invalid ${field} value from program account`);
}

function assertDefined<T>(value: T | null | undefined, label: string): T {
  if (value === undefined || value === null) {
    throw new Error(`Missing required value: ${label}`);
  }
  return value as T;
}

interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
}

interface SteamGame {
  appid: number;
  name: string;
  img_icon_url?: string;
  playtime_forever: number;
}

interface Achievement {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  achieved: number;
}

interface AchievementResponseMeta {
  source: string;
  schemaCount: number;
  playerCount: number;
  appId: number;
}

interface Props {
  streamer: SteamProfile;
  preselectedGame: SteamGame | null;
  onClose: () => void;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const MARKET_ACCOUNT_SPACE = 8 + 597;

export function ChallengeModal({ streamer, preselectedGame, onClose }: Props) {
  const { publicKey, connected, signTransaction, signAllTransactions } = useSolanaWallet();
  const [step, setStep] = useState<"game" | "achievement" | "details">(
    preselectedGame ? "achievement" : "game"
  );
  const [selectedGame, setSelectedGame] = useState<SteamGame | null>(preselectedGame);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [meta, setMeta] = useState<AchievementResponseMeta | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [rewardAmount, setRewardAmount] = useState("1");
  const [streamerWallet, setStreamerWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [games, setGames] = useState<SteamGame[]>([]);
  const [gameSearch, setGameSearch] = useState("");
  const [manualAppId, setManualAppId] = useState("");
  const [gamesLoading, setGamesLoading] = useState(false);

  useEffect(() => {
    if (preselectedGame) {
      loadAchievements(preselectedGame);
      return;
    }
    setGamesLoading(true);
    fetch(`/api/steam/profile/${streamer.steamid}`)
      .then((r) => r.json())
      .then((d) => {
        setGames(d.games || []);
      })
      .finally(() => setGamesLoading(false));
  }, [streamer.steamid, preselectedGame]);

  async function loadAchievements(game: SteamGame) {
    setSelectedGame(game);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/steam/achievements?steamId=${streamer.steamid}&appId=${game.appid}`
      );
      const data = await res.json();
      setMeta({
        source: data.source || "unknown",
        schemaCount: Number(data.schemaCount || 0),
        playerCount: Number(data.playerCount || 0),
        appId: Number(data.appId || game.appid),
      });
      const available = (data.achievements || []).filter(
        (a: Achievement) => Number(a.achieved) === 0
      );
      setAchievements(available);
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
    if (!selectedGame || !selectedAchievement) {
      setError("Select a game and achievement");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const deadline = Math.floor(addDays(new Date(), deadlineDays).getTime() / 1000);
      const deadlineBn = toBnSafe(deadline, "deadline");
      const connection = getConnection();
      const userPk = new PublicKey(assertDefined(publicKey, "wallet public key"));

      const [configPda] = findConfigPda();
      const configAccountInfo = await connection.getAccountInfo(configPda, "confirmed");
      if (!configAccountInfo) {
        throw new Error("Config account not found. Initialize platform first.");
      }
      // Config layout: disc(8) + admin(32) + platform_fee_wallet(32) + market_counter(8) + bump(1)
      const marketCounter = new BN(configAccountInfo.data.subarray(72, 80), "le");
      const [marketPda] = findMarketPda(userPk, marketCounter);
      const [escrowPda] = findEscrowPda(marketPda);

      let streamerRecipient = userPk;
      if (streamerWallet) {
        try {
          streamerRecipient = new PublicKey(streamerWallet);
        } catch {
          throw new Error("Invalid streamer wallet address");
        }
      }

      const ixData = buildCreateMarketInstructionData(
        streamer.steamid,
        selectedAchievement.name.slice(0, 64),
        selectedAchievement.displayName.slice(0, 128),
        (selectedAchievement.description || "").slice(0, 256),
        deadlineBn,
        streamerRecipient
      );

      const ix = new TransactionInstruction({
        keys: [
          { pubkey: userPk, isSigner: true, isWritable: true },
          { pubkey: configPda, isSigner: false, isWritable: true },
          { pubkey: marketPda, isSigner: false, isWritable: true },
          { pubkey: escrowPda, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: ixData,
      });

      const tx = new Transaction().add(ix);
      tx.feePayer = userPk;
      const bh = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = bh.blockhash;

      const [balance, marketRent, estimatedFee] = await Promise.all([
        connection.getBalance(userPk, "confirmed"),
        connection.getMinimumBalanceForRentExemption(MARKET_ACCOUNT_SPACE, "confirmed"),
        tx.getEstimatedFee(connection),
      ]);
      const requiredLamports = marketRent + (estimatedFee ?? 5000);
      if (balance < requiredLamports) {
        throw new Error(
          `Challenge transaction failed: wallet needs at least ${(requiredLamports / LAMPORTS_PER_SOL).toFixed(4)} devnet SOL for rent and fees. Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL.`
        );
      }

      const simulation = await connection.simulateTransaction(tx);
      if (simulation.value.err) {
        const logs = simulation.value.logs?.slice(-4).join(" | ");
        throw new Error(`Challenge transaction simulation failed: ${logs || JSON.stringify(simulation.value.err)}`);
      }

      const signed = await signTransaction(tx);
      const txSig = await connection.sendRawTransaction(signed.serialize(), {
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction({ signature: txSig, ...bh }, "confirmed");

      const txDetails = await connection.getParsedTransaction(txSig, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
      if (txDetails?.meta?.err) {
        throw new Error(
          `Transaction landed but failed on-chain: ${JSON.stringify(txDetails.meta.err)}`
        );
      }

      const res = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketAddress: marketPda.toBase58(),
          streamerSteamId: streamer.steamid,
          streamerName: streamer.personaname,
          streamerAvatarUrl: streamer.avatarfull || null,
          gameName: selectedGame?.name || null,
          gameAppId: selectedGame?.appid || null,
          achievementId: selectedAchievement.name.slice(0, 64),
          achievementName: selectedAchievement.displayName,
          achievementDescription: selectedAchievement.description,
          deadline,
          totalYesSol: 0,
          totalNoSol: 0,
          rewardAmount: Number(rewardAmount) || 0,
          streamerWallet: streamerWallet || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create market");
      }

      setSuccess(`Challenge issued! "${selectedAchievement.displayName}" — ${deadlineDays} days`);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      setError(e?.message || "Failed to create challenge");
    } finally {
      setLoading(false);
    }
  }

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(gameSearch.toLowerCase())
  );

  const steps = ["game", "achievement", "details"] as const;
  const stepIndex = steps.indexOf(step);

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-8 backdrop-blur-md sm:items-center sm:pt-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/50 px-6 py-4">
            <div className="flex items-center gap-3">
              {streamer.avatarfull && (
                <img src={streamer.avatarfull} alt="" className="h-8 w-8 rounded-lg" />
              )}
              <div>
                <h2 className="font-display text-lg font-bold tracking-wide">Issue Challenge</h2>
                <p className="font-mono text-[10px] text-[var(--text-tertiary)]">
                  to {streamer.personaname}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="border-b border-[var(--border)] px-6 py-3">
            <div className="flex items-center gap-2">
              {steps.map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                      step === s
                        ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                        : stepIndex > i
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
                    }`}
                  >
                    {stepIndex > i ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`hidden text-xs font-medium capitalize sm:inline ${
                      step === s ? "text-[var(--text)]" : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {s}
                  </span>
                  {i < arr.length - 1 && (
                    <div
                      className={`h-px w-5 ${
                        stepIndex > i ? "bg-[var(--accent)]/40" : "bg-[var(--border)]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[55vh] overflow-y-auto p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400"
              >
                {success}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === "game" && (
                <motion.div
                  key="game"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      value={gameSearch}
                      onChange={(e) => setGameSearch(e.target.value)}
                      placeholder="Search games..."
                      className="input-arena w-full pl-9"
                    />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={manualAppId}
                      onChange={(e) => setManualAppId(e.target.value)}
                      placeholder="Enter appid manually (e.g. 2050650)"
                      className="input-arena w-full"
                    />
                    <button
                      className="btn-ghost"
                      onClick={() => {
                        const appid = Number(manualAppId);
                        if (!appid) return;
                        loadAchievements({
                          appid,
                          name: `App ${appid}`,
                          playtime_forever: 0,
                          img_icon_url: "",
                        });
                      }}
                    >
                      Use AppID
                    </button>
                  </div>

                  {gamesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
                    </div>
                  ) : filteredGames.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
                      <Gamepad2 className="mx-auto mb-3 h-10 w-10 text-[var(--text-dim)]" />
                      <p className="text-sm text-[var(--text-secondary)]">
                        No games found. Steam profile may be private.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {filteredGames.slice(0, 20).map((game) => (
                        <button
                          key={game.appid}
                          onClick={() => loadAchievements(game)}
                          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-left transition hover:border-[var(--accent)]/30 hover:bg-[var(--bg-elevated)]"
                        >
                          {game.img_icon_url ? (
                            <img
                              src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-elevated)]">
                              <Gamepad2 className="h-4 w-4 text-[var(--text-dim)]" />
                            </div>
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">{game.name}</p>
                            <p className="font-mono text-[10px] text-[var(--text-tertiary)]">
                              appid {game.appid} • {Math.floor(game.playtime_forever / 60)}h played
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[var(--text-dim)]" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === "achievement" && (
                <motion.div
                  key="achievement"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg bg-[var(--bg)] border border-[var(--border)] p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedGame?.img_icon_url ? (
                          <img
                            src={`https://media.steampowered.com/steamcommunity/public/images/apps/${selectedGame.appid}/${selectedGame.img_icon_url}.jpg`}
                            alt=""
                            className="h-5 w-5 rounded"
                          />
                        ) : (
                          <Gamepad2 className="h-4 w-4 text-[var(--text-tertiary)]" />
                        )}
                        <span className="text-sm font-medium">{selectedGame?.name}</span>
                      </div>
                      <button
                        onClick={() => setStep("game")}
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    {meta && (
                      <p className="mt-2 font-mono text-[10px] text-[var(--text-tertiary)]">
                        appid {meta.appId} | source {meta.source} | schema {meta.schemaCount} | player {meta.playerCount}
                      </p>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
                    </div>
                  ) : achievements.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
                      <Trophy className="mx-auto mb-3 h-10 w-10 text-[var(--text-dim)]" />
                      <p className="text-sm text-[var(--text-secondary)]">
                        No locked achievements found for this game/user.
                      </p>
                      {meta && (
                        <p className="mt-2 font-mono text-[10px] text-[var(--text-tertiary)]">
                          appid {meta.appId} | source {meta.source} | schema {meta.schemaCount} | player {meta.playerCount}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {achievements.map((ach) => (
                        <button
                          key={ach.name}
                          onClick={() => {
                            setSelectedAchievement(ach);
                            setStep("details");
                          }}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                            selectedAchievement?.name === ach.name
                              ? "border-[var(--accent)] bg-[var(--accent-dim)]"
                              : "border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
                          }`}
                        >
                          {ach.icon ? (
                            <img src={ach.icon} alt="" className="mt-0.5 h-10 w-10 rounded" />
                          ) : (
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded bg-[var(--bg-elevated)]">
                              <Trophy className="h-5 w-5 text-[var(--text-tertiary)]" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{ach.displayName}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{ach.description}</p>
                            <p className="mt-0.5 font-mono text-[9px] text-[var(--text-dim)]">
                              Steam ID: {ach.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Summary */}
                  <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-4">
                    <div className="flex items-start gap-3">
                      {selectedAchievement?.icon ? (
                        <img src={selectedAchievement.icon} alt="" className="h-12 w-12 rounded-lg" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-dim)] border border-[var(--accent)]/20">
                          <Trophy className="h-6 w-6 text-[var(--accent)]" />
                        </div>
                      )}
                  <div className="flex-1">
                    <p className="font-semibold">{selectedAchievement?.displayName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{selectedAchievement?.description}</p>
                    <p className="mt-1 font-mono text-[10px] text-[var(--text-dim)]">
                      Steam achievement ID: <span className="text-[var(--accent)]">{selectedAchievement?.name}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                      <Gamepad2 className="h-3 w-3" />
                      {selectedGame?.name}
                    </div>
                  </div>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                      <Calendar className="h-3.5 w-3.5" />
                      Challenge Deadline
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={1}
                        max={30}
                        value={deadlineDays}
                        onChange={(e) => setDeadlineDays(parseInt(e.target.value))}
                        className="flex-1 accent-[var(--accent)]"
                      />
                      <span className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-center font-mono text-sm font-bold">
                        {deadlineDays}d
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-[var(--text-tertiary)]">
                      Resolves {format(addDays(new Date(), deadlineDays), "MMMM d, yyyy")}
                    </p>
                  </div>

                  {/* Wallet */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                      <Wallet className="h-3.5 w-3.5" />
                      Streamer SOL Wallet
                    </label>
                    <input
                      type="text"
                      value={streamerWallet}
                      onChange={(e) => setStreamerWallet(e.target.value)}
                      placeholder="Enter Solana address..."
                      className="input-arena w-full"
                    />
                    <p className="mt-1 font-mono text-[10px] text-[var(--text-tertiary)]">
                      Optional here. If not set, streamer can set wallet later in Profile and claim reward.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                      Reward Amount (SOL)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      className="input-arena w-full"
                    />
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="btn-primary w-full py-3"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Swords className="h-4 w-4" />
                    )}
                    Issue Challenge
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
