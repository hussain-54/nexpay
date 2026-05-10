import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Send, Download, Wallet, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from './ui';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Send, label: 'Send', path: '/send' },
    { icon: Download, label: 'Receive', path: '/receive' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="absolute bottom-0 w-full h-[84px] bg-[#0A0A0F]/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-4 pb-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/home' && location.pathname === '/');
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="group relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300"
          >
            {/* Active Pill Background */}
            <div className={cn(
              "absolute inset-0 top-2 bottom-4 rounded-2xl transition-all duration-300 -z-10",
              isActive ? "bg-white/5 scale-100 opacity-100" : "scale-50 opacity-0"
            )} />
            
            {/* Icon */}
            <item.icon 
              size={isActive ? 24 : 22} 
              className={cn(
                "mb-1 transition-all duration-300",
                isActive ? "text-primary transform -translate-y-0.5" : "text-textMuted group-hover:text-textPrimary"
              )} 
            />
            
            {/* Label */}
            <span className={cn(
              "text-[10px] font-semibold tracking-wide transition-colors duration-300",
              isActive ? "text-textPrimary" : "text-textMuted"
            )}>
              {item.label}
            </span>

            {/* Active Dot Indicator */}
            {isActive && (
              <div className="absolute bottom-2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
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
