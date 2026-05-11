"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "./badge";

const feedData = [
  { player: "vortex_9", achievement: "ACH_WIN_GUNGAME", time: "2s ago", status: "verified" as const, chain: "5KtL...xY7z" },
  { player: "sniper_elite", achievement: "ACH_100_HEADSHOTS", time: "14s ago", status: "verified" as const, chain: "3AbC...9Df2" },
  { player: "raid_leader", achievement: "ACH_BOSS_CLEAR", time: "32s ago", status: "pending" as const, chain: "—" },
  { player: "noob_king", achievement: "ACH_FIRST_WIN", time: "1m ago", status: "verified" as const, chain: "8XyZ...1Qw3" },
  { player: "frame_perfect", achievement: "ACH_SPEEDRUN", time: "2m ago", status: "verified" as const, chain: "2Mno...7Pqr" },
  { player: "lag_switch", achievement: "ACH_WIN_GUNGAME", time: "3m ago", status: "failed" as const, chain: "—" },
  { player: "clutch_god", achievement: "ACH_1V5_CLUTCH", time: "5m ago", status: "verified" as const, chain: "9GhI...4Jk5" },
];

export function LiveFeed() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--text)]">
            Live Verification Feed
          </span>
        </div>
        <span className="font-mono text-[10px] text-[var(--text-tertiary)]">
          7 events / min
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Player
              </th>
              <th className="px-4 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Achievement
              </th>
              <th className="px-4 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Status
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {feedData.map((row, i) => (
              <motion.tr
                key={`${row.player}-${i}`}
                className="border-b border-[var(--border)]/50 row-hover"
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={reduce ? undefined : { opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.35 }}
              >
                <td className="px-4 py-2.5 font-mono text-[12px] text-[var(--text)]">
                  {row.player}
                </td>
                <td className="px-4 py-2.5 font-mono text-[12px] text-[var(--text-secondary)]">
                  {row.achievement}
                </td>
                <td className="px-4 py-2.5">
                  <Badge
                    variant={
                      row.status === "verified"
                        ? "success"
                        : row.status === "failed"
                          ? "error"
                          : "warning"
                    }
                  >
                    {row.status}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-[11px] text-[var(--text-tertiary)]">
                  {row.time}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
