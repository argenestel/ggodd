"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { WalletButton } from "@/components/wallet/wallet-button";
import { useSolanaWallet } from "@/components/wallet/wallet-provider";
import { SteamSession } from "@/lib/auth";
import {
  LayoutDashboard,
  Search,
  Trophy,
  User,
  Shield,
  LogIn,
  LogOut,
  Zap,
  ShieldCheck,
} from "lucide-react";

interface DashboardShellProps {
  user: SteamSession | null;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const { connected } = useSolanaWallet();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { href: "/dashboard", label: "Markets", icon: LayoutDashboard },
    { href: "/dashboard/search", label: "Find Streamer", icon: Search },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-body relative">
      {/* Noise overlay */}
      <div className="noise-overlay" />
      <div className="flex min-h-screen flex-col min-w-0">
        <header
          className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] px-4 lg:px-8 transition-colors duration-300 ${
            scrolled ? "bg-[var(--bg)]/80 backdrop-blur-xl" : "bg-transparent"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-fg)]">
              <Zap className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg tracking-wide">ggodd</span>
            <nav className="hidden md:flex items-center gap-1 ml-2">
              {nav.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                        active
                          ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <WalletButton />
            {user ? (
              <>
                <span className="hidden sm:inline text-xs text-[var(--text-secondary)]">
                  {user.displayName}
                </span>
                <button
                  onClick={async () => {
                    await fetch("/api/auth/session", { method: "DELETE" });
                    window.location.reload();
                  }}
                  className="rounded-lg p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : connected ? (
              <a href="/api/auth/steam" className="btn-primary">
                <LogIn className="h-4 w-4" />
                Sign in with Steam
              </a>
            ) : (
              <button className="btn-ghost" disabled>
                <ShieldCheck className="h-4 w-4" />
                Connect wallet first
              </button>
            )}
          </div>
        </header>

        {!connected && (
          <div className="border-b border-[var(--border)] bg-[var(--bg-surface)]/80 px-4 py-2 text-xs text-[var(--text-secondary)]">
            Connect wallet first, then sign in with Steam.
          </div>
        )}

        {connected && !user && (
          <div className="border-b border-[var(--border)] bg-[var(--accent-dim)]/40 px-4 py-2 text-xs text-[var(--text-secondary)]">
            Wallet connected. Next step: sign in with Steam.
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
