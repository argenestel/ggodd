import { NextRequest, NextResponse } from "next/server";
import { addBetToMarket } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("6Cxu21rFFR6c9f9aYciBimCSD1vA6k1aa9bE64HG5rLF");

function getConnection() {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
  const endpoint =
    network === "mainnet-beta"
      ? process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com"
      : network === "devnet"
      ? process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet")
      : "http://127.0.0.1:8899";
  return new Connection(endpoint, "confirmed");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const marketAddress = searchParams.get("marketAddress");
  if (!marketAddress) {
    return NextResponse.json({ error: "Missing marketAddress" }, { status: 400 });
  }

  try {
    const marketPk = new PublicKey(marketAddress);
    const connection = getConnection();
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);

    const bets = accounts
      .filter((a) => a.account.data.length === 83)
      .map((a) => {
        const d = a.account.data;
        const user = new PublicKey(d.subarray(8, 40)).toBase58();
        const market = new PublicKey(d.subarray(40, 72)).toBase58();
        const amountLamports = Number(d.readBigUInt64LE(72));
        const side = d[80] === 0 ? "yes" : "no";
        const claimed = d[81] === 1;
        return {
          betAddress: a.pubkey.toBase58(),
          user,
          market,
          amountLamports,
          amountSol: amountLamports / 1e9,
          side,
          claimed,
        };
      })
      .filter((b) => b.market === marketPk.toBase58());

    return NextResponse.json({ bets });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load bets" }, { status: 500 });
  }
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
