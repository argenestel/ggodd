import { NextRequest, NextResponse } from "next/server";
import { addBetToMarket } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

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
  const { marketAddress, side, amountSol, txSignature } = body;

  if (!marketAddress || !side || !amountSol || !txSignature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (side !== "yes" && side !== "no") {
    return NextResponse.json({ error: "Invalid side" }, { status: 400 });
  }
  if (typeof amountSol !== "number" || amountSol <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    await addBetToMarket(marketAddress, side, amountSol);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to record bet" }, { status: 500 });
  }
}
