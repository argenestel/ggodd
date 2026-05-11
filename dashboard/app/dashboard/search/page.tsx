"use client";

import { useState } from "react";
import Link from "next/link";
import { StreamerSearch } from "@/components/dashboard/streamer-search";
import { Search, Sparkles } from "lucide-react";

export default function SearchPage() {
  const [hasSearched, setHasSearched] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find a Streamer</h1>
        <p className="mt-2 text-[var(--fg-muted)]">
          Search by Steam vanity URL or Steam64 ID. Issue challenges on their achievements.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <StreamerSearch
          onSelect={() => {}}
          onSearch={() => setHasSearched(true)}
        />
      </div>

      {!hasSearched && (
        <div className="grid gap-4 sm:grid-cols-3">
          <TipCard
            icon={<Search className="h-5 w-5 text-[var(--accent)]" />}
            title="Search"
            desc="Enter a Steam vanity URL (e.g., 'gaben') or a 17-digit Steam ID."
          />
          <TipCard
            icon={<Sparkles className="h-5 w-5 text-[var(--accent)]" />}
            title="Pick Achievement"
            desc="Browse their game library and choose an unearned achievement."
          />
          <TipCard
            icon={<span className="text-lg font-bold text-[var(--accent)]">3%</span>}
            title="Set Terms"
            desc="Choose deadline and submit SOL. 1.5% goes to the streamer."
          />
        </div>
      )}
    </div>
  );
}

function TipCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
      <div className="mb-3 flex justify-center">{icon}</div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-[var(--fg-muted)]">{desc}</p>
    </div>
  );
}
