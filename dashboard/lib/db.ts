import { getSupabase } from "@/lib/supabase";

function must<T>(value: T | null, err: { message?: string } | null) {
  if (err) throw new Error(err.message || "Supabase error");
  if (value === null) throw new Error("Supabase returned null");
  return value;
}

export async function initDb() {
  // No-op for Supabase mode. Tables should be created in Supabase.
  return;
}

function db() {
  return getSupabase();
}

function sdb(): any {
  return db() as any;
}

type MarketInsert = {
  market_address: string;
  creator_steam_id: string;
  streamer_steam_id: string;
  streamer_name: string | null;
  streamer_avatar_url: string | null;
  game_name: string | null;
  game_app_id: number | null;
  achievement_id: string;
  achievement_name: string;
  achievement_description: string | null;
  deadline: number;
  total_yes_sol: number;
  total_no_sol: number;
};

const OPTIONAL_MARKET_COLUMNS = [
  "streamer_name",
  "streamer_avatar_url",
  "game_name",
  "game_app_id",
  "achievement_description",
] as const;

function isMissingSchemaCacheColumn(error: { message?: string; code?: string } | null) {
  return (
    error?.code === "PGRST204" ||
    error?.message?.includes("Could not find the") ||
    error?.message?.includes("schema cache")
  );
}

function withoutOptionalMarketColumns(row: MarketInsert) {
  const fallback: Partial<MarketInsert> = { ...row };
  for (const column of OPTIONAL_MARKET_COLUMNS) {
    delete fallback[column];
  }
  return fallback;
}

export async function upsertUser(row: {
  steam_id: string;
  display_name: string;
  avatar_url: string | null;
}) {
  const { error } = await sdb().from("users").upsert(row, { onConflict: "steam_id" });
  if (error) throw error;
}

export async function insertMarket(row: MarketInsert) {
  const { error } = await sdb().from("markets").insert(row);
  if (!error) return;
  if (!isMissingSchemaCacheColumn(error)) throw error;

  const { error: fallbackError } = await sdb().from("markets").insert(withoutOptionalMarketColumns(row));
  if (fallbackError) throw fallbackError;
}

export async function listMarkets(filters: {
  streamerId?: string | null;
  resolved?: string | null;
  address?: string | null;
}) {
  let query = sdb().from("markets").select("*").order("created_at", { ascending: false });

  if (filters.address) query = query.eq("market_address", filters.address);
  if (filters.streamerId) query = query.eq("streamer_steam_id", filters.streamerId);
  if (filters.resolved !== null && filters.resolved !== undefined) {
    const parsed = Number(filters.resolved);
    if (!Number.isNaN(parsed)) query = query.eq("resolved", parsed);
  }

  const { data, error } = await query;
  return must(data, error);
}

export async function addBetToMarket(marketAddress: string, side: "yes" | "no", amountSol: number) {
  const { data: existing, error: existingErr } = await sdb()
    .from("markets")
    .select("id,total_yes_sol,total_no_sol")
    .eq("market_address", marketAddress)
    .maybeSingle();
  if (existingErr) throw existingErr;
  if (!existing) throw new Error("Market not found");

  const patch =
    side === "yes"
      ? { total_yes_sol: Number(existing.total_yes_sol || 0) + amountSol }
      : { total_no_sol: Number(existing.total_no_sol || 0) + amountSol };

  const { error } = await sdb().from("markets").update(patch).eq("id", existing.id);
  if (error) throw error;
}

export async function upsertStreamerProfile(
  steamId: string,
  displayName: string,
  walletAddress: string | null
) {
  const { error } = await sdb().from("streamer_profiles").upsert(
    {
      steam_id: steamId,
      display_name: displayName,
      wallet_address: walletAddress,
      updated_at: Math.floor(Date.now() / 1000),
    },
    { onConflict: "steam_id" }
  );
  if (error) throw error;
}

export async function getStreamerProfile(steamId: string): Promise<any | null> {
  const { data, error } = await sdb()
    .from("streamer_profiles")
    .select("*")
    .eq("steam_id", steamId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPendingReward(marketAddress: string, steamId: string, amountSol: number) {
  if (amountSol <= 0) return;
  const { data: existing, error: existingErr } = await sdb()
    .from("pending_rewards")
    .select("id")
    .eq("market_address", marketAddress)
    .eq("steam_id", steamId)
    .limit(1);
  if (existingErr) throw existingErr;
  if (existing && existing.length > 0) return;

  const { error } = await sdb().from("pending_rewards").insert({
    market_address: marketAddress,
    steam_id: steamId,
    amount_sol: amountSol,
    status: "pending",
    claimed_wallet: null,
    claimed_at: null,
  });
  if (error) throw error;
}

export async function listPendingRewards(steamId: string) {
  const { data, error } = await sdb()
    .from("pending_rewards")
    .select("*")
    .eq("steam_id", steamId)
    .order("created_at", { ascending: false });
  return must(data, error);
}

export async function claimPendingRewards(steamId: string, walletAddress: string) {
  const { data: pending, error: pendingErr } = await sdb()
    .from("pending_rewards")
    .select("id,amount_sol")
    .eq("steam_id", steamId)
    .eq("status", "pending");
  if (pendingErr) throw pendingErr;

  const rows: any[] = pending || [];
  const total = rows.reduce((sum: number, r: any) => sum + Number(r.amount_sol), 0);
  const count = rows.length;
  if (count === 0) return { total: 0, count: 0 };

  const ids = rows.map((r) => r.id);
  const { error } = await sdb()
    .from("pending_rewards")
    .update({
      status: "claimed",
      claimed_wallet: walletAddress,
      claimed_at: Math.floor(Date.now() / 1000),
    })
    .in("id", ids);
  if (error) throw error;

  return { total, count };
}

export async function getProfileStats(steamId: string) {
  const [marketsRes, rewardsRes] = await Promise.all([
    sdb().from("markets").select("resolved,total_yes_sol,total_no_sol").eq("streamer_steam_id", steamId),
    sdb().from("pending_rewards").select("status,amount_sol").eq("steam_id", steamId),
  ]);

  if (marketsRes.error) throw marketsRes.error;
  if (rewardsRes.error) throw rewardsRes.error;

  const markets = marketsRes.data || [];
  const rewards = rewardsRes.data || [];

  const totalVolume = markets.reduce(
    (sum: number, m: any) => sum + Number(m.total_yes_sol || 0) + Number(m.total_no_sol || 0),
    0
  );

  const pendingRewards = rewards
    .filter((r: any) => r.status === "pending")
    .reduce((sum: number, r: any) => sum + Number(r.amount_sol || 0), 0);

  const claimedRewards = rewards
    .filter((r: any) => r.status === "claimed")
    .reduce((sum: number, r: any) => sum + Number(r.amount_sol || 0), 0);

  return {
    totalMarkets: markets.length,
    activeMarkets: markets.filter((m: any) => Number(m.resolved) === 0).length,
    resolvedMarkets: markets.filter((m: any) => Number(m.resolved) === 1).length,
    totalVolume,
    pendingRewards,
    claimedRewards,
  };
}

export async function upsertSteamWalletBinding(steamId: string, walletAddress: string) {
  const { error } = await sdb().from("steam_wallet_bindings").upsert(
    {
      steam_id: steamId,
      wallet_address: walletAddress,
      verified_at: Math.floor(Date.now() / 1000),
    },
    { onConflict: "steam_id" }
  );
  if (error) throw error;
}

export async function getSteamWalletBinding(steamId: string): Promise<any | null> {
  const { data, error } = await sdb()
    .from("steam_wallet_bindings")
    .select("*")
    .eq("steam_id", steamId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMarketByAddress(marketAddress: string): Promise<any | null> {
  const { data, error } = await sdb()
    .from("markets")
    .select("*")
    .eq("market_address", marketAddress)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function resolveMarket(marketAddress: string, outcome: number) {
  const { error } = await sdb()
    .from("markets")
    .update({ resolved: 1, outcome })
    .eq("market_address", marketAddress);
  if (error) throw error;
}
