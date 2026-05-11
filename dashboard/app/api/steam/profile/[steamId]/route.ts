import { NextRequest, NextResponse } from "next/server";
import { getSteamProfile, getOwnedGames, getGameSchema } from "@/lib/steam";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ steamId: string }> }
) {
  const { steamId } = await params;

  const [profile, games] = await Promise.all([
    getSteamProfile(steamId),
    getOwnedGames(steamId),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile, games });
}
