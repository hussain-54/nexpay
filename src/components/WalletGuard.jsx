import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet as WalletIcon } from 'lucide-react';
import { Card } from './ui';

export const WalletGuard = ({ children }) => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex flex-col h-full p-6 items-center justify-center bg-bgDark">
        <Card className="flex flex-col items-center justify-center p-8 w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <WalletIcon size={32} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Wallet Disconnected</h2>
            <p className="text-sm text-textMuted">Connect your Phantom or Solflare wallet to continue.</p>
          </div>
          <WalletMultiButton style={{ backgroundColor: '#7C3AED', borderRadius: '12px' }} />
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
