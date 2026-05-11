import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { claimPendingRewards, getSteamWalletBinding, getStreamerProfile } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { walletAddress } = await req.json();
  const profile = await getStreamerProfile(session.steamId);
  const binding = await getSteamWalletBinding(session.steamId);
  if (!profile?.wallet_address) {
    return NextResponse.json({ error: "Set wallet address first" }, { status: 400 });
  }
  if (!walletAddress) {
    return NextResponse.json({ error: "Missing connected wallet" }, { status: 400 });
  }
  if (!binding || binding.wallet_address !== walletAddress) {
    return NextResponse.json({ error: "Steam and wallet are not linked" }, { status: 403 });
  }

  const result = await claimPendingRewards(session.steamId, walletAddress);
  return NextResponse.json({ success: true, ...result });
}
