"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BetPanel } from "@/components/dashboard/bet-panel";
import { Loader2, Clock, TrendingUp, TrendingDown, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

interface Market {
  id: number;
  market_address: string;
  creator_steam_id: string;
  streamer_steam_id: string;
  streamer_name: string | null;
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

export default function MarketDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    fetchMarket();
  }, [address]);

  async function fetchMarket() {
    setLoading(true);
    try {
      const res = await fetch(`/api/markets?address=${address}`);
      const data = await res.json();
      const m = data.markets?.find((m: Market) => m.market_address === address);
      setMarket(m || null);
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
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-[var(--fg-muted)]">Market not found</p>
        <Link
          href="/dashboard"
          className="mt-4 text-sm text-[var(--accent)] hover:underline"
        >
          Back to markets
        </Link>
      </div>
    );
  }

  const total = (market.total_yes_sol || 0) + (market.total_no_sol || 0);
  const yesPct = total > 0 ? ((market.total_yes_sol || 0) / total) * 100 : 50;
  const deadlineDate = new Date(market.deadline * 1000);
  const isExpired = Date.now() > market.deadline * 1000;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to markets
      </Link>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{market.achievement_name}</h1>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              {market.streamer_name || market.streamer_steam_id}
            </p>
          </div>
          <StatusBadge resolved={market.resolved} outcome={market.outcome} />
        </div>

        {market.achievement_description && (
          <p className="mb-6 text-sm text-[var(--fg-muted)]">
            {market.achievement_description}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatBox
            label="Total Volume"
            value={`${total.toFixed(2)} SOL`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatBox
            label="Deadline"
            value={format(deadlineDate, "MMM d, yyyy")}
            sub={formatDistanceToNow(deadlineDate, { addSuffix: true })}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatBox
            label="YES Probability"
            value={`${yesPct.toFixed(1)}%`}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          />
        </div>

        {/* Probability bar */}
        <div className="mt-6">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-emerald-400">
              <TrendingUp className="inline h-3 w-3" /> YES {yesPct.toFixed(1)}%
            </span>
            <span className="text-rose-400">
              <TrendingDown className="inline h-3 w-3" /> NO {(100 - yesPct).toFixed(1)}%
            </span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${yesPct}%` }}
            />
            <div
              className="bg-rose-500 transition-all"
              style={{ width: `${100 - yesPct}%` }}
            />
          </div>
        </div>
      </div>

      {!market.resolved && !isExpired && (
        <BetPanel
          marketAddress={market.market_address}
          onBetPlaced={fetchMarket}
        />
      )}

      {isExpired && !market.resolved && (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
          <Clock className="mx-auto mb-2 h-6 w-6 text-[var(--fg-muted)]" />
          <p className="text-sm text-[var(--fg-muted)]">
            This market has expired and is awaiting resolution.
          </p>
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
      <div className="flex items-center gap-2 text-[var(--fg-muted)]">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[var(--fg-muted)]">{sub}</p>}
    </div>
  );
}

function StatusBadge({ resolved, outcome }: { resolved: number; outcome: number | null }) {
  if (!resolved) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
        <Clock className="h-3 w-3" />
        Open
      </span>
    );
  }
  if (outcome === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Yes Won
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-400">
      <XCircle className="h-3 w-3" />
      No Won
    </span>
  );
}
