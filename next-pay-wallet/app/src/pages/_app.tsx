import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}
import React, { useMemo } from 'react';
import type { AppProps } from 'next/app';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@/styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30">
            <Component {...pageProps} />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
