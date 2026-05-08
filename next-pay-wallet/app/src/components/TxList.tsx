import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { PROGRAM_ID } from '../constants/programId';

interface Transaction {
  signature: string;
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
}

export const TxList: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchHistory();
    }
  }, [publicKey, connection]);

  const fetchHistory = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      // In a real production app, we would use an indexer or parse Program Accounts.
      // For this hackathon, we fetch signatures for the PROGRAM_ID and parse them.
      const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 10 });
      
      const parsedTxs: Transaction[] = [];
      for (const sigInfo of signatures) {
        const tx = await connection.getParsedTransaction(sigInfo.signature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0,
        });

        if (tx && tx.meta && !tx.meta.err) {
          // Logic to parse PaymentEvent would go here if using a custom indexer.
          // For simplicity, we detect transfers within the program call.
          const postBalances = tx.meta.postBalances;
          const preBalances = tx.meta.preBalances;
          const amount = (preBalances[0] - postBalances[0] - (tx.meta.fee || 0)) / LAMPORTS_PER_SOL;
          
          parsedTxs.push({
            signature: sigInfo.signature,
            sender: tx.transaction.message.accountKeys[0].pubkey.toString(),
            recipient: tx.transaction.message.accountKeys[1].pubkey.toString(),
            amount: Math.abs(amount),
            timestamp: tx.blockTime || 0,
          });
        }
      }
      setTxs(parsedTxs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="text-secondary" /> History
        </h3>
        <button onClick={fetchHistory} className="text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-white/20" />
        </div>
      ) : (
        <div className="space-y-4">
          {txs.length === 0 ? (
            <p className="text-center text-white/30 py-8">No transactions found on-chain.</p>
          ) : (
            txs.map((tx) => {
              const isSent = tx.sender === publicKey?.toString();
              return (
                <div key={tx.signature} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isSent ? "bg-red-400/10 text-red-400" : "bg-primary/10 text-primary"}`}>
                      {isSent ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {isSent ? `To: ${tx.recipient.slice(0, 4)}...${tx.recipient.slice(-4)}` : `From: ${tx.sender.slice(0, 4)}...${tx.sender.slice(-4)}`}
                      </p>
                      <p className="text-xs text-white/50">
                        {new Date(tx.timestamp * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isSent ? "text-red-400" : "text-primary"}`}>
                      {isSent ? "-" : "+"}{tx.amount.toFixed(4)} SOL
                    </p>
                    <a 
                      href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      className="text-[10px] text-white/30 hover:text-white underline font-mono"
                    >
                      {tx.signature.slice(0, 8)}...
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
