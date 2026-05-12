# GGodd

Prediction markets for gaming streamers and speedrunners. Stake SOL on whether a streamer will complete a specific Steam achievement by a deadline. Built on Solana.

ggodd.xyz

---

## Concept

Streamers already attract betting energy. Chat says "if you beat this boss in 90 seconds I will donate $20." But it is honor system, no settlement, and the streamer gets nothing from the action.

GGodd formalizes this into on chain markets:

1. Anyone opens a challenge on a streamer for a specific Steam achievement with a deadline
2. Users bet YES or NO by sending SOL into an escrow
3. After the deadline, an oracle resolves the outcome
4. Winners claim from the pool
5. Streamers earn 1.5% of every pool automatically, regardless of outcome

The streamer gets a revenue share, so they become distribution partners. The platform takes 1.5%. Total take rate is 3% (300 bps).

---

## Architecture

```
User Browser (Next.js)
    |
    |--- Solana Wallet (via wallet-adapter-react)
    |       |
    |       v  transactions
    |   Anchor Program (Solana devnet)
    |       |   Program ID: 6Cxu21rFFR6c9f9aYciBimCSD1vA6k1aa9bE64HG5rLF
    |       |   PDAs: config, market, escrow, bet
    |       v
    |   On chain: markets, bets, escrow balances, resolution
    |
    |--- Next.js API Routes
    |       |
    |       v  reads/writes
    |   Supabase (PostgreSQL)
    |       Tables: users, markets, streamer_profiles,
    |               pending_rewards, steam_wallet_bindings
    |
    |--- Steam Web API
            User identity, achievements, streamer search
```

There are two data layers that stay in sync:

- **On chain (Anchor/Solana):** Market creation, betting, escrow, resolution, claiming. This is where value moves.
- **Off chain (Supabase):** Market metadata (streamer name, game name, achievement description), user profiles, streamer profiles, pending reward tracking. This is where discovery and UX live.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, TypeScript |
| Styling | Tailwind CSS, custom CSS variables |
| Animation | Framer Motion |
| On chain | Solana, Anchor framework 0.32, Rust |
| Off chain DB | Supabase (PostgreSQL) |
| Auth | Steam OAuth (NextAuth), Solana wallet |
| Client SDK | @coral-xyz/anchor, @solana/web3.js |
| Wallet | wallet-adapter-react, wallet-adapter-wallets |
| Icons | lucide-react |
| Runtime | Bun |
| IDL | Anchor IDL (lib/idl.json) |

---

## Project Structure

```
dashboard/
  anchor/
    programs/prediction_market/src/lib.rs   # Solana Anchor program (Rust)
    Anchor.toml                              # Anchor config
  app/
    api/
      admin/resolve-due/route.ts            # Admin trigger for due market resolution
      auth/session/route.ts                 # Session management
      auth/steam/route.ts                   # Steam login redirect
      auth/steam/callback/route.ts          # Steam OAuth callback
      bets/route.ts                         # Bet placement + history
      featured/route.ts                     # Featured streamers
      markets/route.ts                      # Market CRUD
      markets/resolve/route.ts              # Single market resolution
      oracle/resolve-due/route.ts           # Oracle resolve all due markets
      profile/me/route.ts                   # Current user profile
      profile/stats/route.ts                # User stats
      profile/wallet/route.ts               # Wallet management
      profile/binding/route.ts              # Steam wallet binding
      rewards/pending/route.ts              # Pending streamer rewards
      rewards/claim/route.ts                # Claim streamer rewards
      steam/achievements/route.ts           # Steam achievement lookup
      steam/profile/[steamId]/route.ts      # Steam profile lookup
      steam/search/route.ts                 # Streamer search
      waitlist/route.ts                     # Waitlist signup
    dashboard/
      page.tsx                              # Main markets feed
      market/[address]/page.tsx             # Single market detail + bet panel
      streamer/[steamId]/page.tsx           # Streamer profile page
      search/page.tsx                       # Find streamers
      profile/page.tsx                      # User profile
      leaderboard/page.tsx                  # Leaderboard
      admin/page.tsx                        # Admin panel
    components/waitlist-form.tsx            # Landing page waitlist
    layout.tsx                              # Root layout
    page.tsx                                # Landing page
    globals.css                             # Global styles
  components/
    dashboard/                              # Dashboard components
      dashboard-shell.tsx                   # Main layout shell (header, nav)
      market-card.tsx                       # Market preview card
      bet-panel.tsx                         # Betting UI
      create-market-modal.tsx               # "Issue Challenge" modal
      challenge-modal.tsx                   # Challenge creation
      streamer-search.tsx                   # Streamer search UI
      streamer-profile-client.tsx           # Streamer profile client
      featured-streamers.tsx                # Featured streamers widget
    landing/                                # Landing page components
    magic/                                  # Decorative/magic UI components
    motion/                                 # Motion/animation components
    ui/                                     # Base UI primitives
    wallet/                                 # Wallet integration
      wallet-provider.tsx                   # Solana wallet context provider
      wallet-button.tsx                     # Wallet connect button
  lib/
    auth.ts                                 # Steam session helpers
    db.ts                                   # Supabase query functions
    hooks.ts                                # Custom React hooks
    idl.json                                # Anchor IDL (deployed program)
    idl.ts                                  # IDL type exports
    market-display.ts                       # Market display helpers
    market-enrich.ts                        # Market enrichment logic
    market-labels.ts                        # Label formatting
    solana.ts                               # Solana connection helpers
    steam.ts                                # Steam API client
    supabase.ts                             # Supabase client init
    utils.ts                                # General utilities
  supabase/
    schema.sql                              # Database schema DDL
  scripts/
    init-platform.ts                        # One-time on-chain platform init
  public/                                   # Static assets (logos, icons)
  data/
    app-db.json                             # Legacy local DB (deprecated)
    featured-streamers.ts                   # Featured streamers data
  .env.local                                # Environment variables (gitignored)
```

---

## Smart Contract (Anchor Program)

File: `anchor/programs/prediction_market/src/lib.rs`
Program ID: `6Cxu21rFFR6c9f9aYciBimCSD1vA6k1aa9bE64HG5rLF`

### Instructions

| Instruction | Description |
|---|---|
| `initialize_platform` | Set admin and platform fee wallet. One time. |
| `create_market` | Create a prediction market. Args: streamer_steam_id, achievement_id, achievement_name, achievement_description, deadline, streamer_fee_recipient. |
| `place_bet` | Place a YES or NO bet on a market. Transfers SOL to escrow. |
| `resolve_market` | Oracle resolves market after deadline. Distributes platform fee and streamer fee immediately. |
| `claim_winnings` | Winning users claim their share of the pool. |
| `update_admin` | Change admin key. |
| `update_platform_fee_wallet` | Change fee wallet. |

### Accounts (PDAs)

| Account | Seeds | Description |
|---|---|---|
| `Config` | `["config"]` | Platform config: admin, fee wallet, market counter |
| `Market` | `["market", creator, market_counter]` | Market state: creator, streamer, achievement, deadline, totals, outcome |
| `Escrow` | `["escrow", market]` | Holds SOL for the market pool (not a separate account, derived PDA) |
| `Bet` | `["bet", market, user]` | User bet: amount, side (Yes/No), claimed status |

### Fee Model

- Platform fee: 150 bps (1.5%) -> sent to `config.platform_fee_wallet`
- Streamer fee: 150 bps (1.5%) -> sent to `market.streamer_fee_recipient`
- Total: 300 bps (3%)
- Fees taken at resolution, before winner payout
- Winner payout: proportional share of remaining pool (total pool minus fees)

---

## Database (Supabase)

File: `supabase/schema.sql`

### Tables

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Steam authed users | steam_id (PK), display_name, avatar_url |
| `markets` | Market metadata | market_address (unique), streamer info, achievement, deadline, resolved, totals |
| `streamer_profiles` | Streamer wallet info | steam_id (PK), display_name, wallet_address |
| `pending_rewards` | Streamer fee payouts | market_address, steam_id, amount_sol, status (pending/claimed) |
| `steam_wallet_bindings` | Wallet identity binding | steam_id (PK), wallet_address, verified_at |

---

## API Routes

| Method | Path | Purpose |
|---|---|---|
| GET | /api/markets | List all markets |
| POST | /api/markets | Create market (off chain record) |
| POST | /api/markets/resolve | Resolve a single market |
| GET | /api/bets | List bets for a market or user |
| GET | /api/featured | Featured streamers |
| POST | /api/admin/resolve-due | Admin: resolve all due markets |
| POST | /api/oracle/resolve-due | Oracle: resolve all due markets |
| GET | /api/profile/me | Current user profile |
| GET | /api/profile/stats | Current user stats |
| POST | /api/profile/wallet | Update user wallet |
| GET/POST | /api/profile/binding | Steam wallet binding |
| GET | /api/rewards/pending | Pending streamer rewards |
| POST | /api/rewards/claim | Claim streamer reward |
| GET | /api/auth/steam | Initiate Steam OAuth |
| GET | /api/auth/steam/callback | Steam OAuth callback |
| DELETE | /api/auth/session | Logout |
| GET | /api/steam/search | Search streamers |
| GET | /api/steam/achievements | Get streamer achievements |
| GET | /api/steam/profile/:steamId | Get Steam profile |
| POST | /api/waitlist | Join waitlist |

---

## Getting Started

### Prerequisites

- Bun
- Node.js 18+
- Solana CLI (for Anchor development)

### Environment Variables

Copy `.env.local` template:

```
STEAM_WEB_API_KEY=         # From Steam partner site
NEXT_PUBLIC_SUPABASE_URL=   # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # Supabase anon key
ORACLE_TOKEN=               # Token for oracle endpoints
ADMIN_STEAM_IDS=            # Optional: comma separated admin Steam IDs
```

### Install & Run

```bash
cd dashboard
bun install
bun run dev
```

Open http://localhost:3000.

### Build

```bash
bun run build
```

Latest build status: PASSES.

---

## Current Status

**Working:**
- UI dashboard with markets feed, search, profile, leaderboard, admin panel
- Wallet connection (Solana)
- Steam auth (OAuth flow + session)
- Steam wallet binding
- Supabase data layer for markets, users, streamers, rewards
- Market resolution via oracle/admin endpoints (off chain + on chain)
- Reward claim flow for streamers
- Anchor program deployed on devnet
- Platform config initialized on chain
- Place Bet attempts real on chain transaction

**Not working:**
- Challenge creation (createMarket transaction) fails with account/argument mapping error. The button fires a real transaction but the client is sending accounts or arguments that do not match the deployed program.

---

## Known Blocker

**Issue:** Create Market transaction fails. User sees:
> "Challenge transaction failed: invalid on chain account or argument mapping. Reconnect wallet and retry."

**Debug targets:**
- Verify config account decoding shape and marketCounter field type at runtime
- Confirm program IDL and client method argument order match deployed binary
- Confirm PDA seeds in client match deployed program seeds

---

## FAQ for AI Agents

### What is this project?
A Solana prediction market platform for Steam gaming streamers. Users create challenge markets tied to specific Steam achievements, bet SOL on yes/no outcomes, and get paid when resolved.

### What problem does it solve?
Speedrunning and streaming communities already create informal betting pools around challenges (donation bounties, chat bets). These are manual, trust based, and unenforced. GGodd provides automatic escrow, settlement, and streamer revenue sharing.

### Who is the target user?
Streamers, speedrunners, and their audiences. The product is built for gaming culture.

### What is the business model?
1.5% platform fee on every market pool. Streamers earn 1.5% separately. Total 3% take rate.

### Where is the program deployed?
Solana devnet. Program ID: `6Cxu21rFFR6c9f9aYciBimCSD1vA6k1aa9bE64HG5rLF`.

### What is the current blocker?
The createMarket transaction fails with an account/argument mapping error. The on chain program is deployed and the client is wired up, but the argument shape does not match.

### What framework is the frontend?
Next.js 15 with the App Router. Uses Turbopack.

### What is the runtime?
Bun.

### What database is used?
Supabase PostgreSQL for off chain metadata. On chain state lives in the Solana program.

### Is there a token?
No. No plans for a token.
