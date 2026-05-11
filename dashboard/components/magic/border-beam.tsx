"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type BorderBeamProps = {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
};

/** Magic UI–style traveling glow on card edges (conic rotation). */
export function BorderBeam({
  className,
  size = 220,
  duration = 10,
  delay = 0,
  colorFrom = "#e879f9",
  colorTo = "#22d3ee",
}: BorderBeamProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className,
      )}
    >
      <motion.div
        className="absolute flex items-center justify-center"
        style={{
          width: size,
          height: size,
          left: "50%",
          top: "50%",
          marginLeft: -size / 2,
          marginTop: -size / 2,
        }}
        initial={false}
        animate={reduce ? false : { rotate: 360 }}
        transition={{
          duration: reduce ? 0 : duration,
          repeat: reduce ? 0 : Infinity,
          ease: "linear",
          delay: reduce ? 0 : delay,
        }}
      >
        <div
          className="h-full w-full opacity-90"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 260deg, ${colorFrom} 280deg, ${colorTo} 310deg, transparent 340deg)`,
          }}
        />
      </motion.div>
    </div>
  );
}
