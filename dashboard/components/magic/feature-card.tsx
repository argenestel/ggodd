"use client";

import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 card-hover",
        className,
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--accent)] transition-colors group-hover:border-[var(--accent)]/20 group-hover:bg-[var(--accent-dim)]">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-[var(--text)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  );
}
