<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Session Build Log (what was done)

### 1) Project path switch
- Work moved from `landing-page/` to `dashboard/`.
- All active implementation is now under `dashboard/`.

### 2) UI/UX overhaul
- Reworked dashboard visuals and motion styling.
- Replaced sidebar-first structure with top-nav flow.
- Implemented wallet-first UX:
  - Connect wallet first
  - Then sign in with Steam

### 3) Steam auth and callback fixes
- Added robust Steam callback handling.
- Redirect handling hardened (`new URL(..., req.url)` style).
- Better Steam ID parsing and callback error paths.

### 4) Database migration path
- Replaced local file DB flow with Supabase client-based data layer.
- Added/used tables:
  - `users`
  - `markets`
  - `streamer_profiles`
  - `pending_rewards`
  - `steam_wallet_bindings`
- Added `supabase/schema.sql` with required table definitions.

### 5) Profile + binding + reward claim flow
- Added profile APIs:
  - `GET /api/profile/me`
  - `GET /api/profile/stats`
  - `POST /api/profile/wallet`
  - `GET/POST /api/profile/binding`
- Added reward APIs:
  - `GET /api/rewards/pending`
  - `POST /api/rewards/claim`
- Implemented Steam-wallet binding checks before reward claim.

### 6) Market resolution + settlement
- Added resolver APIs:
  - `POST /api/markets/resolve`
  - `POST /api/oracle/resolve-due`
  - `POST /api/admin/resolve-due`
- Settlement logic:
  - Resolve market outcome
  - Credit streamer share to pending rewards (`steam_id -> amount`)

### 7) Admin panel
- Added tiny admin page: `/dashboard/admin`
- Button to run due-market resolver and show per-market results.

### 8) On-chain program (Anchor)
- Anchor program exists at:
  - `anchor/programs/prediction_market/src/lib.rs`
- Program deployed to devnet:
  - Program ID: `6Cxu21rFFR6c9f9aYciBimCSD1vA6k1aa9bE64HG5rLF`
- IDL account initialized on-chain.
- Platform config initialized via CLI script.

### 9) On-chain UI wiring progress
- `Issue Challenge` now attempts real `createMarket` transaction.
- `Place Bet` now attempts real `placeBet` transaction.
- Current blocker remains in challenge creation path (see Known Issue).

## Known Issue (current blocker)

### Issue: Challenge creation fails with account/argument mapping error
- User-facing message currently shown:
  - `Challenge transaction failed: invalid on-chain account or argument mapping. Reconnect wallet and retry.`
- This was surfaced after hardening `_bn` crash handling.
- Meaning: one account or argument in `createMarket` flow is still not matching expected on-chain contract shape.

### Next debug target
- Verify `config` account decoding shape and exact `marketCounter` field type returned at runtime.
- Confirm program IDL and client method argument order exactly match deployed binary.
- Confirm PDA seeds in client match deployed program seeds.

## Environment notes
- Required env used in this session:
  - `STEAM_WEB_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `ORACLE_TOKEN` (for resolver/oracle endpoints)
  - optional: `ADMIN_STEAM_IDS` (comma-separated)

## Build status
- Latest `bun run build` passes.
- Runtime issue remains only on `Issue Challenge` create tx path.
