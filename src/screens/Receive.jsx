import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Share2, Link as LinkIcon, Droplets } from 'lucide-react';
import { Button, Input, Card, Select } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { QRCodeSVG } from 'qrcode.react';
import { USDC_MINT, connection } from '../lib/solana';
import { WalletGuard } from '../components/WalletGuard';

export const Receive = () => {
  const navigate = useNavigate();
  const { publicKey } = useSolanaWallet();
  const { showToast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [requestLink, setRequestLink] = useState('');
  const [isAirdropping, setIsAirdropping] = useState(false);

  const walletAddress = publicKey ? publicKey.toString() : '';

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      showToast("Address Copied!", "success");
    }
  };

  const handleGenerateLink = () => {
    if (!walletAddress) return;
    const link = `solana:${walletAddress}?amount=${amount}&spl-token=${USDC_MINT.toString()}`;
    setRequestLink(link);
    navigator.clipboard.writeText(link);
    showToast(`Payment request link copied!`, "success");
  };

  const handleAirdrop = async () => {
    if (!publicKey) return;
    setIsAirdropping(true);
    try {
      const sig = await connection.requestAirdrop(publicKey, 1_000_000_000); // 1 SOL
      await connection.confirmTransaction(sig, 'confirmed');
      showToast("Devnet SOL airdropped successfully!", "success");
      showToast("Visit spl-token faucet to get test USDC", "info");
    } catch (e) {
      showToast(`Airdrop failed: ${e.message}`, "error");
    } finally {
      setIsAirdropping(false);
    }
  };

  return (
    <WalletGuard>
      <div className="flex flex-col h-full bg-bgDark p-6 overflow-y-auto">
        <div className="flex items-center mb-6 relative">
          <h1 className="text-xl font-bold flex-1 text-center">Receive</h1>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl mb-6">
            {requestLink ? (
              <QRCodeSVG value={requestLink} size={180} />
            ) : walletAddress ? (
              <QRCodeSVG value={walletAddress} size={180} />
            ) : (
              <div className="w-48 h-48 border-4 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 font-bold tracking-widest">QR CODE</span>
              </div>
            )}
          </div>

          <p className="text-sm text-textMuted mb-2">Your Wallet Address</p>
          <Card className="w-full flex items-center justify-between mb-4 p-3">
            <span className="font-mono text-sm truncate mr-4">{walletAddress}</span>
            <div className="flex space-x-2">
              <button onClick={handleCopy} className="p-2 bg-card border border-borderDark rounded-lg hover:bg-borderDark transition-colors">
                <Copy size={16} className="text-textPrimary" />
              </button>
            </div>
          </Card>

          <Button variant="secondary" size="sm" onClick={handleAirdrop} isLoading={isAirdropping} className="mb-8">
            <Droplets size={14} className="mr-2" /> Get devnet SOL
          </Button>

          <div className="w-full mt-auto">
            <h3 className="text-lg font-bold mb-4">Request Exact Amount</h3>
            <div className="flex space-x-2 mb-4">
              <div className="w-24">
                <Select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { label: 'USDC', value: 'USDC' },
                    { label: 'USDT', value: 'USDT' }
                  ]}
                />
              </div>
              <Input 
                type="number" 
                min="0"
                step="0.01"
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="font-mono"
              />
            </div>
            <Button onClick={handleGenerateLink} size="lg" className="w-full" disabled={!amount || amount <= 0}>
              <LinkIcon size={18} className="mr-2" /> Generate Request Link
            </Button>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
};
