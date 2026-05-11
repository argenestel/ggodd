import fs from "node:fs";
import path from "node:path";
import * as anchor from "@coral-xyz/anchor";

const PROGRAM_ID = new anchor.web3.PublicKey("6Cxu21rFFR6c9f9aYciBimCSD1vA6k1aa9bE64HG5rLF");

async function main() {
  const idlPath = path.join(process.cwd(), "anchor", "target", "idl", "prediction_market.json");
  const idlRaw = fs.readFileSync(idlPath, "utf8");
  const idl = JSON.parse(idlRaw);

  const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
  const walletPath = path.join(process.env.HOME || "", ".config", "solana", "id.json");
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf8")));
  const keypair = anchor.web3.Keypair.fromSecretKey(secret);
  const wallet = new anchor.Wallet(keypair);

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl, provider);
  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    PROGRAM_ID
  );

  const existing = await connection.getAccountInfo(configPda);
  if (existing) {
    console.log("Config already initialized:", configPda.toBase58());
    return;
  }

  const platformFeeWallet = keypair.publicKey;

  const sig = await program.methods
    .initializePlatform()
    .accounts({
      admin: keypair.publicKey,
      platformFeeWallet,
      config: configPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Initialized config PDA:", configPda.toBase58());
  console.log("Platform fee wallet:", platformFeeWallet.toBase58());
  console.log("Tx signature:", sig);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
