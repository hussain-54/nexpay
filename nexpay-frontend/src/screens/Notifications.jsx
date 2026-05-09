import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { getProgram } from '../lib/solana';
import { WalletGuard } from '../components/WalletGuard';

export const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAllRead, addNotification } = useStore();
  const { walletAdapter, publicKey } = useSolanaWallet();
  const listenerId = useRef(null);

  useEffect(() => {
    markAllRead();
  }, []);

  useEffect(() => {
    if (!walletAdapter || !publicKey) return;
    const program = getProgram(walletAdapter);

    // Subscribe to TransferCompleted events
    const setupListener = async () => {
      listenerId.current = program.addEventListener("TransferCompleted", (event, slot) => {
        // If we received funds
        if (event.recipient.toString() === publicKey.toString()) {
          const amount = Number(event.amountUsdc) / 1000000;
          const senderShort = `${event.sender.toString().slice(0, 8)}...`;
          addNotification({
            type: "receive",
            title: `Money received: +${amount.toFixed(2)} USDC`,
            body: `From ${senderShort}`,
            time: new Date().toISOString(),
            unread: true,
          });
        }
      });
    };
    
    setupListener();

    return () => {
      if (listenerId.current !== null) {
        program.removeEventListener(listenerId.current).catch(console.error);
      }
    };
  }, [walletAdapter, publicKey]);

  const getIcon = (type) => {
    switch (type) {
      case 'receive': return <ArrowDownLeft size={20} className="text-accent" />;
      case 'send': return <ArrowUpRight size={20} className="text-textPrimary" />;
      case 'security': return <ShieldCheck size={20} className="text-primary" />;
      default: return <Bell size={20} className="text-textMuted" />;
    }
  };

  return (
    <WalletGuard>
      <div className="flex flex-col h-full bg-bgDark">
        <div className="flex items-center justify-between p-4 border-b border-borderDark relative shrink-0">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-card">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Notifications</h1>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-textMuted">
              <Bell size={48} className="mb-4 opacity-20" />
              <p>No new notifications</p>
            </div>
          ) : (
            notifications.map((notif, idx) => {
              const timeDisplay = new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateDisplay = new Date(notif.time).toLocaleDateString();
              
              return (
                <Card key={idx} className={`p-4 flex items-start space-x-4 ${notif.unread ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === 'receive' ? 'bg-accent/10' :
                    notif.type === 'security' ? 'bg-primary/10' : 'bg-card border border-borderDark'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-textPrimary">{notif.title}</h3>
                      <span className="text-[10px] text-textMuted whitespace-nowrap ml-2">{dateDisplay}</span>
                    </div>
                    <p className="text-xs text-textMuted mt-1">{notif.body}</p>
                    <p className="text-[10px] text-textMuted mt-2">{timeDisplay}</p>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </WalletGuard>
  );
};
