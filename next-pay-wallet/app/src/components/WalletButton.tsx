import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton: React.FC = () => {
  return (
    <div className="flex justify-end p-4">
      <WalletMultiButton className="!bg-primary !text-black !font-bold !rounded-xl !transition-all hover:!scale-105 active:!scale-95" />
    </div>
  );
};
