"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, User, ChevronRight } from "lucide-react";
import { useDebounce } from "@/lib/hooks";

interface SteamProfile {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
}

interface Props {
  onSelect: (profile: SteamProfile) => void;
  onSearch?: () => void;
}

export function StreamerSearch({ onSelect, onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SteamProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/steam/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.users || []);
      onSearch?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [onSearch]);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Steam user (vanity URL or Steam ID)..."
          autoFocus
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-10 pr-4 text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] transition focus:border-[var(--accent)] focus:outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--accent)]" />
        )}
      </div>

      <div className="space-y-2">
        {results.map((user) => (
          <Link
            key={user.steamid}
            href={`/dashboard/streamer/${user.steamid}`}
            onClick={() => onSelect(user)}
            className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 transition hover:border-[var(--accent)]/50 hover:bg-[var(--bg-elevated)]"
          >
            {user.avatarfull ? (
              <img
                src={user.avatarfull}
                alt=""
                className="h-12 w-12 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--border)]">
                <User className="h-5 w-5 text-[var(--fg-muted)]" />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold group-hover:text-[var(--accent)]">
                {user.personaname}
              </p>
              <p className="truncate text-xs text-[var(--fg-muted)]">{user.steamid}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--fg-muted)] opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}

        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="rounded-xl border border-dashed border-[var(--border)] py-8 text-center">
            <User className="mx-auto mb-2 h-8 w-8 text-[var(--fg-muted)]" />
            <p className="text-sm text-[var(--fg-muted)]">
              No users found. Try a Steam vanity URL or 17-digit Steam ID.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
