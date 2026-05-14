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
  Cpu,
  Zap
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
          className="absolute inset-0 bg-[#050505] z-[60] p-8 pt-16 overflow-y-auto customized-scrollbar-dark pb-32"
        >
           <div className="flex flex-col items-center space-y-8">
              {/* Profile Image card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="w-32 h-32 rounded-[48px] bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] relative z-10 overflow-hidden">
                   <div className="w-full h-full bg-[#0A0A0A] rounded-[46px] overflow-hidden">
                      <img 
                        src="https://kommodo.ai/i/gO5HPhOr5NCy7nE7ymSo" 
                        alt="Akin S. Sokpah" 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                   </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 border-[#050505] z-20 shadow-xl">
                   <Zap size={16} className="text-white" />
                </div>
              </div>

              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap">Akin S. Sokpah</h2>
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Founder & Lead Architect</p>
              </div>

              {/* Location Badge */}
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
                 <Grid size={14} className="text-stone-500" />
                 <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest leading-none">
                    Montserrado, Liberia
                 </span>
              </div>
              
              {/* Community Card */}
              <div className="w-full glass p-6 rounded-[32px] border border-white/5 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Origin Core</span>
                    <span className="text-[9px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">Active</span>
                 </div>
                 <p className="text-sm font-medium text-stone-400 leading-relaxed italic">
                    "Driving the neural evolution from the heart of Mount Barclay community to the global stage."
                 </p>
              </div>

              {/* Creator Stats */}
              <div className="w-full grid grid-cols-2 gap-3">
                 <div className="bg-white/5 p-5 rounded-[28px] border border-white/5">
                    <span className="block text-2xl font-black italic tracking-tighter mb-1 uppercase">120+</span>
                    <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Innocations</span>
                 </div>
                 <div className="bg-white/5 p-5 rounded-[28px] border border-white/5">
                    <span className="block text-2xl font-black italic tracking-tighter mb-1 uppercase">Global</span>
                    <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Impact</span>
                 </div>
              </div>
              
              <div className="w-full space-y-3 pt-4">
                 <a 
                   href="https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
                   target="_blank" rel="noreferrer"
                   className="w-full p-6 bg-indigo-600 rounded-[28px] flex items-center justify-between group shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                 >
                    <span className="text-xs font-black uppercase tracking-widest text-white">Join Creator Core</span>
                    <User size={18} className="text-white/50 group-hover:text-white transition-colors" />
                 </a>
                 
                 <button className="w-full p-6 bg-white/5 border border-white/10 rounded-[28px] flex items-center justify-between group hover:bg-white/10 transition-all">
                    <span className="text-xs font-black uppercase tracking-widest text-stone-300">Genesis Repository</span>
                    <Cpu size={18} className="text-stone-600 group-hover:text-indigo-400" />
                 </button>

                 <button 
                  onClick={onLogout}
                  className="w-full py-4 text-red-500/50 hover:text-red-500 transition-colors font-black uppercase tracking-[0.2em] text-[9px] mt-8"
                 >
                    Exit Neural Matrix
                 </button>
              </div>
           </div>
           
           <button 
            onClick={() => setActiveTab('home')}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
          >
            <Home size={24} />
          </button>
        </motion.div>
      )}

      {/* Home Indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/10 rounded-full z-50 shadow-sm" />
    </div>
  );
};
