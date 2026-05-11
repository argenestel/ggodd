/** Readable streamer line: never show a full 17-digit Steam ID as the headline. */
export function streamerHeadline(
  streamer_name: string | null | undefined,
  streamer_steam_id: string
): string {
  const name = streamer_name?.trim();
  if (name && !/^\d{17}$/.test(name)) return name;
  const id = (name && /^\d{17}$/.test(name) ? name : streamer_steam_id) || "";
  if (/^\d{17}$/.test(id)) return `Streamer · …${id.slice(-6)}`;
  return id || "Unknown streamer";
}

export function gameHeadline(
  game_name: string | null | undefined,
  game_app_id: number | null | undefined
): string {
  const g = game_name?.trim();
  if (g) return g;
  const id = game_app_id != null ? Number(game_app_id) : NaN;
  if (Number.isFinite(id) && id > 0) return `Steam app ${id}`;
  return "Unknown Game";
}

/** Short line for grid cards when Steam omits achievement description. */
export function achievementCardBlurb(
  description: string | null | undefined,
  achievement_name: string
): string {
  const d = description?.trim();
  if (d) return d;
  return `Unlock “${achievement_name}” on Steam before the deadline for YES to win.`;
}

/** When Steam / DB left achievement text empty, spell out what YES means. */
export function achievementFallbackExplanation(params: {
  achievement_name: string;
  achievement_id: string;
  gameLabel: string;
  streamerLabel: string;
}): string {
  const { achievement_name, achievement_id, gameLabel, streamerLabel } = params;
  return `This market is YES if ${streamerLabel} unlocks the Steam achievement “${achievement_name}” (${achievement_id}) in ${gameLabel} before the deadline. NO if it stays locked when time is up. Oracle settlement uses the Steam Web API for that account.`;
}
