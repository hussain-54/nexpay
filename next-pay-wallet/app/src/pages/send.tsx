import React from 'react';
import { Navbar } from '@/components/Navbar';
import { SendForm } from '@/components/SendForm';

export default function SendPage() {
  return (
    <div className="pb-24">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 mt-8">
        <header className="px-4 mb-8">
          <h2 className="text-4xl font-black tracking-tight text-center">Send Payment</h2>
          <p className="text-white/50 font-medium text-center">Instant SOL transfers via NexPay Smart Contract.</p>
        </header>
        <SendForm />
      </main>
    </div>
  );
}
