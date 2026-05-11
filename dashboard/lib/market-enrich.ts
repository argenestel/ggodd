import { getGameSchema, getSteamStoreAppName } from "@/lib/steam";
import { getSupabase } from "@/lib/supabase";

type MarketRow = Record<string, any>;

/**
 * Fills missing streamer_name (from streamer_profiles) and game_name (from Steam Store via game_app_id)
 * so dashboard cards don't show raw Steam IDs and "Unknown Game" when the data exists elsewhere.
 *
 * Also backfills achievement_description (and corrects achievement_name when it equals the game title)
 * from ISteamUserStats/GetSchemaForGame when the DB row is incomplete.
 */
export async function enrichMarketsForDisplay(markets: MarketRow[]): Promise<MarketRow[]> {
  if (!markets.length) return markets;

  const sdb = getSupabase() as any;

  const needStreamerName = new Set<string>();
  const needGameNameAppIds = new Set<number>();
  const needAchievementSchemaAppIds = new Set<number>();

  for (const m of markets) {
    if (!String(m.streamer_name ?? "").trim()) {
      needStreamerName.add(m.streamer_steam_id);
    }
    const gn = String(m.game_name ?? "").trim();
    const appId = m.game_app_id != null ? Number(m.game_app_id) : NaN;
    if (!gn && Number.isFinite(appId) && appId > 0) {
      needGameNameAppIds.add(appId);
    }
    if (Number.isFinite(appId) && appId > 0 && m.achievement_id) {
      const achDesc = String(m.achievement_description ?? "").trim();
      const achName = String(m.achievement_name ?? "").trim();
      const sameAsGame = gn && achName && gn.toLowerCase() === achName.toLowerCase();
      if (!achDesc || sameAsGame || !gn) {
        needAchievementSchemaAppIds.add(appId);
      }
    }
  }

  const profileNames = new Map<string, string>();
  if (needStreamerName.size > 0) {
    const { data, error } = await sdb
      .from("streamer_profiles")
      .select("steam_id, display_name")
      .in("steam_id", [...needStreamerName]);
    if (!error && data) {
      for (const row of data as { steam_id: string; display_name: string | null }[]) {
        const d = String(row.display_name ?? "").trim();
        if (d) profileNames.set(row.steam_id, d);
      }
    }
  }

  const gameNames = new Map<number, string>();
  await Promise.all(
    [...needGameNameAppIds].map(async (appId) => {
      const name = await getSteamStoreAppName(appId);
      if (name) gameNames.set(appId, name);
    })
  );

  const achievementSchemaByApp = new Map<number, Awaited<ReturnType<typeof getGameSchema>>>();
  await Promise.all(
    [...needAchievementSchemaAppIds].map(async (appId) => {
      achievementSchemaByApp.set(appId, await getGameSchema(appId));
    })
  );

  return markets.map((m) => {
    const streamerName = String(m.streamer_name ?? "").trim();
    const resolvedStreamer =
      streamerName || profileNames.get(m.streamer_steam_id) || m.streamer_name;

    const gameName = String(m.game_name ?? "").trim();
    const appId = m.game_app_id != null ? Number(m.game_app_id) : NaN;
    const resolvedGame =
      gameName ||
      (Number.isFinite(appId) && appId > 0 ? gameNames.get(appId) : undefined) ||
      m.game_name;

    let achievementDescription = String(m.achievement_description ?? "").trim() || null;
    let achievementName = String(m.achievement_name ?? "").trim();
    const achId = String(m.achievement_id ?? "");
    const gameTitle = String(resolvedGame ?? gameName ?? "").trim();

    if (Number.isFinite(appId) && appId > 0 && achId) {
      const schema = achievementSchemaByApp.get(appId);
      const row = schema?.find((a) => a.name === achId);
      if (row) {
        const schemaDesc = String(row.description ?? "").trim();
        const schemaTitle = String(row.displayName ?? "").trim();
        if (!achievementDescription && schemaDesc) {
          achievementDescription = schemaDesc;
        }
        const titleMatchesGame =
          achievementName &&
          gameTitle &&
          achievementName.toLowerCase() === gameTitle.toLowerCase();
        if (schemaTitle && (titleMatchesGame || !achievementName)) {
          achievementName = schemaTitle;
        }
      }
    }

    return {
      ...m,
      streamer_name: resolvedStreamer ?? m.streamer_name,
      game_name: resolvedGame ?? m.game_name,
      achievement_name: achievementName || m.achievement_name,
      achievement_description: achievementDescription,
    };
  });
}
