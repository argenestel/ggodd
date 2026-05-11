"use client";

import { motion } from "framer-motion";
import { Eye, Wallet, Zap } from "lucide-react";

const PILLARS = [
  {
    title: "TRANSPARENT ODDS",
    desc: "Every prediction is on-chain. Verifiable. No house edge. No hidden mechanics.",
    icon: Eye,
    accent: "var(--accent)",
  },
  {
    title: "STREAMER GETS PAID",
    desc: "1.5% of every bet goes directly to the streamer. Challenge them, support them.",
    icon: Wallet,
    accent: "#39ff14",
  },
  {
    title: "INSTANT SETTLEMENT",
    desc: "Solana-powered. No waiting weeks. Winners paid the moment the outcome is known.",
    icon: Zap,
    accent: "#f5a623",
  },
];

export function ArenaPillars() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
          The Arena
        </span>
        <h2 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-wide">
          WHY ON-CHAIN WINS
        </h2>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]/60 p-6 transition-all duration-300 hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface)]"
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px opacity-60 transition-opacity group-hover:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${pillar.accent} 50%, transparent 100%)`,
              }}
            />

            {/* Icon */}
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-300"
              style={{
                borderColor: `${pillar.accent}30`,
                background: `${pillar.accent}08`,
              }}
            >
              <pillar.icon className="h-5 w-5" style={{ color: pillar.accent }} />
            </div>

            <h3 className="font-display text-lg font-bold tracking-wide">{pillar.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              {pillar.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
