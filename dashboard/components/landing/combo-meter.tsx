"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Crosshair, Lock } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "FIND",
    subtitle: "Any Steam Streamer",
    desc: "Search by vanity URL or Steam64 ID. Browse their public library.",
    icon: Search,
  },
  {
    num: "02",
    title: "PICK",
    subtitle: "A Locked Achievement",
    desc: "Choose an achievement they haven't unlocked yet. The harder, the better.",
    icon: Crosshair,
  },
  {
    num: "03",
    title: "LOCK",
    subtitle: "Your Bet",
    desc: "Set a deadline. Stake SOL. Will they unlock it in time?",
    icon: Lock,
  },
];

export function ComboMeter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="mx-auto max-w-5xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
          How It Works
        </span>
        <h2 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-wide">
          THREE STEPS. NO HAND-WAVING.
        </h2>
      </motion.div>

      <div className="relative">
        {/* Background track */}
        <div className="absolute top-[28px] left-[15%] right-[15%] hidden md:block">
          <div className="h-0.5 w-full bg-[var(--border)]" />
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]"
            initial={{ width: "0%" }}
            animate={isInView ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
          />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.25 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Node */}
              <div className="relative z-10 mb-6">
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 bg-[var(--bg-surface)]"
                  initial={{ borderColor: "rgba(245, 166, 35, 0.1)" }}
                  animate={isInView ? { borderColor: "rgba(245, 166, 35, 0.5)" } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.25 }}
                  style={{
                    boxShadow: isInView
                      ? "0 0 30px rgba(245, 166, 35, 0.1), inset 0 1px 0 rgba(245, 166, 35, 0.1)"
                      : "none",
                  }}
                >
                  <span className="font-mono text-lg font-bold text-[var(--accent)]">
                    {step.num}
                  </span>
                </motion.div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-[var(--accent)]"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={isInView ? { opacity: [0, 0.3, 0], scale: [1, 1.3, 1.5] } : {}}
                  transition={{ duration: 1.5, delay: 0.6 + i * 0.25, repeat: 0 }}
                />
              </div>

              {/* Content */}
              <div className="flex items-center gap-2 mb-2">
                <step.icon className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="font-display text-xl font-bold tracking-wide">{step.title}</h3>
              </div>
              <p className="text-sm font-semibold text-[var(--text-secondary)]">{step.subtitle}</p>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--text-tertiary)]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
