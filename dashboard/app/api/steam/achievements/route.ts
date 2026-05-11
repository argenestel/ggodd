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

  const hasSchema = schema.length > 0;
  const hasPlayer = playerAchs.length > 0;

  // Merge schema details with player progress.
  // If player stats fail/empty, still return schema so user can challenge against app achievements.
  const merged = hasSchema
    ? schema.map((s) => {
        const player = playerAchs.find((p) => p.name === s.name);
        return {
          ...s,
          achieved: Number(player?.achieved ?? 0),
          unlocktime: player?.unlocktime || null,
          source: player ? "schema+player" : "schema-only",
        };
      })
    : playerAchs.map((p) => ({
        name: p.name,
        displayName: p.displayName || p.name,
        description: p.description || "",
        icon: p.icon || "",
        icongray: p.icongray || "",
        hidden: 0,
        achieved: Number(p.achieved || 0),
        unlocktime: p.unlocktime || null,
        source: "player-only",
      }));

  return NextResponse.json({
    appId,
    steamId,
    source: hasSchema ? (hasPlayer ? "schema+player" : "schema-only") : hasPlayer ? "player-only" : "none",
    schemaCount: schema.length,
    playerCount: playerAchs.length,
    achievements: merged,
  });
}
