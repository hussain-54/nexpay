import React from 'react';
import { Navbar } from '@/components/Navbar';
import { TxList } from '@/components/TxList';

export default function HistoryPage() {
  return (
    <div className="pb-24">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 mt-8">
        <header className="px-4 mb-8">
          <h2 className="text-4xl font-black tracking-tight text-center">Transaction History</h2>
          <p className="text-white/50 font-medium text-center">Your immutable payment record on the Solana blockchain.</p>
        </header>
        <TxList />
      </main>
    </div>
  );
}
