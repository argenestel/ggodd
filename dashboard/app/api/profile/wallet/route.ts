import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { getStreamerProfile, upsertStreamerProfile } from "@/lib/db";

function isLikelySolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { walletAddress } = await req.json();
  if (!walletAddress || !isLikelySolanaAddress(walletAddress)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }

  const existing = await getStreamerProfile(session.steamId);
  await upsertStreamerProfile(
    session.steamId,
    existing?.display_name || session.displayName,
    walletAddress
  );

  return NextResponse.json({ success: true, walletAddress });
}
