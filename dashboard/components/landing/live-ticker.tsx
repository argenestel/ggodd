"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface Market {
  id: number;
  market_address: string;
  resolved?: number;
  streamer_name: string | null;
  streamer_steam_id: string;
  game_name: string | null;
  achievement_name: string;
  total_yes_sol: number;
  total_no_sol: number;
  deadline: number;
}

const MOCK_TICKER_ITEMS: Market[] = [
  {
    id: 1,
    market_address: "mock_demo_1",
    streamer_name: "ymfah",
    streamer_steam_id: "76561198000000001",
    game_name: "Elden Ring",
    achievement_name: "Legendary Talismans",
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
    total_yes_sol: 6.3,
    total_no_sol: 9.1,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 14,
  },
  {
    id: 4,
    market_address: "mock_demo_4",
    streamer_name: "LilAggy",
    streamer_steam_id: "76561198000000004",
    game_name: "Elden Ring",
    achievement_name: "Shardbearer Malenia",
    total_yes_sol: 45.0,
    total_no_sol: 12.0,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 2,
  },
  {
    id: 5,
    market_address: "mock_demo_5",
    streamer_name: "Smallant",
    streamer_steam_id: "76561198000000005",
    game_name: "Celeste",
    achievement_name: "Farewell",
    total_yes_sol: 18.7,
    total_no_sol: 3.3,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 5,
  },
  {
    id: 6,
    market_address: "mock_demo_6",
    streamer_name: "GinoMachino",
    streamer_steam_id: "76561198000000006",
    game_name: "Dark Souls",
    achievement_name: "Knight's Honor",
    total_yes_sol: 22.4,
    total_no_sol: 6.8,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 10,
  },
];

function TickerItem({ market }: { market: Market }) {
  const total = (market.total_yes_sol || 0) + (market.total_no_sol || 0);
  const yesPct = total > 0 ? ((market.total_yes_sol || 0) / total) * 100 : 50;
  const timeLeft = Math.max(0, market.deadline - Math.floor(Date.now() / 1000));
  const daysLeft = Math.floor(timeLeft / 86400);
  const hoursLeft = Math.floor((timeLeft % 86400) / 3600);

  const timeStr = daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`;

  return (
    <div className="flex shrink-0 items-center gap-4 px-5 py-2.5">
      {/* Live indicator */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
      </span>

      {/* Streamer */}
      <span className="font-mono text-xs font-bold text-[var(--text)] whitespace-nowrap">
        {market.streamer_name || market.streamer_steam_id.slice(-6)}
      </span>

      {/* Arrow */}
      <span className="text-[var(--text-tertiary)]">→</span>

      {/* Game */}
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] whitespace-nowrap">
        {market.game_name || "Game"}
      </span>

      {/* Arrow */}
      <span className="text-[var(--text-tertiary)]">→</span>

      {/* Achievement */}
      <span className="font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
        {market.achievement_name}
      </span>

      {/* Divider */}
      <span className="mx-1 h-4 w-px bg-[var(--border)]" />

      {/* Odds */}
      <span className="flex items-center gap-1 font-mono text-[10px]">
        <TrendingUp className="h-3 w-3 text-emerald-400" />
        <span className="text-emerald-400 font-bold">YES {yesPct.toFixed(0)}%</span>
      </span>

      {/* Volume */}
      <span className="font-mono text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">
        {total.toFixed(1)} SOL
      </span>

      {/* Time */}
      <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">
        <Clock className="h-3 w-3" />
        {timeStr}
      </span>

      {/* Separator dot */}
      <span className="mx-2 h-1 w-1 rounded-full bg-[var(--border)]" />
    </div>
  );
}

export function LiveTicker() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [hasRealData, setHasRealData] = useState(false);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const res = await fetch("/api/markets?resolved=0");
        if (res.ok) {
          const data = await res.json();
          const active = (data.markets || []).filter((m: Market) => !m.resolved);
          if (active.length > 0) {
            setMarkets(active);
            setHasRealData(true);
            return;
          }
        }
      } catch {
        // ignore
      }
      // Fallback to mocks
      setMarkets(MOCK_TICKER_ITEMS);
      setHasRealData(false);
    }

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayItems = markets.length > 0 ? markets : MOCK_TICKER_ITEMS;
  // Duplicate for seamless infinite scroll
  const duplicated = [...displayItems, ...displayItems, ...displayItems, ...displayItems];

  return (
    <div className="ticker-band relative overflow-hidden">
      {!hasRealData && (
        <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
          <span className="rounded bg-[var(--bg)]/80 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Demo Data
          </span>
        </div>
      )}
      <div className="animate-ticker flex w-max">
        {duplicated.map((market, i) => (
          <TickerItem key={`${market.id}-${i}`} market={market} />
        ))}
      </div>
    </div>
  );
}
