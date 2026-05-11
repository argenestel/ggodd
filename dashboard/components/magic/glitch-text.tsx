"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlitchTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  intensity?: "low" | "medium" | "high";
}

export function GlitchText({
  children,
  className,
  as: Tag = "span",
  intensity = "medium",
}: GlitchTextProps) {
  const reduce = useReducedMotion();
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), intensity === "high" ? 200 : intensity === "medium" ? 120 : 80);
    }, intensity === "high" ? 3000 : intensity === "medium" ? 5000 : 8000);
    return () => clearInterval(interval);
  }, [reduce, intensity]);

  const Component = motion.create(Tag as any);

  return (
    <span className={cn("relative inline-block", className)}>
      <Component
        className="relative z-10"
        animate={
          reduce
            ? {}
            : glitching
              ? {
                  x: [0, -2, 3, -1, 2, 0],
                  skewX: [0, 2, -3, 1, -1, 0],
                }
              : {}
        }
        transition={{ duration: 0.15 }}
      >
        {children}
      </Component>
      {reduce ? null : (
        <>
          <span
            className="pointer-events-none absolute left-0 top-0 z-20 w-full text-[var(--neon-magenta)] opacity-0"
            style={{
              clipPath: "inset(20% 0 60% 0)",
              opacity: glitching ? 0.7 : 0,
              transform: glitching ? "translateX(3px)" : "translateX(0)",
              transition: "opacity 0.05s, transform 0.05s",
            }}
            aria-hidden
          >
            {children}
          </span>
          <span
            className="pointer-events-none absolute left-0 top-0 z-20 w-full text-[var(--accent)] opacity-0"
            style={{
              clipPath: "inset(55% 0 15% 0)",
              opacity: glitching ? 0.7 : 0,
              transform: glitching ? "translateX(-3px)" : "translateX(0)",
              transition: "opacity 0.05s, transform 0.05s",
            }}
            aria-hidden
          >
            {children}
          </span>
        </>
      )}
    </span>
  );
}
