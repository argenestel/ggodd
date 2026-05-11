"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Swords,
  Gamepad2,
  User,
  Zap,
} from "lucide-react";

interface Market {
  id: number;
  market_address: string;
  streamer_name: string | null;
  streamer_steam_id: string;
  game_name: string | null;
  game_app_id: number | null;
  achievement_name: string;
  achievement_description: string | null;
  deadline: number;
  resolved: number;
  outcome: number | null;
  total_yes_sol: number;
  total_no_sol: number;
}

export function MarketCard({ market }: { market: Market }) {
  const total = (market.total_yes_sol || 0) + (market.total_no_sol || 0);
  const yesPct = total > 0 ? ((market.total_yes_sol || 0) / total) * 100 : 50;
  const noPct = 100 - yesPct;
  const deadlineDate = new Date(market.deadline * 1000);
  const isExpired = Date.now() > market.deadline * 1000;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-300 hover:border-[var(--border-hover)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_0_1px_rgba(245,166,35,0.1)]"
    >
      {/* Top: Streamer + Game */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg)]/40 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)] ring-1 ring-[var(--border)]">
          <User className="h-5 w-5 text-[var(--text-tertiary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold tracking-wide">
            {market.streamer_name || market.streamer_steam_id}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            {market.game_name ? (
              <>
                <Gamepad2 className="h-3 w-3 text-[var(--accent)]" />
                <span className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  {market.game_name}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Unknown Game
              </span>
            )}
          </div>
        </div>
        <StatusBadge resolved={market.resolved} outcome={market.outcome} />
      </div>

      {/* Middle: Prediction (Achievement) */}
      <div className="flex flex-1 flex-col px-4 pt-3 pb-2">
        <div className="flex items-start gap-2">
          <Swords className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-snug tracking-wide">
              {market.achievement_name}
            </h3>
            {market.achievement_description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                {market.achievement_description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Stats */}
      <div className="mt-auto space-y-3 px-4 pb-4">
        {/* Probability bar */}
        <div>
          <div className="flex h-2 overflow-hidden rounded-full bg-[var(--bg)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${yesPct}%` }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-500 to-[var(--success)]"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${noPct}%` }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="bg-gradient-to-r from-rose-600 to-[var(--error)]"
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10px] font-bold uppercase tracking-wider">
            <span className="text-emerald-400">
              <TrendingUp className="inline h-3 w-3 mr-0.5" />
              Yes {yesPct.toFixed(1)}%
            </span>
            <span className="text-rose-400">
              <TrendingDown className="inline h-3 w-3 mr-0.5" />
              No {noPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-tertiary)]">
            <Clock className="h-3 w-3" />
            {market.resolved
              ? "Resolved"
              : isExpired
              ? "Expired"
              : formatDistanceToNow(deadlineDate, { addSuffix: true })}
          </span>
          <span className="font-mono text-xs font-bold text-[var(--accent)]">
            {total.toFixed(2)} <span className="text-[var(--text-tertiary)]">SOL</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ resolved, outcome }: { resolved: number; outcome: number | null }) {
  if (!resolved) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
        </span>
        Live
      </span>
    );
  }
  if (outcome === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3 w-3" />
        Yes Won
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 border border-rose-500/20">
      <XCircle className="h-3 w-3" />
      No Won
    </span>
  );
}
