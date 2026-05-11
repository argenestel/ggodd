"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Gamepad2, User, Zap } from "lucide-react";

interface Market {
  id: number;
  market_address: string;
  resolved?: number;
  streamer_name: string | null;
  streamer_steam_id: string;
  game_name: string | null;
  achievement_name: string;
  achievement_description: string | null;
  total_yes_sol: number;
  total_no_sol: number;
  deadline: number;
}

const MOCK_CARDS: Market[] = [
  {
    id: 1,
    market_address: "mock_demo_1",
    streamer_name: "ymfah",
    streamer_steam_id: "76561198000000001",
    game_name: "Elden Ring",
    achievement_name: "Legendary Talismans",
    achievement_description: "Acquired all legendary talismans",
    total_yes_sol: 12.5,
    total_no_sol: 4.2,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 7,
  },
  {
    id: 2,
    market_address: "mock_demo_2",
    streamer_name: "Distortion2",
    streamer_steam_id: "76561198000000002",
    game_name: "Elden Ring",
    achievement_name: "Elden Lord",
    achievement_description: "Achieved the Elden Lord ending",
    total_yes_sol: 28.0,
    total_no_sol: 8.5,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 3,
  },
  {
    id: 3,
    market_address: "mock_demo_3",
    streamer_name: "Iron Pineapple",
    streamer_steam_id: "76561198000000003",
    game_name: "Dark Souls III",
    achievement_name: "The Dark Soul",
    achievement_description: "Achieve all trophies",
    total_yes_sol: 6.3,
    total_no_sol: 9.1,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 14,
  },
];

function FloatingCard({
  market,
  delay,
  floatClass,
}: {
  market: Market;
  delay: number;
  floatClass: string;
}) {
  const total = (market.total_yes_sol || 0) + (market.total_no_sol || 0);
  const yesPct = total > 0 ? ((market.total_yes_sol || 0) / total) * 100 : 50;
  const noPct = 100 - yesPct;
  const timeLeft = Math.max(0, market.deadline - Math.floor(Date.now() / 1000));
  const daysLeft = Math.floor(timeLeft / 86400);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={`${floatClass} w-72 shrink-0`}
    >
      <Link href={`/dashboard/market/${market.market_address}`}>
        <div className="glass-arena cursor-pointer transition-all duration-300 hover:scale-[1.02]">
          {/* Header: Streamer + Game */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg)] ring-1 ring-[var(--border)]">
              <User className="h-4 w-4 text-[var(--text-tertiary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{market.streamer_name || "Streamer"}</p>
              <div className="flex items-center gap-1">
                <Gamepad2 className="h-3 w-3 text-[var(--accent)]" />
                <span className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  {market.game_name || "Game"}
                </span>
              </div>
            </div>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
          </div>

          {/* Body: Achievement */}
          <div className="px-4 py-3">
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-semibold">{market.achievement_name}</p>
                {market.achievement_description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
                    {market.achievement_description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer: Odds bar */}
          <div className="px-4 pb-4">
            <div className="flex h-1.5 overflow-hidden rounded-full bg-[var(--bg)]">
              <div
                className="bg-gradient-to-r from-emerald-500 to-[var(--success)]"
                style={{ width: `${yesPct}%` }}
              />
              <div
                className="bg-gradient-to-r from-rose-600 to-[var(--error)]"
                style={{ width: `${noPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
              <span className="text-emerald-400">
                <TrendingUp className="inline h-3 w-3 mr-0.5" />
                YES {yesPct.toFixed(0)}%
              </span>
              <span className="text-rose-400">
                <TrendingDown className="inline h-3 w-3 mr-0.5" />
                NO {noPct.toFixed(0)}%
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-[var(--text-tertiary)]">
              <span>{total.toFixed(1)} SOL</span>
              <span>{daysLeft}d left</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function FloatingCards() {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const res = await fetch("/api/markets?resolved=0");
        if (res.ok) {
          const data = await res.json();
          const active = (data.markets || []).filter((m: Market) => !m.resolved);
          if (active.length > 0) {
            setMarkets(active.slice(0, 3));
            return;
          }
        }
      } catch {
        // ignore
      }
      setMarkets(MOCK_CARDS);
    }

    fetchMarkets();
  }, []);

  const display = markets.length > 0 ? markets : MOCK_CARDS;
  const floatClasses = ["animate-float", "animate-float-slow", "animate-float-delayed"];

  return (
    <div className="relative flex flex-col items-center gap-5 lg:items-end">
      {display.map((market, i) => (
        <FloatingCard
          key={market.id}
          market={market}
          delay={0.4 + i * 0.2}
          floatClass={floatClasses[i % floatClasses.length]}
        />
      ))}
    </div>
  );
}
