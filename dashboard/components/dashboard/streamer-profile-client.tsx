"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChallengeModal } from "@/components/dashboard/challenge-modal";
import {
  ArrowLeft,
  Globe,
  Gamepad2,
  Clock,
  Trophy,
  Swords,
  CircleDot,
  MapPin,
  Calendar,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

interface SteamProfile {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate?: number;
  gameextrainfo?: string;
  gameid?: string;
  loccountrycode?: string;
  timecreated?: number;
}

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
}

const STATUS_MAP: Record<number, { label: string; color: string; glow: string }> = {
  0: { label: "Offline", color: "bg-neutral-600", glow: "" },
  1: { label: "Online", color: "bg-[var(--success)]", glow: "shadow-[0_0_8px_rgba(57,255,20,0.4)]" },
  2: { label: "Busy", color: "bg-rose-500", glow: "shadow-[0_0_8px_rgba(255,71,87,0.4)]" },
  3: { label: "Away", color: "bg-amber-500", glow: "shadow-[0_0_8px_rgba(245,166,35,0.4)]" },
  4: { label: "Snooze", color: "bg-amber-500", glow: "" },
  5: { label: "Trade", color: "bg-blue-500", glow: "" },
  6: { label: "Play", color: "bg-blue-500", glow: "" },
};

function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours < 1) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function getGameIconUrl(appId: number, iconHash: string): string {
  if (!iconHash) return "";
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${iconHash}.jpg`;
}

function getGameHeaderUrl(appId: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function StreamerProfileClient({
  profile,
  games,
}: {
  profile: SteamProfile;
  games: SteamGame[];
}) {
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SteamGame | null>(null);
  const status = STATUS_MAP[profile.personastate || 0] || STATUS_MAP[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/dashboard/search"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]"
      >
        {/* Banner */}
        <div className="relative h-36 sm:h-44">
          {profile.gameid ? (
            <img
              src={getGameHeaderUrl(Number(profile.gameid))}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
          ) : (
            <div className="h-full w-full bg-[var(--bg)] dot-grid" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-surface)]" />
        </div>

        <div className="relative px-6 pb-6 sm:px-8">
          <div className="-mt-14 mb-4 flex items-end gap-4 sm:-mt-16">
            {profile.avatarfull ? (
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                src={profile.avatarfull}
                alt={profile.personaname}
                className="h-24 w-24 rounded-xl border-4 border-[var(--bg-surface)] shadow-2xl sm:h-28 sm:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border-4 border-[var(--bg-surface)] bg-[var(--bg)] shadow-2xl sm:h-28 sm:w-28">
                <Gamepad2 className="h-10 w-10 text-[var(--text-dim)]" />
              </div>
            )}
            <div className="mb-1 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold tracking-wide sm:text-3xl">
                  {profile.personaname}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${status.color} ${status.glow}`}
                >
                  <CircleDot className="h-2.5 w-2.5" />
                  {status.label}
                </span>
              </div>
              {profile.gameextrainfo && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--accent)]">
                  <Zap className="h-3.5 w-3.5" />
                  Playing {profile.gameextrainfo}
                </p>
              )}
            </div>
            <button
              onClick={() => setChallengeOpen(true)}
              className="hidden items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--accent-fg)] shadow-lg transition hover:brightness-110 sm:flex"
            >
              <Swords className="h-4 w-4" />
              Challenge
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
            {profile.loccountrycode && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.loccountrycode}
              </span>
            )}
            {profile.timecreated && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Since {format(new Date(profile.timecreated * 1000), "MMM yyyy")}
              </span>
            )}
            <a
              href={profile.profileurl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition hover:text-[var(--accent)]"
            >
              <Globe className="h-3.5 w-3.5" />
              Steam Profile
            </a>
          </div>

          <button
            onClick={() => setChallengeOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--accent-fg)] shadow-lg transition hover:brightness-110 sm:hidden"
          >
            <Swords className="h-4 w-4" />
            Issue Challenge
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          icon={<Gamepad2 className="h-5 w-5 text-[var(--accent)]" />}
          label="Games Owned"
          value={games.length.toString()}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-[var(--success)]" />}
          label="Total Playtime"
          value={formatPlaytime(
            games.reduce((sum, g) => sum + (g.playtime_forever || 0), 0)
          )}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-[var(--text-secondary)]" />}
          label="Active Challenges"
          value="0"
        />
      </motion.div>

      {/* Games Library */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold tracking-wide">
            Game Library
          </h2>
          <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
            {games.length} titles
          </span>
        </div>

        {games.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] py-14 text-center">
            <Gamepad2 className="mx-auto mb-3 h-10 w-10 text-[var(--text-dim)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              No games found. Profile may be private.
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {games.slice(0, 24).map((game) => (
              <motion.button
                key={game.appid}
                variants={cardItem}
                whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedGame(game);
                  setChallengeOpen(true);
                }}
                className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-left transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
              >
                {game.img_icon_url ? (
                  <img
                    src={getGameIconUrl(game.appid, game.img_icon_url)}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bg)]">
                    <Gamepad2 className="h-5 w-5 text-[var(--text-dim)]" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold transition group-hover:text-[var(--accent)]">
                    {game.name}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--text-tertiary)]">
                    {formatPlaytime(game.playtime_forever)} played
                  </p>
                </div>
                <Swords className="h-4 w-4 text-[var(--text-dim)] opacity-0 transition group-hover:text-[var(--accent)] group-hover:opacity-100" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Active Markets */}
      <StreamerMarkets steamId={profile.steamid} />

      {challengeOpen && (
        <ChallengeModal
          streamer={profile}
          preselectedGame={selectedGame}
          onClose={() => {
            setChallengeOpen(false);
            setSelectedGame(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-wide">{value}</p>
    </div>
  );
}

function StreamerMarkets({ steamId }: { steamId: string }) {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/markets?streamerId=${steamId}`)
      .then((r) => r.json())
      .then((d) => {
        setMarkets(d.markets || []);
        setLoaded(true);
      });
  }, [steamId]);

  if (!loaded || markets.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="mb-4 font-display text-xl font-semibold tracking-wide">
        Active Challenges
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {markets.map((m) => (
          <Link
            key={m.id}
            href={`/dashboard/market/${m.market_address}`}
            className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
          >
            <p className="font-semibold transition group-hover:text-[var(--accent)]">
              {m.achievement_name}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">{m.achievement_description}</p>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--text-tertiary)]">
              <span>{new Date(m.deadline * 1000).toLocaleDateString()}</span>
              <span>{(m.total_yes_sol + m.total_no_sol).toFixed(2)} SOL</span>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
