"use client";

import { motion, useReducedMotion } from "framer-motion";
import { WaitlistForm } from "@/app/components/waitlist-form";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionHeader } from "@/components/motion/section-header";
import { LiveFeed } from "@/components/magic/live-feed";
import { ModuleCard } from "@/components/magic/module-card";
import { Badge } from "@/components/magic/badge";
import { CodeWindow } from "@/components/magic/code-window";

const navLinks = [
  { href: "#studio", label: "Our Studio" },
  { href: "#games", label: "Games" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "Pipeline" },
  { href: "#api", label: "API" },
];

const games = [
  {
    title: "Vibehades",
    description:
      "A fast social game from Strawbee Studios, built for lightweight competition and shareable match moments.",
    href: "https://vibehades.strawbee.gg",
    status: "Playable soon",
  },
];

const modules = [
  {
    title: "Steam Verification",
    description: "OAuth 2.0 linking with scoped Web API reads. Zero password storage.",
    metric: "100%",
    metricLabel: "API verified",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "On-Chain Receipts",
    description: "Tamper-evident Solana attestations. Query by player, tournament, or time.",
    metric: "312M+",
    metricLabel: "Slots indexed",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Reward Rails",
    description: "Build bounty flows and tournament payouts tied to verified milestones.",
    metric: "0",
    metricLabel: "Vaporware promises",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Developer API",
    description: "REST endpoints, webhooks, clear schemas. Drop into your stack in hours.",
    metric: "<50ms",
    metricLabel: "Avg response",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Privacy-First",
    description: "Achievement IDs + timestamps by default. Broader reads are opt-in only.",
    metric: "0",
    metricLabel: "Data leaks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Audit Logging",
    description: "Every verification job leaves a trail. Idempotent pulls. Replay guards.",
    metric: "∞",
    metricLabel: "Retention",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const pipelineSteps = [
  {
    step: "01",
    title: "Link Steam",
    description: "Player authorizes scoped API access via OAuth. No passwords. Ever.",
  },
  {
    step: "02",
    title: "Verify Unlocks",
    description: "Jobs poll the Steam Web API for achievements your rulebook defines.",
  },
  {
    step: "03",
    title: "Mint Receipt",
    description: "Tamper-evident attestation on Solana. Query it directly from your app.",
  },
];

const roadmapItems = [
  {
    phase: "MVP",
    detail: "Manual + webhook verification. Signed payloads. Scope-consent UX.",
    status: "completed" as const,
  },
  {
    phase: "Automation",
    detail: "Scheduled verifiers, replay guards, DSL for challenge hosts.",
    status: "active" as const,
  },
  {
    phase: "Reward Rails",
    detail: "Escrow payouts when contracts pass audit. No vaporware.",
    status: "upcoming" as const,
  },
];

function PipelineConnector({ delay = 0 }: { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="hidden lg:flex items-center justify-center">
      <motion.div
        className="h-px w-12 bg-[var(--border)]"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={reduce ? undefined : { scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
      />
      <motion.div
        className="text-[var(--accent)]/40"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={reduce ? undefined : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.2 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </div>
  );
}

export function GamingLanding() {
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Skip link */}
      <a
        href="#main"
        className="fixed left-4 top-0 z-[100] -translate-y-24 rounded-md bg-[var(--accent)] px-3 py-2 font-mono text-sm font-medium text-[var(--bg)] opacity-0 pointer-events-none transition focus:pointer-events-auto focus:translate-y-4 focus:opacity-100"
      >
        Skip to content
      </a>

      {/* Navbar */}
      <motion.header
        className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-xl"
        initial={reduce ? false : { y: -12, opacity: 0 }}
        animate={reduce ? undefined : { y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <a href="#" className="flex items-center gap-2.5 font-display text-lg font-bold text-[var(--text)]">
            <span className="flex h-6 w-6 items-center justify-center rounded border border-[var(--accent)]/30 bg-[var(--accent-dim)] font-mono text-[10px] text-[var(--accent)]">
              S
            </span>
            Strawbee
          </a>
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-6 font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-[var(--text)]">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="hidden rounded-md border border-[var(--border)] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--text)] transition hover:border-[var(--accent)]/50 sm:block"
            >
              Dashboard
            </a>
            <a
              href="#waitlist"
              className="rounded-md bg-[var(--accent)] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--bg)] transition-opacity hover:opacity-90"
            >
              Get access
            </a>
          </div>
        </div>
      </motion.header>

      <main id="main">
        {/* Hero */}
        <section
          className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 md:pb-24 md:pt-28"
          aria-labelledby="hero-heading"
        >
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
            {/* Left */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2">
                <Badge variant="accent">Beta</Badge>
                <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
                  v0.4.2 — devnet
                </span>
              </div>

              <h1
                id="hero-heading"
                className="font-display mt-6 text-[clamp(2.2rem,5.5vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-[var(--text)]"
              >
                Achievement verification{" "}
                <span className="text-[var(--accent)]">for competitive gaming</span>
              </h1>

              <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-[var(--text-secondary)] [text-wrap:balance]">
                Turn Steam unlocks into on-chain receipts that tournament organizers,
                sponsors, and bounty hosts can trust — without storing a single password.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#api"
                  className="inline-flex h-10 items-center rounded-md bg-[var(--accent)] px-5 font-mono text-[12px] font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
                >
                  Read the docs
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-5 font-mono text-[12px] font-medium text-[var(--text)] transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface)]"
                >
                  See the pipeline
                </a>
              </div>

              {/* Mini stats */}
              <div className="mt-10 flex gap-8">
                {[
                  { value: "<50ms", label: "Response" },
                  { value: "100%", label: "API verified" },
                  { value: "0", label: "Passwords stored" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-xl font-bold text-[var(--text)]">{stat.value}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Live Feed */}
            <LiveFeed />
          </div>
        </section>

        {/* Trust bar */}
        <div className="border-y border-[var(--border)] bg-[var(--bg-surface)]/50 py-4">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
              Built for tournament organizers · bounty hosts · competitive platforms · sponsor campaigns
            </p>
          </div>
        </div>

        {/* Studio */}
        <FadeIn delay={0.05}>
          <section
            id="studio"
            className="mx-auto max-w-6xl px-4 py-24 sm:px-6 scroll-mt-20"
            aria-labelledby="studio-heading"
          >
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
              <div>
                <SectionHeader label="Our Studio" />
                <h2
                  id="studio-heading"
                  className="font-display mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-[var(--text)]"
                >
                  We make game infrastructure and original games
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Verification rails",
                    detail:
                      "Tools for competitive communities that need trusted player progress, rewards, and receipts.",
                  },
                  {
                    title: "Playable worlds",
                    detail:
                      "Small, focused games that give the platform real player loops to support from day one.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6"
                  >
                    <h3 className="font-display text-base font-semibold text-[var(--text)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Games */}
        <FadeIn delay={0.05}>
          <section
            id="games"
            className="border-t border-[var(--border)] bg-[var(--bg-surface)]/30 py-24 scroll-mt-20"
            aria-labelledby="games-heading"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionHeader label="Games" />
                  <h2
                    id="games-heading"
                    className="font-display mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-[var(--text)]"
                  >
                    Games from Strawbee Studios
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
                  Original projects that connect back into the same achievement and reward stack.
                </p>
              </div>
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game, i) => (
                  <motion.a
                    key={game.title}
                    href={game.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ delay: i * 0.08, duration: 0.45 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                          {game.status}
                        </p>
                        <h3 className="font-display mt-3 text-xl font-bold text-[var(--text)]">
                          {game.title}
                        </h3>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-secondary)] transition-colors group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)]">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M7 17L17 7" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {game.description}
                    </p>
                    <p className="mt-6 font-mono text-[11px] text-[var(--text-tertiary)]">
                      {game.href.replace("https://", "")}
                    </p>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Features */}
        <FadeIn delay={0.05}>
          <section
            id="features"
            className="mx-auto max-w-6xl px-4 py-24 sm:px-6 scroll-mt-20"
            aria-labelledby="features-heading"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionHeader label="Platform" />
                <h2
                  id="features-heading"
                  className="font-display mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-[var(--text)]"
                >
                  Everything you need
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
                A complete stack from OAuth linking to on-chain attestations.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((m, i) => (
                <ModuleCard key={m.title} {...m} delay={i * 0.06} />
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Pipeline */}
        <FadeIn delay={0.05}>
          <section
            id="how-it-works"
            className="border-t border-[var(--border)] bg-[var(--bg-surface)]/30 py-24 scroll-mt-20"
            aria-labelledby="pipeline-heading"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <SectionHeader label="Pipeline" />
              <h2
                id="pipeline-heading"
                className="font-display mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-[var(--text)]"
              >
                Three steps. No hand-waving.
              </h2>

              <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
                {pipelineSteps.map((s, i) => (
                  <div key={s.step} className="contents">
                    <motion.div
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6"
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                        Step {s.step}
                      </span>
                      <h3 className="font-display mt-3 text-lg font-semibold text-[var(--text)]">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                        {s.description}
                      </p>
                    </motion.div>
                    {i < 2 && <PipelineConnector delay={i * 0.15 + 0.2} />}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* API */}
        <FadeIn delay={0.05}>
          <section
            id="api"
            className="mx-auto max-w-6xl px-4 py-24 sm:px-6 scroll-mt-20"
            aria-labelledby="api-heading"
          >
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
              <div>
                <SectionHeader label="API" />
                <h2
                  id="api-heading"
                  className="font-display mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-[var(--text)]"
                >
                  Drop it into your stack
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Clear REST endpoints, predictable JSON schemas, and webhooks for
                  real-time events. No SDK lock-in.
                </p>
                <div className="mt-8 space-y-3">
                  {[
                    "OAuth 2.0 Steam linking flow",
                    "Webhook delivery with exponential backoff",
                    "Solana receipt lookup by player or tournament",
                    "Idempotent verification jobs",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                        <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <CodeWindow title="curl api.strawbee.gg/v1/verify" language="bash">
                  <pre className="whitespace-pre">
{`<span class="syntax-comment"># Verify an achievement for a linked player</span>
<span class="syntax-function">curl</span> <span class="syntax-string">-X POST</span> \\
  <span class="syntax-string">https://api.strawbee.gg/v1/achievements/verify</span> \\
  <span class="syntax-string">-H</span> <span class="syntax-string">"Authorization: Bearer $API_KEY"</span> \\
  <span class="syntax-string">-H</span> <span class="syntax-string">"Content-Type: application/json"</span> \\
  <span class="syntax-string">-d</span> <span class="syntax-string">'{
    "player_id": "usr_2k9x...",
    "achievement_id": "ACH_WIN_GUNGAME",
    "tournament_id": "trn_8f3a..."
  }'</span>`}
                  </pre>
                </CodeWindow>
              </motion.div>
            </div>
          </section>
        </FadeIn>

        {/* Roadmap */}
        <FadeIn delay={0.05}>
          <section
            id="roadmap"
            className="border-t border-[var(--border)] bg-[var(--bg-surface)]/30 py-24 scroll-mt-20"
            aria-labelledby="roadmap-heading"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <SectionHeader label="Roadmap" />
              <h2
                id="roadmap-heading"
                className="font-display mt-4 text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight text-[var(--text)]"
              >
                Where we&apos;re headed
              </h2>
              <div className="mt-12 max-w-xl">
                <div className="relative">
                  <div className="absolute left-[19px] top-5 bottom-5 w-px bg-[var(--border)]" />
                  {roadmapItems.map((item, i) => (
                    <motion.div
                      key={item.phase}
                      className="relative flex gap-5 pb-10 last:pb-0"
                      initial={reduce ? false : { opacity: 0, x: -12 }}
                      whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ delay: i * 0.1, duration: 0.45 }}
                    >
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-bold ${
                          item.status === "completed"
                            ? "border-[var(--success)] bg-[var(--success)] text-[var(--bg)]"
                            : item.status === "active"
                              ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]"
                              : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-tertiary)]"
                        }`}
                      >
                        {item.status === "completed" ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-base font-semibold text-[var(--text)]">
                            {item.phase}
                          </h3>
                          {item.status === "active" && (
                            <Badge variant="accent">In progress</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                          {item.detail}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.05}>
          <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 sm:p-12">
              <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[var(--text)] sm:text-3xl">
                    Stop trusting screenshots
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                    Join the waitlist. We&apos;ll reach out when we&apos;re ready for early tournament partners.
                  </p>
                </div>
                <a
                  href="#waitlist"
                  className="inline-flex h-10 shrink-0 items-center rounded-md bg-[var(--accent)] px-5 font-mono text-[12px] font-semibold text-[var(--bg)] transition-opacity hover:opacity-90"
                >
                  Get early access
                </a>
              </div>
              <div id="waitlist" className="mt-10 scroll-mt-28">
                <WaitlistForm />
              </div>
            </div>
          </section>
        </FadeIn>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border)] bg-[var(--bg-surface)]/50 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <p className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text)]">
                <span className="flex h-6 w-6 items-center justify-center rounded border border-[var(--accent)]/30 bg-[var(--accent-dim)] font-mono text-[10px] text-[var(--accent)]">
                  S
                </span>
                Strawbee
              </p>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-[var(--text-tertiary)]">
                Not affiliated with Valve Corporation. Steam is a trademark of Valve.
                Official Steam Web API only. Not financial advice. Solana use carries
                protocol and smart-contract risk.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                Platform
              </p>
              <ul className="mt-4 space-y-2.5">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--text)]"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
                Contact
              </p>
              <div className="mt-4 space-y-2.5">
                <p className="text-sm text-[var(--text-tertiary)]">
                  <a
                    href="mailto:hello@strawbee.example"
                    className="text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-2 transition-colors hover:decoration-[var(--accent)]"
                  >
                    hello@strawbee.example
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
            <p className="font-mono text-xs text-[var(--text-tertiary)]">
              © {new Date().getFullYear()} Strawbee Studios
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
