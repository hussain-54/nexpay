import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Bell as BellIcon, HelpCircle, LogOut, ChevronRight, Copy, ExternalLink, Snowflake } from 'lucide-react';
import { Button, Card, Switch } from '../components/ui';
import { useStore } from '../store/useStore';
import { useToast } from '../contexts/ToastContext';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { PROGRAM_ID } from '../lib/solana';
import { setWalletFrozen } from '../lib/nexpay-sdk';
import { WalletGuard } from '../components/WalletGuard';

export const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useStore();
  const { showToast } = useToast();
  const { disconnect, userAccount, refreshUserAccount, walletAdapter } = useSolanaWallet();
  
  const [isFrozen, setIsFrozen] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);

  useEffect(() => {
    if (userAccount) {
      setIsFrozen(userAccount.isFrozen);
    }
  }, [userAccount]);

  const handleLogout = () => {
    disconnect();
    logout();
    navigate('/onboarding');
  };

  const handleCopyCode = () => {
    if (userAccount?.referralCode) {
      navigator.clipboard.writeText(userAccount.referralCode);
      showToast("Referral code copied!", "success");
    }
  };

  const handleFreezeToggle = async () => {
    if (!walletAdapter) return;
    const newFrozenState = !isFrozen;
    
    if (newFrozenState) {
      if (!window.confirm("This will prevent all outgoing transfers. Continue?")) return;
    }
    
    setIsFreezing(true);
    try {
      await setWalletFrozen(walletAdapter, newFrozenState);
      await refreshUserAccount();
      setIsFrozen(newFrozenState);
      showToast(newFrozenState ? "Wallet frozen" : "Wallet unfrozen", "success");
    } catch (e) {
      console.error(e);
      showToast(`Failed to toggle freeze: ${e.message}`, "error");
    } finally {
      setIsFreezing(false);
    }
  };

  const tierName = userAccount ? ['Free', 'Pro', 'Business'][userAccount.tier] : 'Free';
  const joinDate = userAccount ? new Date(userAccount.createdAt * 1000).toLocaleDateString() : '';

  return (
    <WalletGuard>
      <div className="flex flex-col h-full bg-bgDark">
        <div className="flex items-center p-4 border-b border-borderDark shrink-0">
          <h1 className="text-xl font-bold flex-1">Settings & Profile</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-6">
          <Card className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white shrink-0">
                {userAccount?.username?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-textPrimary truncate">{userAccount?.username || 'User'}</h2>
                <div className="flex items-center mt-1">
                  <Shield size={14} className={userAccount?.kycVerified ? "text-accent" : "text-warning"} />
                  <span className={`text-xs ml-1 font-medium ${userAccount?.kycVerified ? "text-accent" : "text-warning"}`}>
                    {userAccount?.kycVerified ? "Verified ✓" : "Unverified — Complete KYC"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-borderDark">
              <div>
                <p className="text-xs text-textMuted">Tier</p>
                <p className="font-bold text-sm">{tierName}</p>
              </div>
              <div>
                <p className="text-xs text-textMuted">Total Transfers</p>
                <p className="font-bold text-sm">{userAccount?.transferCount || 0}</p>
              </div>
              <div>
                <p className="text-xs text-textMuted">Member Since</p>
                <p className="font-bold text-sm">{joinDate}</p>
              </div>
              <div>
                <p className="text-xs text-textMuted">Referral Code</p>
                <button onClick={handleCopyCode} className="font-mono text-sm font-bold text-primary flex items-center hover:underline">
                  {userAccount?.referralCode || 'N/A'} <Copy size={12} className="ml-1" />
                </button>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-textMuted px-2">Security</h3>
            <Card className="p-0 overflow-hidden divide-y divide-borderDark">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center">
                    <Snowflake size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Freeze Wallet</p>
                    <p className="text-xs text-textMuted">Block outgoing transfers</p>
                  </div>
                </div>
                <Switch checked={isFrozen} onChange={handleFreezeToggle} disabled={isFreezing} />
              </div>
              <SettingLink icon={Key} title="Two-Factor Auth" desc="Manage 2FA devices" />
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-textMuted px-2">About</h3>
            <Card className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-textMuted">Program ID</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(PROGRAM_ID.toString());
                    showToast("Program ID copied!", "success");
                  }} 
                  className="font-mono text-xs text-textPrimary flex items-center"
                >
                  {PROGRAM_ID.toString().slice(0,8)}... <Copy size={12} className="ml-1 text-textMuted" />
                </button>
              </div>
              <div className="pt-2 border-t border-borderDark flex justify-between items-center">
                <span className="text-sm text-textMuted">Network</span>
                <span className="text-sm font-bold">Solana Devnet</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start pl-0 mt-2 text-primary"
                onClick={() => window.open(`https://explorer.solana.com/address/${PROGRAM_ID.toString()}?cluster=devnet`, '_blank')}
              >
                <ExternalLink size={16} className="mr-2" /> View on Explorer
              </Button>
            </Card>
          </div>

          <Button variant="ghost" className="w-full text-danger hover:bg-danger/10 hover:text-danger mt-8" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" /> Disconnect Wallet
          </Button>
        </div>
      </div>
    </WalletGuard>
  );
};

const SettingLink = ({ icon: Icon, title, desc }) => (
  <button className="w-full flex items-center justify-between p-4 hover:bg-borderDark/30 transition-colors text-left rounded-xl">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full bg-borderDark flex items-center justify-center text-textMuted">
        <Icon size={16} />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-textMuted">{desc}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-textMuted" />
  </button>
);
