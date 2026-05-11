import { NextRequest, NextResponse } from "next/server";
import { createPendingReward, getStreamerProfile, insertMarket, listMarkets, upsertStreamerProfile } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const streamerId = searchParams.get("streamerId");
  const resolved = searchParams.get("resolved");
  const address = searchParams.get("address");

  const markets = await listMarkets({ streamerId, resolved, address });

  return NextResponse.json({ markets });
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

    await insertMarket({
      market_address: marketAddress,
      creator_steam_id: session.steamId,
      streamer_steam_id: streamerSteamId,
      streamer_name: streamerName || null,
      game_name: gameName || null,
      game_app_id: gameAppId || null,
      achievement_id: achievementId,
      achievement_name: achievementName || achievementId,
      achievement_description: achievementDescription || null,
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
