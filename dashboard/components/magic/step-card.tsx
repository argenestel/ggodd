"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export function StepCard({ step, title, description, className, delay = 0 }: StepCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("relative", className)}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" as const }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-dim)] font-mono text-sm font-semibold text-[var(--accent)]">
          {step}
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-[var(--text)]">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
