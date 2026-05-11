"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function StatCard({ value, label, icon, delay = 0 }: StatCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-5 backdrop-blur-sm transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--surface)]/70"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" as const }}
      whileHover={reduce ? undefined : { y: -3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <motion.p
            className="font-display text-2xl font-black text-[var(--foreground)] sm:text-3xl"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.2, duration: 0.6 }}
          >
            {value}
          </motion.p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {label}
          </p>
        </div>
        {icon && (
          <div className="text-[var(--accent)]/40 transition-colors group-hover:text-[var(--accent)]/70">
            {icon}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[var(--accent)] to-[var(--neon-magenta)] transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
}
