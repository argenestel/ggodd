import { NextRequest, NextResponse } from "next/server";
import { getDbInstance, initDb } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  initDb();
  const db = getDbInstance();

  const { searchParams } = new URL(req.url);
  const streamerId = searchParams.get("streamerId");
  const resolved = searchParams.get("resolved");
  const address = searchParams.get("address");

  let query = "SELECT * FROM markets WHERE 1=1";
  const params: (string | number)[] = [];

  if (address) {
    query += " AND market_address = ?";
    params.push(address);
  }

  if (streamerId) {
    query += " AND streamer_steam_id = ?";
    params.push(streamerId);
  }

  if (resolved !== null) {
    query += " AND resolved = ?";
    params.push(parseInt(resolved, 10));
  }

  query += " ORDER BY created_at DESC";

  const markets = db.prepare(query).all(...params);
  db.close();

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
    achievementId,
    achievementName,
    achievementDescription,
    deadline,
    totalYesSol,
    totalNoSol,
  } = body;

  if (!marketAddress || !streamerSteamId || !achievementId || !deadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  initDb();
  const db = getDbInstance();

  try {
    db.prepare(
      `INSERT INTO markets (
        market_address, creator_steam_id, streamer_steam_id, streamer_name,
        achievement_id, achievement_name, achievement_description, deadline,
        total_yes_sol, total_no_sol
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      marketAddress,
      session.steamId,
      streamerSteamId,
      streamerName || null,
      achievementId,
      achievementName || achievementId,
      achievementDescription || null,
      deadline,
      totalYesSol || 0,
      totalNoSol || 0
    );

    db.close();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    db.close();
    return NextResponse.json({ error: e.message || "Failed to create market" }, { status: 500 });
  }
}
