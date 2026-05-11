import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { createPendingReward, listMarkets, resolveMarket } from "@/lib/db";
import { getPlayerAchievements } from "@/lib/steam";

function isAdmin(steamId: string) {
  const ids = (process.env.ADMIN_STEAM_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return true;
  return ids.includes(steamId);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.steamId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = Math.floor(Date.now() / 1000);
  const unresolved = await listMarkets({ resolved: "0" });
  const due = (unresolved || []).filter((m: any) => Number(m.deadline) <= now);

  const results: any[] = [];

  for (const market of due) {
    try {
      const appId = Number(market.game_app_id || 0);
      if (!appId) {
        await resolveMarket(market.market_address, 1);
        results.push({ market: market.market_address, outcome: "no", reason: "missing_appid" });
        continue;
      }

      const achs = await getPlayerAchievements(market.streamer_steam_id, appId);
      const target = achs.find((a) => a.name === market.achievement_id);
      const yesWon = Number(target?.achieved || 0) === 1;

      await resolveMarket(market.market_address, yesWon ? 0 : 1);

      const totalPool = Number(market.total_yes_sol || 0) + Number(market.total_no_sol || 0);
      const streamerShare = (totalPool * 1.5) / 100;
      if (streamerShare > 0) {
        await createPendingReward(market.market_address, market.streamer_steam_id, streamerShare);
      }

      results.push({ market: market.market_address, outcome: yesWon ? "yes" : "no", streamerShare });
    } catch (e: any) {
      results.push({ market: market.market_address, error: e.message || "resolve_failed" });
    }
  }

  return NextResponse.json({ success: true, processed: results.length, results });
}
