import { NextRequest, NextResponse } from "next/server";
import { getPlayerAchievements, getGameSchema } from "@/lib/steam";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get("steamId");
  const appId = parseInt(searchParams.get("appId") || "730", 10);

  if (!steamId) {
    return NextResponse.json({ error: "Missing steamId" }, { status: 400 });
  }

  const [playerAchs, schema] = await Promise.all([
    getPlayerAchievements(steamId, appId),
    getGameSchema(appId),
  ]);

  // Merge schema details with player progress
  const merged = schema.map((s) => {
    const player = playerAchs.find((p) => p.name === s.name);
    return {
      ...s,
      achieved: player?.achieved || 0,
      unlocktime: player?.unlocktime || null,
    };
  });

  return NextResponse.json({ achievements: merged });
}
