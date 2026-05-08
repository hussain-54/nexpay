import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Navbar } from '@/components/Navbar';
import { BalanceCard } from '@/components/BalanceCard';
import { SendForm } from '@/components/SendForm';
import { PROGRAM_ID } from '@/constants/programId';
import idl from '@/idl/nexpay.json';
import { Loader2, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchStats();
    }
  }, [wallet.publicKey, connection]);

  const fetchStats = async () => {
    if (!wallet.publicKey) return;
    try {
      const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new anchor.Program(idl as any, PROGRAM_ID, provider);

      const [walletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("wallet"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const account = await program.account.walletAccount.fetch(walletPDA);
      setStats(account);
    } catch (err) {
      console.log("Wallet not initialized yet.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const initializeWallet = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    setInitializing(true);
    try {
      const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new anchor.Program(idl as any, PROGRAM_ID, provider);

      const [walletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("wallet"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      await program.methods
        .initializeWallet()
        .accounts({
          walletAccount: walletPDA,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await fetchStats();
    } catch (err) {
      console.error(err);
      alert("Initialization failed");
    } finally {
      setInitializing(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-white/50 mb-4 font-bold uppercase tracking-widest">Session Disconnected</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary">Return to Home</button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 mt-8">
        <header className="px-4 mb-8">
          <h2 className="text-4xl font-black tracking-tight">Overview</h2>
          <p className="text-white/50 font-medium">Manage your SOL assets and track global payments.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary size-12" />
          </div>
        ) : !stats ? (
          <div className="glass m-4 p-12 rounded-[40px] text-center">
            <h3 className="text-2xl font-bold mb-4">Initialize Your NexPay Wallet</h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Welcome! To start sending and receiving SOL through NexPay, you need to initialize your on-chain stats account. This only happens once.
            </p>
            <button 
              onClick={initializeWallet} 
              disabled={initializing}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              {initializing ? <Loader2 className="animate-spin" /> : <><PlusCircle size={20} /> Initialize Wallet</>}
            </button>
          </div>
        ) : (
          <>
            <BalanceCard stats={stats} />
            <div className="mt-8">
              <SendForm />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
