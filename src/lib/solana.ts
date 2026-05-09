import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, web3, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from "../idl/nexpay_program.json";

export const DEVNET_RPC = clusterApiUrl("devnet");
export const connection = new Connection(DEVNET_RPC, "confirmed");

// Replace with actual program ID after anchor deploy
export const PROGRAM_ID = new PublicKey("REPLACE_WITH_DEPLOYED_PROGRAM_ID");

// USDC devnet mint (Circle's official devnet USDC or create your own)
// For testing: use spl-token create-token --decimals 6 and store address here
export const USDC_MINT = new PublicKey("REPLACE_WITH_USDC_DEVNET_MINT");
export const USDT_MINT = new PublicKey("REPLACE_WITH_USDT_DEVNET_MINT");

export function getProgram(wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  return new Program(idl as any, PROGRAM_ID, provider);
}

export function getUserPDA(walletPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user"), walletPubkey.toBuffer()],
    PROGRAM_ID
  );
}

export function getTransferPDA(senderPubkey: PublicKey, count: number): [PublicKey, number] {
  const countBuffer = Buffer.alloc(4);
  countBuffer.writeUInt32LE(count, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("transfer"), senderPubkey.toBuffer(), countBuffer],
    PROGRAM_ID
  );
}

export function getConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], PROGRAM_ID);
}
