import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TrendingUp, TrendingDown, Repeat } from 'lucide-react';

interface Stats {
  totalSent: number;
  totalReceived: number;
  txCount: number;
}

export const BalanceCard: React.FC<{ stats: Stats | null }> = ({ stats }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((b) => setBalance(b / LAMPORTS_PER_SOL));
    }
  }, [publicKey, connection]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <div className="glass p-6 rounded-3xl">
        <p className="text-white/50 text-sm font-medium mb-1 uppercase tracking-wider">SOL Balance</p>
        <h2 className="text-4xl font-bold text-primary">
          {balance !== null ? balance.toFixed(4) : "---"}
        </h2>
      </div>
      
      <div className="glass p-6 rounded-3xl flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider">Total Sent</p>
          <TrendingUp className="text-red-400 size-5" />
        </div>
        <h2 className="text-2xl font-bold mt-2">
          {stats ? (stats.totalSent / LAMPORTS_PER_SOL).toFixed(4) : "0.0000"} SOL
        </h2>
      </div>

      <div className="glass p-6 rounded-3xl flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider">Total Received</p>
          <TrendingDown className="text-primary size-5" />
        </div>
        <h2 className="text-2xl font-bold mt-2">
          {stats ? (stats.totalReceived / LAMPORTS_PER_SOL).toFixed(4) : "0.0000"} SOL
        </h2>
      </div>

      <div className="glass p-6 rounded-3xl flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <p className="text-white/50 text-sm font-medium uppercase tracking-wider">Transactions</p>
          <Repeat className="text-secondary size-5" />
        </div>
        <h2 className="text-2xl font-bold mt-2">
          {stats ? stats.txCount : "0"}
        </h2>
      </div>
    </div>
  );
};
