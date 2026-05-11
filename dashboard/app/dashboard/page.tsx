"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MarketCard } from "@/components/dashboard/market-card";
import { CreateMarketModal } from "@/components/dashboard/create-market-modal";
import { Plus, TrendingUp, Clock, CheckCircle2, Zap, Flame } from "lucide-react";

interface Market {
  id: number;
  market_address: string;
  creator_steam_id: string;
  streamer_steam_id: string;
  streamer_name: string | null;
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, []);

  async function fetchMarkets() {
    setLoading(true);
    try {
      const res = await fetch("/api/markets");
      if (!res.ok) {
        setMarkets([]);
        return;
      }
      const data = await res.json();
      setMarkets(data.markets || []);
    } catch (e) {
      console.error(e);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = markets.filter((m) => {
    if (filter === "active") return !m.resolved;
    if (filter === "resolved") return m.resolved;
    return true;
  });

  const activeCount = markets.filter((m) => !m.resolved).length;
  const resolvedCount = markets.filter((m) => m.resolved).length;
  const totalVolume = markets.reduce(
    (sum, m) => sum + (m.total_yes_sol || 0) + (m.total_no_sol || 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 h-64 w-64 opacity-20">
          <div className="h-full w-full rounded-full bg-[var(--accent)] blur-[100px]" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-[var(--accent)]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Live Markets
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-wide lg:text-4xl">
            Steam Achievement <span className="text-gradient">Prediction Markets</span>
          </h2>
          <p className="mt-2 max-w-lg text-sm text-[var(--text-secondary)]">
            Bet on whether streamers will unlock achievements before the deadline.
            Solana-powered, transparent, instant settlements.
          </p>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <StatBox
            icon={<Flame className="h-4 w-4 text-[var(--accent)]" />}
            label="Total Volume"
            value={`${totalVolume.toFixed(2)}`}
            unit="SOL"
          />
          <StatBox
            icon={<Clock className="h-4 w-4 text-[var(--success)]" />}
            label="Active Markets"
            value={activeCount.toString()}
            unit="open"
          />
          <StatBox
            icon={<CheckCircle2 className="h-4 w-4 text-[var(--text-secondary)]" />}
            label="Resolved"
            value={resolvedCount.toString()}
            unit="done"
          />
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-1">
          {(["all", "active", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                filter === f
                  ? "text-[var(--accent-fg)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {filter === f && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-md bg-[var(--accent)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Create Market
        </button>
      </motion.div>

      {/* Markets Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-20"
        >
          <TrendingUp className="mb-3 h-10 w-10 text-[var(--text-dim)]" />
          <p className="text-sm text-[var(--text-secondary)]">No markets found</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-3 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Create the first one
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((market) => (
            <motion.div key={market.id} variants={item}>
              <Link href={`/dashboard/market/${market.market_address}`}>
                <MarketCard market={market} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {createOpen && (
        <CreateMarketModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            fetchMarkets();
          }}
        />
      )}
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-bold tracking-wide">{value}</span>
        <span className="text-xs font-medium text-[var(--text-tertiary)]">{unit}</span>
      </div>
    </div>
  );
}
