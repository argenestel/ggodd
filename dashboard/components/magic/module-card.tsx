"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
  metric?: string;
  metricLabel?: string;
}

export function ModuleCard({
  icon,
  title,
  description,
  className,
  delay = 0,
  metric,
  metricLabel,
}: ModuleCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 card-hover",
        className,
      )}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" as const }}
    >
      <div className="flex items-start justify-between">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]/20">
          {icon}
        </div>
        {metric && (
          <div className="text-right">
            <p className="font-display text-xl font-bold text-[var(--text)]">{metric}</p>
            {metricLabel && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                {metricLabel}
              </p>
            )}
          </div>
        )}
      </div>
      <h3 className="font-display text-[15px] font-semibold text-[var(--text)]">
        {title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
    </motion.div>
  );
}
