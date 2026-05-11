"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LiveTicker } from "@/components/landing/live-ticker";
import { FloatingCards } from "@/components/landing/floating-cards";
import { ComboMeter } from "@/components/landing/combo-meter";
import { ArenaPillars } from "@/components/landing/arena-pillars";
import { FeaturedStreamers } from "@/components/dashboard/featured-streamers";
import { Zap, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#challengers", label: "Challengers" },
  { href: "#arena", label: "The Arena" },
];

export function GamingLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[var(--bg)]">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Navbar */}
      <motion.header
        className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          scrolled
            ? "border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/ggodd-yellow-horizontal-transparent.png"
              alt="ggodd"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-fg)] transition-all hover:brightness-110"
          >
            Enter Arena
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.header>

      <main>
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative overflow-hidden">
          <div className="hero-gradient-mesh" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
              {/* Left */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)]/80 px-3 py-1.5"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
                    Solana-powered
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="font-display text-4xl font-bold leading-[1.1] tracking-wide sm:text-5xl lg:text-[3.5rem]"
                >
                  Will they
                  <br />
                  <span className="text-[var(--accent)]">unlock it?</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--text-secondary)]"
                >
                  Bet SOL on Steam achievements. Live odds. Instant settlement.
                  The streamer gets paid. No trust required — just on-chain proof.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-7 flex flex-wrap items-center gap-3"
                >
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-wider text-[var(--accent-fg)] transition-all hover:brightness-110"
                  >
                    Start Predicting
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 font-mono text-[12px] font-medium uppercase tracking-wider text-[var(--text)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface)]"
                  >
                    How It Works
                  </a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="mt-9 flex gap-8"
                >
                  {[
                    { value: "<50ms", label: "Settlement" },
                    { value: "1.5%", label: "To Streamer" },
                    { value: "0", label: "House Edge" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="font-display text-xl font-bold text-[var(--text)]">{stat.value}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right: Floating cards */}
              <div className="flex justify-center lg:justify-end">
                <FloatingCards />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />
        </section>

        {/* ═══════════════ LIVE TICKER ═══════════════ */}
        <LiveTicker />

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24 scroll-mt-20">
          <ComboMeter />
        </section>

        {/* ═══════════════ FEATURED CHALLENGERS ═══════════════ */}
        <section
          id="challengers"
          className="border-y border-[var(--border)] bg-[var(--bg-surface)]/30 py-24 scroll-mt-20"
        >
          <div className="mx-auto max-w-6xl px-6">
            <FeaturedStreamers />
          </div>
        </section>

        {/* ═══════════════ ARENA PILLARS ═══════════════ */}
        <section id="arena" className="mx-auto max-w-6xl px-6 py-24 scroll-mt-20">
          <ArenaPillars />
        </section>

        {/* ═══════════════ STUDIO NOTE ═══════════════ */}
        <section className="border-t border-[var(--border)] py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                ggodd Studios
              </span>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                We build the games that fuel the arena. Original projects designed for
                competitive achievement hunting and shareable moments.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2">
                <Zap className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Vibehades — playable soon
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ CTA ═══════════════ */}
        <section className="mx-auto max-w-6xl px-6 pb-24 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]/60 p-10 text-center sm:p-14"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)]/5 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--accent)]/3 blur-[100px]" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-wide sm:text-4xl">
                The arena is open
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-[var(--text-secondary)]">
                Find a streamer. Pick an achievement. Lock your bet.
              </p>
              <Link
                href="/dashboard"
                className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-8 py-3.5 font-mono text-[12px] font-semibold uppercase tracking-wider text-[var(--accent-fg)] transition-all hover:brightness-110"
              >
                Enter the Arena
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)]/30">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center">
              <Image
                src="/ggodd-yellow-square-transparent.png"
                alt="ggodd"
                width={28}
                height={28}
                className="h-7 w-auto"
              />
            </div>
            <nav className="flex items-center gap-6">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] transition-colors hover:text-[var(--text)]"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/dashboard"
                className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--accent)] transition-colors hover:text-[var(--text)]"
              >
                Dashboard
              </Link>
            </nav>
            <p className="font-mono text-[10px] text-[var(--text-dim)]">
              © {new Date().getFullYear()} ggodd Studios
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-center text-[10px] leading-relaxed text-[var(--text-dim)]">
            Not affiliated with Valve Corporation. Steam is a trademark of Valve. Official Steam
            Web API only. Not financial advice. Solana use carries protocol and smart-contract risk.
          </p>
        </div>
      </footer>
    </div>
  );
}
