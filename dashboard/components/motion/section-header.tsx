"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  label,
  className,
  align = "left",
}: SectionHeaderProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3",
        align === "center" && "justify-center",
        className,
      )}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.45, ease: "easeOut" as const }}
    >
      <div className="h-px w-6 bg-[var(--accent)]/60" />
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
        {label}
      </span>
      <div className="h-px w-6 bg-[var(--accent)]/60" />
    </motion.div>
  );
}
