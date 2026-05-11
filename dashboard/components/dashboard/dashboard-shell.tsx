"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WalletButton } from "@/components/wallet/wallet-button";
import { SteamSession } from "@/lib/auth";
import {
  LayoutDashboard,
  Search,
  Trophy,
  LogIn,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";

interface DashboardShellProps {
  user: SteamSession | null;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { href: "/dashboard", label: "Markets", icon: LayoutDashboard },
    { href: "/dashboard/search", label: "Find Streamer", icon: Search },
    { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)] font-body relative">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[var(--border)] bg-[var(--bg-surface)]/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-fg)]">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-display text-xl font-bold leading-none tracking-wide">
              GM
            </span>
            <span className="ml-1 text-[10px] font-mono font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
              markets
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-0.5">
          {nav.map((item, i) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                <motion.div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
                  }`}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border)] p-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-9 w-9 rounded-lg border border-[var(--border)]"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">
                    {user.displayName.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold">{user.displayName}</p>
                <p className="truncate font-mono text-[10px] text-[var(--text-tertiary)]">
                  {user.steamId.slice(0, 6)}...{user.steamId.slice(-4)}
                </p>
              </div>
              <button
                onClick={async () => {
                  await fetch("/api/auth/session", { method: "DELETE" });
                  window.location.reload();
                }}
                className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <a
              href="/api/auth/steam"
              className="btn-primary w-full"
            >
              <LogIn className="h-4 w-4" />
              Sign in with Steam
            </a>
          )}
        </div>
      </aside>

      {/* Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header
          className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] px-4 lg:px-8 transition-colors duration-300 ${
            scrolled ? "bg-[var(--bg)]/80 backdrop-blur-xl" : "bg-transparent"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold tracking-wide">
              {pathname === "/dashboard" && "Markets"}
              {pathname === "/dashboard/search" && "Find Streamer"}
              {pathname === "/dashboard/leaderboard" && "Leaderboard"}
              {pathname.startsWith("/dashboard/market/") && "Market"}
              {pathname.startsWith("/dashboard/streamer/") && "Profile"}
            </h1>
          </div>
          <WalletButton />
        </header>

        <main className="flex-1 p-4 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
