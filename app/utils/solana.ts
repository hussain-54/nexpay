import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Connection, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  TransactionSignature 
} from "@solana/web3.js";
import { PROGRAM_ID } from "../constants/programId";
import idl from "../idl/nexpay.json";

export const getProvider = (wallet: any, connection: Connection): AnchorProvider => {
  return new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
};

export const getProgram = (wallet: any, connection: Connection): Program => {
  const provider = getProvider(wallet, connection);
  return new anchor.Program(idl as any, PROGRAM_ID, provider);
};

export const getWalletPDA = (ownerPublicKey: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("wallet"), ownerPublicKey.toBuffer()],
    PROGRAM_ID
  );
};

export const initializeWallet = async (
  wallet: any, 
  connection: Connection
): Promise<TransactionSignature> => {
  const program = getProgram(wallet, connection);
  const [walletAccount] = getWalletPDA(wallet.publicKey);

  return await program.methods
    .initializeWallet()
    .accounts({
      walletAccount,
      owner: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};

export const sendPayment = async (
  wallet: any,
  connection: Connection,
  recipientPubkey: PublicKey,
  amountInSOL: number
): Promise<TransactionSignature> => {
  const program = getProgram(wallet, connection);
  const [senderWallet] = getWalletPDA(wallet.publicKey);
  const [recipientWallet] = getWalletPDA(recipientPubkey);
  const lamports = new anchor.BN(amountInSOL * LAMPORTS_PER_SOL);

  return await program.methods
    .sendPayment(lamports)
    .accounts({
      senderWallet,
      recipientWallet,
      sender: wallet.publicKey,
      recipient: recipientPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
};

export const fetchWalletStats = async (
  wallet: any,
  connection: Connection,
  ownerPubkey: PublicKey
): Promise<any | null> => {
  const program = getProgram(wallet, connection);
  const [walletAccount] = getWalletPDA(ownerPubkey);

  try {
    return await program.account.walletAccount.fetch(walletAccount);
  } catch (e) {
    console.log("Wallet not initialized:", e);
    return null;
  }
};

export const getTransactionHistory = async (
  connection: Connection,
  ownerPubkey: PublicKey
): Promise<any[]> => {
  const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 20 });
  const history = [];

  for (const sigInfo of signatures) {
    const tx = await connection.getParsedTransaction(sigInfo.signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (tx) {
      history.push(tx);
    }
  }

  return history;
};
