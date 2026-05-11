import { NextRequest, NextResponse } from "next/server";
import { getDbInstance, initDb } from "@/lib/db";
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

  initDb();
  const db = getDbInstance();

  try {
    // Update market totals
    const column = side === "yes" ? "total_yes_sol" : "total_no_sol";
    db.prepare(
      `UPDATE markets SET ${column} = ${column} + ? WHERE market_address = ?`
    ).run(amountSol, marketAddress);

    db.close();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    db.close();
    return NextResponse.json({ error: e.message || "Failed to record bet" }, { status: 500 });
  }
}
