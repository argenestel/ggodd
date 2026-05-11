import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import type { PredictionMarket } from "./idl";
import idl from "./idl.json";

export const PROGRAM_ID = new PublicKey("6Cxu21rFFR6c9f9aYciBimCSD1vA6k1aa9bE64HG5rLF");
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

export function getConnection(): Connection {
  const endpoint =
    NETWORK === "mainnet-beta"
      ? process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com"
      : NETWORK === "devnet"
      ? process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet")
      : "http://127.0.0.1:8899";
  return new Connection(endpoint, "confirmed");
}

export function getProgram(provider: AnchorProvider): Program<PredictionMarket> {
  return new Program({ ...idl, address: PROGRAM_ID.toBase58() }, provider) as Program<PredictionMarket>;
}

export function lamportsToSol(lamports: number | BN): number {
  const val = typeof lamports === "number" ? lamports : lamports.toNumber();
  return val / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function findConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], PROGRAM_ID);
}

export function findMarketPda(creator: PublicKey, marketId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), creator.toBuffer(), marketId.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );
}

export function findEscrowPda(market: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), market.toBuffer()],
    PROGRAM_ID
  );
}

export function findBetPda(market: PublicKey, user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("bet"), market.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}
