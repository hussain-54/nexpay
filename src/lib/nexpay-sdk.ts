import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { getProgram, getUserPDA, getTransferPDA, getConfigPDA, USDC_MINT, connection } from "./solana";

// --- Register User ---
export async function initializeUser(
  wallet: any,
  username: string,
  referralCode: string = ""
): Promise<string> {
  const program = getProgram(wallet);
  const [userPDA] = getUserPDA(wallet.publicKey);
  const [configPDA] = getConfigPDA();

  const tx = await program.methods
    .initializeUser(username, referralCode)
    .accounts({
      user: wallet.publicKey,
      userAccount: userPDA,
      platformConfig: configPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx; // return signature for explorer link
}

// --- Fetch User Account ---
export async function fetchUserAccount(wallet: any): Promise<any | null> {
  const program = getProgram(wallet);
  const [userPDA] = getUserPDA(wallet.publicKey);
  try {
    return await program.account.userAccount.fetch(userPDA);
  } catch {
    return null; // account doesn't exist yet
  }
}

// --- Send USDC ---
export async function transferStablecoin(
  wallet: any,
  recipientPubkey: PublicKey,
  amountUsdc: number,       // human-readable USDC amount e.g. 50.5
  recipientCountry: string,
  memo: string
): Promise<{ signature: string; fee: number; netAmount: number }> {
  // Convert to micro-units (USDC has 6 decimals)
  const amountMicro = new BN(Math.round(amountUsdc * 1_000_000));
  const feeMicro = amountMicro.muln(10).divn(10000); // 0.1%
  const netMicro = amountMicro.sub(feeMicro);

  const program = getProgram(wallet);
  const [senderPDA] = getUserPDA(wallet.publicKey);
  const [recipientPDA] = getUserPDA(recipientPubkey);
  const [configPDA] = getConfigPDA();
  
  // We need to fetch the sender account to get the current transfer_count to derive the transfer PDA
  let senderUserAccount;
  try {
    senderUserAccount = await program.account.userAccount.fetch(senderPDA);
  } catch (e) {
    throw new Error("Sender account not found. Please complete KYC.");
  }
  
  const [transferRecordPDA] = getTransferPDA(wallet.publicKey, senderUserAccount.transferCount);

  // Get token accounts
  const senderTokenAccount = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
  const recipientTokenAccount = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey);
  
  // Platform config stores fee_wallet
  const configAccount = await program.account.platformConfig.fetch(configPDA);
  const feeTokenAccount = await getAssociatedTokenAddress(USDC_MINT, configAccount.feeWallet);

  const tx = await program.methods
    .transferStablecoin(amountMicro, recipientCountry, memo)
    .accounts({
      sender: wallet.publicKey,
      senderUserAccount: senderPDA,
      recipientUserAccount: recipientPDA,
      senderTokenAccount: senderTokenAccount,
      recipientTokenAccount: recipientTokenAccount,
      feeTokenAccount: feeTokenAccount,
      transferRecord: transferRecordPDA,
      platformConfig: configPDA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .rpc();

  return {
    signature: tx,
    fee: feeMicro.toNumber() / 1_000_000,
    netAmount: netMicro.toNumber() / 1_000_000,
  };
}

// --- Fetch USDC Balance ---
export async function getUsdcBalance(walletPubkey: PublicKey): Promise<number> {
  try {
    const ata = await getAssociatedTokenAddress(USDC_MINT, walletPubkey);
    const account = await getAccount(connection, ata);
    return Number(account.amount) / 1_000_000;
  } catch {
    return 0;
  }
}

// --- Fetch SOL Balance ---
export async function getSolBalance(walletPubkey: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(walletPubkey);
  return lamports / 1_000_000_000;
}

// --- Fetch Transfer History (by reading PDA accounts) ---
export async function fetchTransferHistory(wallet: any): Promise<any[]> {
  const program = getProgram(wallet);
  const [senderPDA] = getUserPDA(wallet.publicKey);
  let userAccount: any;
  try {
    userAccount = await program.account.userAccount.fetch(senderPDA);
  } catch {
    return [];
  }

  const history = [];
  for (let i = 0; i < userAccount.transferCount; i++) {
    try {
      const [pda] = getTransferPDA(wallet.publicKey, i);
      const record = await program.account.transferRecord.fetch(pda);
      history.push({ ...record, pdaAddress: pda.toString() });
    } catch {
      // skip failed fetches
    }
  }
  return history.reverse(); // newest first
}

// --- Freeze / Unfreeze Wallet ---
export async function setWalletFrozen(wallet: any, freeze: boolean): Promise<string> {
  const program = getProgram(wallet);
  const [userPDA] = getUserPDA(wallet.publicKey);
  const [configPDA] = getConfigPDA();

  return await program.methods
    .freezeWallet(freeze)
    .accounts({
      caller: wallet.publicKey,
      userAccount: userPDA,
      platformConfig: configPDA,
    })
    .rpc();
}

// --- Get explorer link ---
export function explorerLink(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
