import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Send, Download, Wallet, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from './ui';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Send, label: 'Send', path: '/send' },
    { icon: Download, label: 'Receive', path: '/receive' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="absolute bottom-0 w-full h-20 bg-[#0F0F13]/90 backdrop-blur-md border-t border-borderDark flex justify-around items-center px-2 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
              isActive ? "text-primary" : "text-textMuted hover:text-textPrimary"
            )}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Layout = () => {
  const { isLoggedIn, isOnboarded } = useStore();
  const location = useLocation();

  const showNav = isLoggedIn && isOnboarded && !['/onboarding'].includes(location.pathname);

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden bg-bgDark">
      <div className={cn("flex-1 overflow-y-auto no-scrollbar relative", showNav ? "pb-20" : "")}>
        <Outlet />
      </div>
      {showNav && <BottomNav />}
    </div>
  );
};
