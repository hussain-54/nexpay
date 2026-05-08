import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { PROGRAM_ID } from '../constants/programId';
import idl from '../idl/nexpay.json';
import { Send, Loader2 } from 'lucide-react';

export const SendForm: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setLoading(true);
    setTxSig('');

    try {
      const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new anchor.Program(idl as any, PROGRAM_ID, provider);

      const recipientPubkey = new PublicKey(recipient);
      const lamports = new anchor.BN(parseFloat(amount) * LAMPORTS_PER_SOL);

      const [senderWallet] = PublicKey.findProgramAddressSync(
        [Buffer.from("wallet"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [recipientWallet] = PublicKey.findProgramAddressSync(
        [Buffer.from("wallet"), recipientPubkey.toBuffer()],
        PROGRAM_ID
      );

      // Check if recipient wallet account exists
      const recipientAccount = await connection.getAccountInfo(recipientWallet);
      if (!recipientAccount) {
        throw new Error("Recipient hasn't initialized their NexPay wallet yet.");
      }

      const sig = await program.methods
        .sendPayment(lamports)
        .accounts({
          sender: wallet.publicKey,
          recipient: recipientPubkey,
          senderWallet: senderWallet,
          recipientWallet: recipientWallet,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxSig(sig);
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl max-w-xl mx-auto mt-8">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Send className="text-primary" /> Send SOL
      </h3>
      
      <form onSubmit={handleSend} className="space-y-6">
        <div>
          <label className="block text-white/50 text-xs font-bold uppercase mb-2 ml-1">Recipient Address</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Paste recipient public key"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs font-bold uppercase mb-2 ml-1">Amount (SOL)</label>
          <input 
            type="number" 
            step="0.0001"
            className="input-field" 
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>Confirm Payment <Send size={18} /></>
          )}
        </button>
      </form>

      {txSig && (
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
          <p className="text-sm font-medium text-primary mb-1">Transaction Success!</p>
          <a 
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            className="text-xs text-white/70 hover:text-white underline break-all"
          >
            {txSig}
          </a>
        </div>
      )}
    </div>
  );
};
