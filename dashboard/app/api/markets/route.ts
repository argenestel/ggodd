import { NextRequest, NextResponse } from "next/server";
import { createPendingReward, getStreamerProfile, insertMarket, listMarkets, upsertStreamerProfile } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { enrichMarketsForDisplay } from "@/lib/market-enrich";
import { getGameSchema, getSteamStoreAppName } from "@/lib/steam";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const streamerId = searchParams.get("streamerId");
  const resolved = searchParams.get("resolved");
  const address = searchParams.get("address");

  const markets = await listMarkets({ streamerId, resolved, address });
  const enriched = await enrichMarketsForDisplay(markets);

  return NextResponse.json({ markets: enriched });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    marketAddress,
    streamerSteamId,
    streamerName,
    streamerAvatarUrl,
    gameName,
    gameAppId,
    achievementId,
    achievementName,
    achievementDescription,
    deadline,
    totalYesSol,
    totalNoSol,
    rewardAmount,
    streamerWallet,
  } = body;

  if (!marketAddress || !streamerSteamId || !achievementId || !deadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const known = await getStreamerProfile(streamerSteamId);
    if (!known) {
      await upsertStreamerProfile(streamerSteamId, streamerName || streamerSteamId, streamerWallet || null);
    } else if (streamerWallet && streamerWallet !== known.wallet_address) {
      await upsertStreamerProfile(streamerSteamId, streamerName || known.display_name, streamerWallet);
    }

    const profile = known || (await getStreamerProfile(streamerSteamId));
    const streamerForRow =
      (typeof streamerName === "string" && streamerName.trim()) ||
      (profile?.display_name && String(profile.display_name).trim()) ||
      null;

    let gameForRow = typeof gameName === "string" && gameName.trim() ? gameName.trim() : null;
    const appIdNum = gameAppId != null ? Number(gameAppId) : NaN;
    if (!gameForRow && Number.isFinite(appIdNum) && appIdNum > 0) {
      gameForRow = await getSteamStoreAppName(appIdNum);
    }

    let achievementDescForRow =
      typeof achievementDescription === "string" && achievementDescription.trim()
        ? achievementDescription.trim()
        : null;
    let achievementNameForRow =
      typeof achievementName === "string" && achievementName.trim()
        ? achievementName.trim()
        : achievementId;

    if (Number.isFinite(appIdNum) && appIdNum > 0 && achievementId) {
      const titleMatchesGame =
        gameForRow &&
        achievementNameForRow &&
        achievementNameForRow.toLowerCase() === gameForRow.toLowerCase();
      if (!achievementDescForRow || titleMatchesGame) {
        const schema = await getGameSchema(appIdNum);
        const row = schema.find((a) => a.name === achievementId);
        if (row) {
          if (!achievementDescForRow && String(row.description ?? "").trim()) {
            achievementDescForRow = String(row.description).trim();
          }
          if (titleMatchesGame && String(row.displayName ?? "").trim()) {
            achievementNameForRow = String(row.displayName).trim();
          }
        }
      }
    }

    await insertMarket({
      market_address: marketAddress,
      creator_steam_id: session.steamId,
      streamer_steam_id: streamerSteamId,
      streamer_name: streamerForRow,
      streamer_avatar_url:
        typeof streamerAvatarUrl === "string" && streamerAvatarUrl.trim()
          ? streamerAvatarUrl.trim()
          : null,
      game_name: gameForRow,
      game_app_id: Number.isFinite(appIdNum) && appIdNum > 0 ? appIdNum : null,
      achievement_id: achievementId,
      achievement_name: achievementNameForRow,
      achievement_description: achievementDescForRow,
      deadline,
      total_yes_sol: totalYesSol || 0,
      total_no_sol: totalNoSol || 0,
    });

    if (typeof rewardAmount === "number" && rewardAmount > 0) {
      await createPendingReward(marketAddress, streamerSteamId, rewardAmount);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create market" }, { status: 500 });
  }
}
