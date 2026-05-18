import React from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  MapPin, 
  Files, 
  Zap, 
  Settings, 
  ChevronLeft,
  LayoutDashboard,
  Activity,
  Scan,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logs', label: 'Security Logs', icon: ShieldAlert },
    { id: 'vault', label: 'File Vault', icon: Lock },
    { id: 'scanner', label: 'Neural Scan', icon: Scan },
    { id: 'gps', label: 'GPS Recovery', icon: MapPin },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 260 : 0 }}
      className={cn(
        "relative bg-[#05080a] border-r border-cyan-500/10 flex flex-col h-full z-40 transition-all",
        !isOpen && "overflow-hidden"
      )}
    >
      <div className="p-6 flex items-center justify-between border-b border-cyan-500/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <ProtectIcon className="text-cyan-400" size={18} />
          </div>
          <span className="font-display font-bold text-white tracking-widest text-sm uppercase">Secure Hub</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-cyan-500/10 rounded transition-colors text-cyan-500/40 hover:text-cyan-400"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group",
                isActive 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "text-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-cyan-500/5 rounded-xl border border-cyan-500/20 -z-10"
                />
              )}
              <Icon size={18} className={cn(isActive ? "text-cyan-400" : "group-hover:text-cyan-400")} />
              <span className="text-sm font-medium tracking-tight whitespace-nowrap">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-cyan-500/5">
         <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all">
           <Settings size={18} />
           <span className="text-sm font-medium tracking-tight">Settings</span>
         </button>
      </div>
    </motion.aside>
  );
}

function ProtectIcon({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
