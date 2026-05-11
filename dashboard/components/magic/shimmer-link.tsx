"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ShimmerLinkProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
};

/** Arcade CTA with sweeping highlight — Magic UI shimmer energy. */
export function ShimmerLink({ className, children, href }: ShimmerLinkProps) {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href={href}
      className={cn(
        "relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-lg px-8 font-mono text-sm font-bold uppercase tracking-[0.2em] text-[var(--void)]",
        "bg-gradient-to-r from-[var(--neon-magenta)] via-[#c026d3] to-[var(--accent)]",
        "shadow-[0_0_0_1px_rgba(232,121,249,0.45),0_0_32px_rgba(34,211,238,0.15)]",
        className,
      )}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
    >
      {!reduce ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0.6,
          }}
        />
      ) : null}
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
