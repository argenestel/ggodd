"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BetPanel } from "@/components/dashboard/bet-panel";
import {
  Loader2,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  Wallet,
  User,
  Gamepad2,
  Zap,
  CircleDollarSign,
  Swords,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { achievementFallbackExplanation, gameHeadline, streamerHeadline } from "@/lib/market-labels";

interface Market {
  id: number;
  market_address: string;
  creator_steam_id: string;
  streamer_steam_id: string;
  streamer_name: string | null;
  streamer_avatar_url?: string | null;
  game_name: string | null;
  game_app_id: number | null;
  achievement_id: string;
  achievement_name: string;
  achievement_description: string | null;
  deadline: number;
  resolved: number;
  outcome: number | null;
  total_yes_sol: number;
  total_no_sol: number;
  created_at: number;
}

interface BetRow {
  betAddress: string;
  user: string;
  market: string;
  amountLamports: number;
  amountSol: number;
  side: "yes" | "no";
  claimed: boolean;
}

export default function MarketDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const [market, setMarket] = useState<Market | null>(null);
  const [bets, setBets] = useState<BetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    fetchMarket();
  }, [address]);

  async function fetchMarket() {
    setLoading(true);
    try {
      const [marketRes, betsRes] = await Promise.all([
        fetch(`/api/markets?address=${address}`),
        fetch(`/api/bets?marketAddress=${address}`),
      ]);
      const data = await marketRes.json();
      const m = data.markets?.find((m: Market) => m.market_address === address);
      setMarket(m || null);

      if (betsRes.ok) {
        const betsData = await betsRes.json();
        setBets(betsData.bets || []);
      } else {
        setBets([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-elevated)]">
          <Swords className="h-8 w-8 text-[var(--text-dim)]" />
        </div>
        <p className="text-[var(--fg-muted)]">Market not found</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] transition hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to markets
        </Link>
      </div>
    );
  }

  const total = (market.total_yes_sol || 0) + (market.total_no_sol || 0);
  const yesPct = total > 0 ? ((market.total_yes_sol || 0) / total) * 100 : 50;
  const noPct = 100 - yesPct;
  const deadlineDate = new Date(market.deadline * 1000);
  const isExpired = Date.now() > market.deadline * 1000;
  const streamerLabel = streamerHeadline(market.streamer_name, market.streamer_steam_id);
  const gameLabel = gameHeadline(market.game_name, market.game_app_id);
  const achievementDetail =
    market.achievement_description?.trim() ||
    achievementFallbackExplanation({
      achievement_name: market.achievement_name,
      achievement_id: market.achievement_id,
      gameLabel,
      streamerLabel,
    });

  const totalYes = market.total_yes_sol || 0;
  const totalNo = market.total_no_sol || 0;
  const yesBetCount = bets.filter((b) => b.side === "yes").length;
  const noBetCount = bets.filter((b) => b.side === "no").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to markets
      </Link>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
        {/* Top accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-[var(--accent)] to-rose-500" />

        {/* Background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 opacity-10">
          <div className="h-full w-full rounded-full bg-[var(--accent)] blur-[80px]" />
        </div>

        <div className="relative p-6 sm:p-8">
          {/* Header row */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge resolved={market.resolved} outcome={market.outcome} />
              {isExpired && !market.resolved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                  <Clock className="h-2.5 w-2.5" />
                  Expired
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--text-tertiary)]">
              <Hash className="h-3 w-3" />
              <span className="truncate max-w-[160px]">{market.market_address}</span>
            </div>
          </div>

          {/* Achievement name */}
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {market.achievement_name}
          </h1>

          {/* Meta tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Tag
              icon={
                market.streamer_avatar_url ? (
                  <img
                    src={market.streamer_avatar_url}
                    alt=""
                    className="h-3.5 w-3.5 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3 w-3" />
                )
              }
              label={streamerLabel}
            />
            <Tag icon={<Gamepad2 className="h-3 w-3" />} label={gameLabel} accent />
            <Tag
              icon={<Clock className="h-3 w-3" />}
              label={format(deadlineDate, "MMM d, yyyy")}
            />
            <Tag
              icon={<Zap className="h-3 w-3" />}
              label={`${formatDistanceToNow(deadlineDate, { addSuffix: true })}`}
              dim
            />
          </div>

          {/* Description */}
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
              <Trophy className="h-3.5 w-3.5" />
              Challenge Description
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{achievementDetail}</p>
            <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-dim)]">
              <span>Steam ID:</span>
              <span className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[var(--text-secondary)]">
                {market.achievement_id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Probability + Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Probability Card (spans 2 cols on sm) */}
        <div className="sm:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
              Market Sentiment
            </span>
            <span className="font-mono text-[10px] text-[var(--text-dim)]">
              {bets.length} bet{bets.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-3xl font-bold tabular-nums text-emerald-400">{yesPct.toFixed(1)}%</span>
              </div>
              <p className="mt-1 text-xs text-emerald-400/70">{totalYes.toFixed(2)} SOL on YES</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-3xl font-bold tabular-nums text-rose-400">{noPct.toFixed(1)}%</span>
                <TrendingDown className="h-5 w-5 text-rose-400" />
              </div>
              <p className="mt-1 text-xs text-rose-400/70">{totalNo.toFixed(2)} SOL on NO</p>
            </div>
          </div>

          {/* Bar */}
          <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="relative bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${yesPct}%` }}
            >
              {yesPct > 10 && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_200%]" />
              )}
            </div>
            <div
              className="relative bg-gradient-to-r from-rose-500 to-rose-400 transition-all"
              style={{ width: `${noPct}%` }}
            >
              {noPct > 10 && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_200%]" />
              )}
            </div>
          </div>

          {/* Breakdown pills */}
          <div className="mt-4 flex gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/5 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {yesBetCount} YES bet{yesBetCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/5 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                {noBetCount} NO bet{noBetCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Volume Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <div className="flex h-full flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                Total Volume
              </span>
              <p className="mt-2 font-display text-4xl font-bold tracking-tight">
                {total.toFixed(2)}
              </p>
              <p className="text-sm font-medium text-[var(--text-tertiary)]">SOL</p>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--bg)] px-3 py-2">
              <CircleDollarSign className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-xs text-[var(--text-secondary)]">3% fee (1.5% platform + 1.5% streamer)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bet Panel */}
      {!market.resolved && !isExpired && (
        <BetPanel marketAddress={market.market_address} onBetPlaced={fetchMarket} />
      )}

      {isExpired && !market.resolved && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
            <Clock className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-sm font-medium text-[var(--fg)]">Market expired</p>
          <p className="max-w-sm text-xs text-[var(--fg-muted)]">
            This market has passed its deadline and is awaiting oracle resolution.
          </p>
        </div>
      )}

      {/* Bets List */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-lg font-bold">On-Chain Bets</h2>
          </div>
          <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
            {bets.length} total
          </span>
        </div>

        {bets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
              <Wallet className="h-5 w-5 text-[var(--text-dim)]" />
            </div>
            <p className="text-sm text-[var(--fg-muted)]">No bets placed yet</p>
            <p className="max-w-xs text-xs text-[var(--fg-muted)]">
              Be the first to bet on whether this achievement gets unlocked.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {bets.map((b, i) => (
              <div
                key={b.betAddress}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
              >
                <div className="flex items-center gap-3">
                  {/* Position number */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--bg-elevated)] font-mono text-[10px] font-bold text-[var(--text-tertiary)]">
                    {i + 1}
                  </span>

                  {/* Wallet / User */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-[var(--fg)]">
                        {b.user.slice(0, 4)}...{b.user.slice(-4)}
                      </p>
                      {b.claimed && (
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                          Claimed
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] text-[var(--text-dim)]">
                      {b.betAddress.slice(0, 6)}...{b.betAddress.slice(-6)}
                    </p>
                  </div>
                </div>

                {/* Side + Amount */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        b.side === "yes"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {b.side === "yes" ? (
                        <TrendingUp className="h-2.5 w-2.5" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5" />
                      )}
                      {b.side.toUpperCase()}
                    </span>
                    <span className="font-display text-sm font-bold tabular-nums">
                      {b.amountSol.toFixed(2)} SOL
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">
                    {b.amountLamports.toLocaleString()} lamports
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({
  icon,
  label,
  accent,
  dim,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
  dim?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        accent
          ? "border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)]"
          : dim
          ? "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
          : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)]"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function StatusBadge({ resolved, outcome }: { resolved: number; outcome: number | null }) {
  if (!resolved) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Live
      </span>
    );
  }
  if (outcome === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Yes Won
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-400 border border-rose-500/20">
      <XCircle className="h-3.5 w-3.5" />
      No Won
    </span>
  );
}
