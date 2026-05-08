import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Send, History, Wallet } from 'lucide-react';
import { WalletButton } from './WalletButton';

export const Navbar: React.FC = () => {
  const router = useRouter();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Send', path: '/send', icon: Send },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <nav className="glass sticky top-4 mx-4 my-4 rounded-3xl z-50 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-all">
          <Wallet className="text-black size-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">NexPay</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-2 text-sm font-bold transition-all hover:text-primary ${isActive ? "text-primary" : "text-white/50"}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <WalletButton />
    </nav>
  );
};
