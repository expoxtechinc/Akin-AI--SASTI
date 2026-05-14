/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User,
  LayoutDashboard,
  Grid,
  Bell,
  Settings,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AITool } from '../../types';
import { TOOLS } from '../../constants';

import { NeuralDashboard } from './NeuralDashboard';

interface MobileAppLayoutProps {
  activeTool: AITool | null;
  onSelectTool: (tool: AITool | null) => void;
  children: React.ReactNode;
  userEmail?: string;
  onLogout?: () => void;
}

export const MobileAppLayout: React.FC<MobileAppLayoutProps> = ({
  activeTool,
  onSelectTool,
  children,
  userEmail = 'User',
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'chat' | 'profile'>('chat');

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden max-w-md mx-auto relative border-x border-white/5 shadow-2xl">
      {/* Status Bar */}
      <div className="h-10 flex-none flex justify-between items-center px-6 pt-4 z-40">
        <span className="text-xs font-bold tracking-tight">9:41</span>
        <div className="flex items-center gap-1.5">
           <TrendingUp size={12} className="text-stone-500" />
           <div className="flex gap-0.5">
             <div className="w-0.5 h-2 bg-white/20" />
             <div className="w-0.5 h-3 bg-white/20" />
             <div className="w-0.5 h-1 bg-white/20" />
           </div>
           <div className="w-5 h-2.5 rounded-[2px] border border-white/20 relative">
             <div className="absolute left-[1px] top-[1px] bottom-[1px] w-3 bg-white rounded-[1px]" />
           </div>
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex-none flex justify-between items-center z-40">
        <div onClick={() => { onSelectTool(null); setActiveTab('home'); }} className="cursor-pointer">
          <h1 className="text-xl font-black tracking-tighter italic text-indigo-500 flex items-center gap-1">
            AkinAI<span className="text-white not-italic">.</span>
          </h1>
          <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest leading-none">
            {activeTool ? activeTool.name : 'AI Ecosystem'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-white/5 rounded-full border border-white/10 relative">
            <Bell size={18} className="text-stone-400" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-800 to-black border border-white/10 flex items-center justify-center text-[10px] font-black shadow-lg">
            {userEmail.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto customized-scrollbar-dark pb-24 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool?.id || activeTab}
            initial={{ opacity: 0, x: activeTool ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTool ? -20 : 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 inset-x-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/5 px-8 flex items-center justify-between pb-6 z-50">
        <button 
          onClick={() => { setActiveTab('home'); onSelectTool(null); }}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'home' && !activeTool ? "text-indigo-500" : "text-stone-500"
          )}
        >
          <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        </button>

        <button 
          onClick={() => setActiveTab('explore')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'explore' ? "text-indigo-500" : "text-stone-500"
          )}
        >
          <Search size={22} strokeWidth={activeTab === 'explore' ? 2.5 : 2} />
        </button>

        <div className="relative -top-4">
          <button 
            onClick={() => setActiveTab('explore')}
            className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30 rotate-45"
          >
            <Plus size={28} className="text-white -rotate-45" />
          </button>
        </div>

        <button 
          onClick={() => { onSelectTool(TOOLS.find(t => t.id === 'whatsapp-messenger') || null); setActiveTab('chat'); }}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'chat' ? "text-indigo-500" : "text-stone-500"
          )}
        >
          <MessageCircle size={22} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'profile' ? "text-indigo-500" : "text-stone-500"
          )}
        >
          <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
        </button>
      </nav>

      {/* Overlays / Mods */}
      {activeTab === 'explore' && !activeTool && (
        <NeuralDashboard 
          onSelectTool={(tool) => { onSelectTool(tool); setActiveTab('home'); }}
          onClose={() => setActiveTab('home')}
        />
      )}

      {/* Profile Overlay */}
      {activeTab === 'profile' && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 bg-[#0A0A0A] z-[51] p-8 pt-20"
        >
           <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                 <div className="w-full h-full bg-[#0A0A0A] rounded-[38px] flex items-center justify-center">
                    <span className="text-3xl font-black italic">AS</span>
                 </div>
              </div>
              <div>
                 <h2 className="text-2xl font-black">Admin Support</h2>
                 <p className="text-stone-500 text-sm">{userEmail}</p>
              </div>
              
              <div className="w-full grid grid-cols-3 gap-4 pt-4">
                 <div className="bg-white/5 p-4 rounded-[24px] border border-white/10">
                    <span className="block text-lg font-black italic">84</span>
                    <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest text-[8px]">Tools</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-[24px] border border-white/10">
                    <span className="block text-lg font-black italic">12k</span>
                    <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">Calls</span>
                 </div>
                 <div className="bg-white/5 p-4 rounded-[24px] border border-white/10">
                    <span className="block text-lg font-black italic">Pro</span>
                    <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">Plan</span>
                 </div>
              </div>
              
              <div className="w-full space-y-3 pt-6 text-left">
                 <button className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10">
                    <span className="text-sm font-bold uppercase tracking-widest text-stone-300">Billing History</span>
                    <TrendingUp size={16} className="text-stone-600" />
                 </button>
                 <button className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10">
                    <span className="text-sm font-bold uppercase tracking-widest text-stone-300">Security Vault</span>
                    <Settings size={16} className="text-stone-600" />
                 </button>
                 <button 
                  onClick={onLogout}
                  className="w-full p-5 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center font-black uppercase tracking-[0.2em] text-xs gap-2 mt-8"
                 >
                    Logout Platform
                 </button>
              </div>
           </div>
           
           <button 
            onClick={() => setActiveTab('home')}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl"
          >
            <Home size={20} />
          </button>
        </motion.div>
      )}

      {/* Home Indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/10 rounded-full z-50 shadow-sm" />
    </div>
  );
};
