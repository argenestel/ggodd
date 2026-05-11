import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { getSteamWalletBinding, upsertSteamWalletBinding, upsertStreamerProfile } from "@/lib/db";
import { Connection, PublicKey } from "@solana/web3.js";

function isLikelySolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const binding = await getSteamWalletBinding(session.steamId);
  return NextResponse.json({ binding });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { walletAddress, txSignature } = await req.json();
  if (!walletAddress || !isLikelySolanaAddress(walletAddress)) {
    return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
  }
  if (!txSignature) {
    return NextResponse.json({ error: "Missing wallet proof transaction" }, { status: 400 });
  }

  const connection = new Connection(
    process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
  );
  const tx = await connection.getTransaction(txSignature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!tx) {
    return NextResponse.json({ error: "Proof transaction not found" }, { status: 400 });
  }

  const signerMatches = tx.transaction.message.staticAccountKeys.some(
    (k, i) => tx.transaction.message.isAccountSigner(i) && k.toBase58() === walletAddress
  );
  if (!signerMatches) {
    return NextResponse.json({ error: "Wallet proof signature mismatch" }, { status: 403 });
  }

  await upsertSteamWalletBinding(session.steamId, walletAddress);
  await upsertStreamerProfile(session.steamId, session.displayName, walletAddress);

  return NextResponse.json({ success: true, steamId: session.steamId, walletAddress });
}
