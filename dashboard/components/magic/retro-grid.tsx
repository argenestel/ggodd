"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type RetroGridProps = {
  className?: string;
  /** Grid cell size in px */
  cell?: number;
};

/** Perspective arcade grid — Magic UI / shadcn-adjacent vibe. */
export function RetroGrid({ className, cell = 48 }: RetroGridProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_25%,transparent_72%)]",
        className,
      )}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232, 121, 249, 0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: `${cell}px ${cell}px`,
          transformOrigin: "50% 0%",
        }}
        initial={false}
        animate={
          reduce
            ? {}
            : {
                backgroundPosition: ["0px 0px", `${cell}px ${cell}px`],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--void)]/20 via-transparent to-[var(--void)]"
        aria-hidden
      />
    </div>
  );
}
