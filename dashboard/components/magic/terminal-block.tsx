"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalBlockProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  typing?: boolean;
}

export function TerminalBlock({
  children,
  className,
  title = "strawbee@solana:~",
  typing = false,
}: TerminalBlockProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--border)] bg-[#0a0612] shadow-2xl",
        className,
      )}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)]/60 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#fb7185]/80" />
          <span className="h-3 w-3 rounded-full bg-[#facc15]/80" />
          <span className="h-3 w-3 rounded-full bg-[#22d3ee]/80" />
        </div>
        <span className="ml-3 font-mono text-[11px] text-[var(--muted)]">{title}</span>
      </div>
      {/* Terminal body */}
      <div className="relative p-5 font-mono text-[13px] leading-relaxed text-[var(--foreground)]/90">
        {typing && !reduce ? (
          <TypewriterText>{children}</TypewriterText>
        ) : (
          children
        )}
      </div>
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
        aria-hidden
      />
    </motion.div>
  );
}

function TypewriterText({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      {children}
      <motion.span
        className="ml-0.5 inline-block h-[1em] w-[0.6em] translate-y-[2px] bg-[var(--accent)]"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      />
    </motion.div>
  );
}
