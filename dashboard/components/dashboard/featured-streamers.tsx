"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Play,
  ExternalLink,
  Gamepad2,
  Filter,
  Trophy,
  EyeOff,
  Loader2,
  Zap,
} from "lucide-react";

interface EnrichedStreamer {
  id: string;
  name: string;
  game: string;
  tags: string[];
  youtube: string;
  twitch?: string;
  twitter?: string;
  description: string;
  resolved: boolean;
  steamProfile: {
    steamid: string;
    personaname: string;
    avatarfull: string;
    profileurl: string;
    gameextrainfo?: string;
  } | null;
  activeMarkets: number;
  totalVolume: number;
  latestAchievement: string | null;
}

type PredictionFilter = "all" | "has-predictions" | "no-predictions";

export function FeaturedStreamers() {
  const [streamers, setStreamers] = useState<EnrichedStreamer[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictionFilter, setPredictionFilter] = useState<PredictionFilter>("all");
  const [gameFilter, setGameFilter] = useState<string>("All");

  useEffect(() => {
    fetch("/api/featured")
      .then((r) => r.json())
      .then((data) => {
        setStreamers(data.streamers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const gameOptions = useMemo(() => {
    const games = new Set<string>();
    streamers.forEach((s) => games.add(s.game));
    return ["All", ...Array.from(games).sort()];
  }, [streamers]);

  const filtered = useMemo(() => {
    return streamers.filter((s) => {
      const predOk =
        predictionFilter === "all"
          ? true
          : predictionFilter === "has-predictions"
          ? s.activeMarkets > 0
          : s.activeMarkets === 0;
      const gameOk = gameFilter === "All" || s.game === gameFilter;
      return predOk && gameOk;
    });
  }, [streamers, predictionFilter, gameFilter]);

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-[var(--accent)]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Featured Challengers
            </span>
          </div>
          <h3 className="font-display text-xl font-bold tracking-wide">
            Top Challenge Runners
          </h3>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Popular streamers and YouTubers known for extreme achievement challenges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Game filter */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] py-2 pl-8 pr-6 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            >
              {gameOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Prediction filter pills */}
          <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-1">
            {(
              [
                ["all", "All"],
                ["has-predictions", "Has Predictions"],
                ["no-predictions", "No Predictions"],
              ] as [PredictionFilter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPredictionFilter(key)}
                className={`relative rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                  predictionFilter === key
                    ? "text-[var(--accent-fg)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                }`}
              >
                {predictionFilter === key && (
                  <motion.div
                    layoutId="featured-pred-pill"
                    className="absolute inset-0 rounded-md bg-[var(--accent)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-14">
          <Zap className="mb-2 h-8 w-8 text-[var(--text-dim)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            No challengers match your filters.
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.06, delayChildren: 0.05 },
            },
          }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((s) => (
            <FeaturedCard key={s.id} streamer={s} />
          ))}
        </motion.div>
      )}
    </section>
  );
}

function FeaturedCard({ streamer }: { streamer: EnrichedStreamer }) {
  const isPublic = streamer.resolved && !!streamer.steamProfile;
  const avatar = streamer.steamProfile?.avatarfull;
  const steamName = streamer.steamProfile?.personaname || streamer.name;
  const steamId = streamer.steamProfile?.steamid;

  const CardWrapper = isPublic
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={`/dashboard/streamer/${steamId}`} className="block h-full">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => <div className="h-full">{children}</div>;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
      }}
      className="h-full"
    >
      <CardWrapper>
        <div
          className={`group relative flex h-full flex-col overflow-hidden rounded-xl border bg-[var(--bg-surface)] p-4 transition-all duration-300 ${
            isPublic
              ? "border-[var(--border)] hover:border-[var(--border-hover)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_0_1px_rgba(245,166,35,0.1)] cursor-pointer"
              : "border-[var(--border)] opacity-80"
          }`}
        >
          {/* Top row */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={steamName}
                  className="h-14 w-14 rounded-xl object-cover ring-1 ring-[var(--border)]"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--bg)] ring-1 ring-[var(--border)]">
                  <User className="h-6 w-6 text-[var(--text-tertiary)]" />
                </div>
              )}
              {!isPublic && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-surface)] ring-1 ring-[var(--border)]">
                  <EyeOff className="h-3 w-3 text-[var(--text-tertiary)]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate font-display text-sm font-bold tracking-wide">
                {steamName}
              </h4>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="inline-flex items-center gap-1 rounded bg-[var(--accent)]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  <Gamepad2 className="h-3 w-3" />
                  {streamer.game}
                </span>
                {streamer.activeMarkets > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <Zap className="h-3 w-3" />
                    {streamer.activeMarkets} prediction
                    {streamer.activeMarkets > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            {streamer.description}
          </p>

          {/* Latest achievement if any */}
          {streamer.latestAchievement && (
            <div className="mt-2 rounded-lg bg-[var(--bg)] px-2.5 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Latest Challenge
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-[var(--text)]">
                {streamer.latestAchievement}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(streamer.youtube, "_blank", "noopener,noreferrer");
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--bg)] text-[var(--text-tertiary)] transition hover:bg-red-500/10 hover:text-red-400"
                title="YouTube"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
              {streamer.twitch && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(streamer.twitch, "_blank", "noopener,noreferrer");
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--bg)] text-[var(--text-tertiary)] transition hover:bg-violet-500/10 hover:text-violet-400"
                  title="Twitch"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {isPublic ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Challenge
                <ExternalLink className="h-3 w-3" />
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Steam Private
              </span>
            )}
          </div>
        </div>
      </CardWrapper>
    </motion.div>
  );
}
