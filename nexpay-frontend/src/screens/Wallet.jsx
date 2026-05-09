import React, { useState } from 'react';
import { ArrowDownUp, CreditCard, Landmark, Smartphone, Bitcoin, Send, Download, RefreshCcw } from 'lucide-react';
import { Button, Input, Card, Select } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { WalletGuard } from '../components/WalletGuard';
import { QRCodeSVG } from 'qrcode.react';

export const Wallet = () => {
  const { showToast } = useToast();
  const { usdcBalance, solBalance, refreshBalances, publicKey, loading } = useSolanaWallet();
  
  const [swapFrom, setSwapFrom] = useState('USDC');
  const [swapTo, setSwapTo] = useState('SOL');
  const [swapAmount, setSwapAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [activeTab, setActiveTab] = useState('assets'); 
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    await refreshBalances();
    setLastUpdated(new Date());
    showToast("Balances updated", "success");
  };

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      showToast(`Swap submitted. Tx: https://explorer.solana.com/?cluster=devnet`, "success");
      setSwapAmount('');
    }, 1500);
  };

  const assets = [
    { id: 'usdc', name: 'USDC', balance: usdcBalance, value: usdcBalance, color: 'bg-[#2775CA]', badge: null },
    { id: 'sol', name: 'SOL', balance: solBalance, value: solBalance * 150 /* mock rate */, color: 'bg-[#14F195] text-bgDark', badge: null },
    { id: 'usdt', name: 'USDT', balance: 0, value: 0, color: 'bg-[#26A17B]', badge: 'Coming soon' },
  ];

  return (
    <WalletGuard>
      <div className="flex flex-col h-full bg-bgDark p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Wallet</h1>
          <button onClick={handleRefresh} disabled={loading} className="flex items-center text-xs text-textMuted hover:text-primary transition-colors disabled:opacity-50">
            <RefreshCcw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </button>
        </div>

        <div className="flex bg-card p-1 rounded-xl mb-6 border border-borderDark">
          <button 
            onClick={() => setActiveTab('assets')} 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'assets' ? 'bg-[#2A2A35] text-textPrimary' : 'text-textMuted hover:text-textPrimary'}`}
          >
            Assets & Swap
          </button>
          <button 
            onClick={() => setActiveTab('topup')} 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'topup' ? 'bg-[#2A2A35] text-textPrimary' : 'text-textMuted hover:text-textPrimary'}`}
          >
            Top-Up
          </button>
        </div>

        {activeTab === 'assets' && (
          <div className="flex-1 overflow-y-auto space-y-6 pb-4">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-textMuted">Your Assets</h2>
              {assets.map((asset) => (
                <Card key={asset.id} className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${asset.color}`}>
                        {asset.name}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold">{asset.name}</p>
                          {asset.badge && <span className="text-[9px] px-1.5 py-0.5 bg-borderDark rounded text-textMuted uppercase">{asset.badge}</span>}
                        </div>
                        <p className="text-xs text-textMuted">≈ ${asset.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-lg">{asset.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}</p>
                    </div>
                  </div>
                  {!asset.badge && (
                    <div className="flex space-x-2 pt-2 border-t border-borderDark">
                      <Button variant="ghost" size="sm" className="flex-1 bg-borderDark/30 h-8 text-xs">
                        <Send size={12} className="mr-1" /> Send
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 bg-borderDark/30 h-8 text-xs">
                        <Download size={12} className="mr-1" /> Receive
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-sm font-bold text-textMuted">Swap Tokens (Simulated)</h2>
              <Card className="space-y-4">
                <div className="bg-warning/10 border border-warning/20 p-2 rounded text-xs text-warning text-center">
                  Swap is simulated on devnet
                </div>
                <div className="flex space-x-2">
                  <Select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value)} options={[{label:'USDC', value:'USDC'}, {label:'SOL', value:'SOL'}]} className="w-28 bg-[#12121A]" />
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} className="font-mono" />
                </div>
                
                <div className="flex justify-center -my-2 relative z-10">
                  <button 
                    onClick={() => { const temp = swapFrom; setSwapFrom(swapTo); setSwapTo(temp); }}
                    className="w-8 h-8 rounded-full bg-card border border-borderDark flex items-center justify-center hover:bg-borderDark transition-colors"
                  >
                    <ArrowDownUp size={14} className="text-primary" />
                  </button>
                </div>

                <div className="flex space-x-2">
                  <Select value={swapTo} onChange={(e) => setSwapTo(e.target.value)} options={[{label:'SOL', value:'SOL'}, {label:'USDC', value:'USDC'}]} className="w-28 bg-[#12121A]" />
                  <Input type="text" readOnly value={swapAmount ? (swapAmount * 0.99).toFixed(4) : '0.00'} className="font-mono bg-[#12121A]" />
                </div>

                <Button onClick={handleSwap} disabled={!swapAmount || swapAmount <= 0} isLoading={isSwapping} className="w-full">
                  Confirm Swap
                </Button>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'topup' && (
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            <Card className="flex flex-col items-center p-6 border-primary/50 bg-primary/5 space-y-4">
              <h3 className="font-bold text-textPrimary">Crypto Deposit</h3>
              <p className="text-xs text-textMuted text-center">Send USDC or SOL to your wallet address below on the Solana Devnet.</p>
              <div className="bg-white p-2 rounded-xl">
                <QRCodeSVG value={publicKey?.toString() || ''} size={140} />
              </div>
              <p className="font-mono text-xs break-all text-center text-textMuted">{publicKey?.toString()}</p>
            </Card>

            <TopUpOption icon={CreditCard} title="Credit / Debit Card" desc="Coming soon" disabled />
            <TopUpOption icon={Landmark} title="Bank Transfer" desc="Coming soon" disabled />
            <TopUpOption icon={Smartphone} title="Mobile Money (PK)" desc="Coming soon" disabled />
          </div>
        )}
      </div>
    </WalletGuard>
  );
};

const TopUpOption = ({ icon: Icon, title, desc, disabled }) => (
  <Card className={`flex items-center p-4 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer group'}`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${disabled ? 'bg-borderDark text-textMuted' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
      <Icon size={24} />
    </div>
    <div className="ml-4 flex-1">
      <h3 className="font-bold text-textPrimary">{title}</h3>
      <p className="text-xs text-textMuted">{desc}</p>
    </div>
  </Card>
);
