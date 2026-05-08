import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { WalletButton } from '@/components/WalletButton';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

export default function Landing() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push('/dashboard');
    }
  }, [connected, router]);

  return (
    <div className="relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full" />

      <main className="relative max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Powered by Solana Devnet</span>
        </div>

        <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
          The Future of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Peer-to-Peer
          </span> Payments.
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 font-medium">
          Send SOL instantly across the globe with zero friction. Secured by custom on-chain smart contracts. Built for the next billion users.
        </p>

        <div className="flex flex-col items-center gap-4">
          <WalletButton />
          <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Connect Phantom to start</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left">
          <div className="glass p-8 rounded-3xl">
            <Zap className="text-primary mb-4 size-8" />
            <h3 className="text-xl font-bold mb-2">Instant Settlement</h3>
            <p className="text-white/50 text-sm leading-relaxed">Transactions finalize in seconds, not days. Experience the speed of Solana.</p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <ShieldCheck className="text-secondary mb-4 size-8" />
            <h3 className="text-xl font-bold mb-2">On-Chain Security</h3>
            <p className="text-white/50 text-sm leading-relaxed">Every transaction is logged on the immutable NexPay ledger via our Anchor program.</p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <Globe className="text-primary mb-4 size-8" />
            <h3 className="text-xl font-bold mb-2">Global Reach</h3>
            <p className="text-white/50 text-sm leading-relaxed">Borderless payments to anyone, anywhere, at a fraction of traditional costs.</p>
          </div>
        </div>
      </main>

      <footer className="relative py-12 text-center border-t border-white/5">
        <p className="text-xs text-white/20 font-bold uppercase tracking-[0.2em]">© 2024 NexPay Labs • Built for Hackathon</p>
      </footer>
    </div>
  );
}
