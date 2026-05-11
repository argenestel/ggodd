"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  phase: string;
  detail: string;
  index: number;
  total: number;
  status?: "completed" | "active" | "upcoming";
}

function TimelineItem({ phase, detail, index, total, status = "upcoming" }: TimelineItemProps) {
  const reduce = useReducedMotion();
  const isLast = index === total - 1;

  const statusColors = {
    completed: "border-[var(--accent)] bg-[var(--accent)] text-[var(--void)]",
    active: "border-[var(--neon-magenta)] bg-[var(--neon-magenta)]/20 text-[var(--neon-magenta)] shadow-[0_0_16px_rgba(232,121,249,0.4)]",
    upcoming: "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
  };

  const lineColors = {
    completed: "from-[var(--accent)] to-[var(--neon-magenta)]",
    active: "from-[var(--neon-magenta)] to-transparent",
    upcoming: "from-[var(--border)] to-transparent",
  };

  return (
    <motion.li
      className="relative flex gap-5 sm:gap-8"
      initial={reduce ? false : { opacity: 0, x: -20 }}
      whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Timeline line and node */}
      <div className="flex flex-col items-center">
        <motion.div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 font-mono text-sm font-bold",
            statusColors[status],
          )}
          whileHover={reduce ? undefined : { scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {status === "completed" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            index + 1
          )}
        </motion.div>
        {!isLast && (
          <div className={cn("mt-3 w-px flex-1 min-h-[3rem] bg-gradient-to-b", lineColors[status])} />
        )}
      </div>
      {/* Content */}
      <div className={cn("pb-10", isLast && "pb-0")}>
        <h3 className="font-display text-lg font-bold text-[var(--foreground)]">
          {phase}
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">{detail}</p>
        {status === "active" && (
          <motion.div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--neon-magenta)]/30 bg-[var(--neon-magenta)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--neon-magenta)]"
            animate={reduce ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neon-magenta)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--neon-magenta)]" />
            </span>
            In progress
          </motion.div>
        )}
      </div>
    </motion.li>
  );
}

interface TimelineProps {
  items: Array<{ phase: string; detail: string; status?: "completed" | "active" | "upcoming" }>;
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ul className={cn("space-y-0", className)}>
      {items.map((item, i) => (
        <TimelineItem
          key={item.phase}
          phase={item.phase}
          detail={item.detail}
          index={i}
          total={items.length}
          status={item.status}
        />
      ))}
    </ul>
  );
}
