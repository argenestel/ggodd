import { NextRequest, NextResponse } from "next/server";
import { createPendingReward, getMarketByAddress, resolveMarket } from "@/lib/db";

function parseOutcome(outcome: unknown): number | null {
  if (outcome === "yes" || outcome === 0 || outcome === "0") return 0;
  if (outcome === "no" || outcome === 1 || outcome === "1") return 1;
  return null;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-oracle-token");
  const expected = process.env.ORACLE_TOKEN;
  if (!expected || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized resolver" }, { status: 401 });
  }

  const { marketAddress, outcome } = await req.json();
  const parsedOutcome = parseOutcome(outcome);
  if (!marketAddress || parsedOutcome === null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const market = await getMarketByAddress(marketAddress);
  if (!market) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }
  if (Number(market.resolved) === 1) {
    return NextResponse.json({ success: true, alreadyResolved: true });
  }

  await resolveMarket(marketAddress, parsedOutcome);

  const totalPool = Number(market.total_yes_sol || 0) + Number(market.total_no_sol || 0);
  const streamerShare = (totalPool * 1.5) / 100;
  if (streamerShare > 0) {
    await createPendingReward(marketAddress, market.streamer_steam_id, streamerShare);
  }

  return NextResponse.json({
    success: true,
    marketAddress,
    outcome: parsedOutcome,
    streamerShare,
  });
}
