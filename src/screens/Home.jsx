import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, ArrowUpRight, ArrowDownLeft, RefreshCcw, Plus, ChevronRight, Copy, ExternalLink, Wallet as WalletIcon } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { useStore } from '../store/useStore';
import { useToast } from '../contexts/ToastContext';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { fetchTransferHistory } from '../lib/nexpay-sdk';

export const Home = () => {
  const { user, getUnreadCount } = useStore();
  const unreadCount = getUnreadCount();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { publicKey, usdcBalance, refreshBalances, shortAddress, connected, walletAdapter } = useSolanaWallet();
  
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (connected && walletAdapter) {
      loadHistory();
    }
  }, [connected, walletAdapter]);

  const loadHistory = async () => {
    setLoadingTx(true);
    try {
      const history = await fetchTransferHistory(walletAdapter);
      setTransactions(history.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTx(false);
    }
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      showToast("Address Copied!", "success");
    }
  };

  const openExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, '_blank');
    }
  };

  const recentTransactions = transactions;

  return (
    <div className="flex flex-col min-h-full p-6 space-y-6 bg-bgDark">
      {/* Header */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-xs text-textMuted">Good morning,</p>
            <p className="text-sm font-semibold">{user?.name || 'User'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {shortAddress && (
            <button onClick={copyAddress} className="flex items-center space-x-1 px-3 py-1.5 bg-card shadow-sm border border-borderDark rounded-full text-xs font-mono hover:bg-white/5 transition-colors">
              <WalletIcon size={12} className="text-primary" />
              <span>{shortAddress}</span>
            </button>
          )}
          <button onClick={openExplorer} className="p-2 rounded-full bg-card shadow-sm border border-borderDark hover:bg-white/5 transition-colors">
            <ExternalLink size={16} className="text-textMuted hover:text-primary transition-colors" />
          </button>
          <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-full bg-card shadow-sm border border-borderDark hover:bg-white/5 transition-colors">
            <Bell size={16} className="text-textPrimary" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-bgDark"></span>
            )}
          </button>
        </div>
      </div>

      {usdcBalance === 0 && !loadingTx && (
        <Card className="bg-warning/10 border-warning/30 p-4 flex items-center justify-between">
          <span className="text-sm text-warning font-medium">No USDC balance. Top up to send money.</span>
          <Button size="sm" onClick={() => navigate('/wallet')}>Top Up</Button>
        </Card>
      )}

      {/* Premium Balance Card */}
      <div className="flex flex-col items-center justify-center py-10 relative overflow-hidden group bg-card rounded-3xl shadow-2xl border border-white/5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <button onClick={refreshBalances} className="absolute top-4 right-4 p-2 bg-white/5 backdrop-blur-sm rounded-full hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100 shadow-sm border border-white/10">
          <RefreshCcw size={16} className="text-textMuted hover:text-primary" />
        </button>
        <p className="text-sm text-textMuted font-medium z-10">Total Balance</p>
        <h1 className="text-5xl font-mono font-bold mt-2 z-10 tracking-tight text-white text-center break-all px-4">${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}<span className="text-2xl text-textMuted font-medium ml-2">USDC</span></h1>
        
        <div className="flex space-x-2 mt-5 z-10">
          <div className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            Tier: {user?.tier || 'Free'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <ActionBtn icon={ArrowUpRight} label="Send" onClick={() => navigate('/send')} />
        <ActionBtn icon={ArrowDownLeft} label="Receive" onClick={() => navigate('/receive')} />
        <ActionBtn icon={RefreshCcw} label="Swap" onClick={() => navigate('/wallet')} />
        <ActionBtn icon={Plus} label="Top-Up" onClick={() => navigate('/wallet')} />
      </div>

      {/* Recent Transactions */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-bold">Recent Transactions</h2>
        </div>
        
        <div className="flex-1 space-y-3">
          {loadingTx ? (
            // Skeletons
            [1, 2, 3].map(i => (
              <div key={i} className="flex items-center p-3 rounded-xl bg-card border border-borderDark animate-pulse">
                <div className="w-10 h-10 rounded-full bg-borderDark shrink-0"></div>
                <div className="ml-3 flex-1 space-y-2">
                  <div className="h-4 bg-borderDark rounded w-1/2"></div>
                  <div className="h-3 bg-borderDark rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-card rounded-xl border border-borderDark">
              <p className="text-textMuted text-sm mb-4">No transactions yet</p>
              <Button size="sm" onClick={() => navigate('/send')}>Send Money</Button>
            </div>
          ) : (
            recentTransactions.map((tx, idx) => {
              // Map fields correctly based on SDK / Smart contract return
              const isSend = tx.sender.toString() === publicKey?.toString();
              const amountDisplay = Number(tx.amountUsdc) / 1000000;
              const dateDisplay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(tx.timestamp * 1000));
              const displayAddr = isSend ? tx.recipient.toString() : tx.sender.toString();
              const shortAddr = `${displayAddr.slice(0,4)}...${displayAddr.slice(-4)}`;
              const statusText = ['Pending', 'Completed', 'Failed'][tx.status];

              return (
                <div key={idx} onClick={() => navigate(`/history/${tx.pdaAddress}`)} className="flex items-center justify-between p-3 rounded-xl bg-card border border-borderDark cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-borderDark flex items-center justify-center text-sm font-bold">
                      {tx.recipientCountry || '🌎'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{shortAddr}</p>
                      <p className="text-[10px] text-textMuted">{isSend ? 'Sent to' : 'Received from'} • {dateDisplay}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className={`text-sm font-mono font-medium ${isSend ? 'text-textPrimary' : 'text-accent'}`}>
                      {isSend ? '-' : '+'}${amountDisplay.toFixed(2)}
                    </p>
                    <div className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                      tx.status === 1 ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
                    }`}>
                      {statusText}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {recentTransactions.length > 0 && (
          <button onClick={() => navigate('/history')} className="text-sm text-primary text-center w-full py-2 hover:underline flex items-center justify-center">
            View all transactions <ChevronRight size={14} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

const ActionBtn = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-2 group">
    <div className="w-14 h-14 rounded-2xl bg-card border border-borderDark flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
      <Icon size={24} className="text-primary" />
    </div>
    <span className="text-xs font-medium text-textMuted group-hover:text-textPrimary transition-colors">{label}</span>
  </button>
);
