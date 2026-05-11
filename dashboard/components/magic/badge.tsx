"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "neutral" | "accent";
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const variants = {
    success: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
    error: "bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/20",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
    neutral: "bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border)]",
    accent: "bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent)]/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
