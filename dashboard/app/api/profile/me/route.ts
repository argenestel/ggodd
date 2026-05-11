import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { getStreamerProfile, upsertStreamerProfile } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let profile = await getStreamerProfile(session.steamId);
  if (!profile) {
    await upsertStreamerProfile(session.steamId, session.displayName, null);
    profile = await getStreamerProfile(session.steamId);
  }

  return NextResponse.json({ profile, session });
}
