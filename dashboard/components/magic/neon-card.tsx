"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BorderBeam } from "./border-beam";

type NeonCardProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  beam?: boolean;
  beamFrom?: string;
  beamTo?: string;
  hover?: boolean;
};

export function NeonCard({
  children,
  className,
  innerClassName,
  beam = true,
  beamFrom,
  beamTo,
  hover = true,
}: NeonCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn("relative overflow-hidden rounded-xl", className)}
      whileHover={
        !reduce && hover
          ? { y: -4, transition: { type: "spring", stiffness: 440, damping: 26 } }
          : undefined
      }
    >
      <div className="absolute inset-0 rounded-xl" aria-hidden>
        {beam ? (
          <BorderBeam
            duration={14}
            colorFrom={beamFrom ?? "#d946ef"}
            colorTo={beamTo ?? "#22d3ee"}
          />
        ) : null}
      </div>
      <div
        className={cn(
          "relative z-10 rounded-xl border border-white/[0.07] bg-[color-mix(in_oklab,var(--elevated)_97%,transparent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm",
          beam ? "m-[1.5px] rounded-[10px]" : "",
          innerClassName,
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
