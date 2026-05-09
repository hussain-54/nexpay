import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

const USDC_MINT = new PublicKey(import.meta.env.VITE_USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

export function useUsdcBalance() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) { setBalance(0); return; }
    setLoading(true);
    (async () => {
      try {
        const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        const account = await getAccount(connection, ata);
        setBalance(Number(account.amount) / 1_000_000); // 6 decimals
      } catch {
        setBalance(0); // ATA doesn't exist yet
      } finally {
        setLoading(false);
      }
    })();
  }, [connected, publicKey?.toString(), connection]);

  return { balance, loading };
}
