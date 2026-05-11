"use client";

import { cn } from "@/lib/utils";

interface CodeWindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  language?: string;
}

export function CodeWindow({
  children,
  className,
  title = "api.strawbee.gg",
  language = "json",
}: CodeWindowProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--border)] bg-[#0d1117] shadow-2xl",
        className,
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[#161b22] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="mx-auto font-mono text-[11px] text-[var(--text-tertiary)]">
          {title}
        </span>
        <span className="font-mono text-[10px] text-[var(--text-tertiary)] uppercase">
          {language}
        </span>
      </div>
      {/* Body */}
      <div className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-[#c9d1d9]">
        {children}
      </div>
    </div>
  );
}
