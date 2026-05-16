/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Zap,
  Menu,
  Edit3,
  MoreVertical,
  AudioLines,
  MessageSquare
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'chat' | 'profile'>('chat');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000 * 30); // Update every 30 seconds to save cycles
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: false 
  });

  return (
     <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden max-w-md mx-auto relative shadow-2xl">
      {/* Status Bar */}
      <div className="h-6 flex-none flex justify-between items-center px-6 pt-2 z-40">
        <span className="text-[10px] font-bold tracking-tight">{formattedTime}</span>
        <div className="flex items-center gap-1.5 opacity-60">
           <div className="flex gap-0.5 items-end">
             <div className="w-[1.5px] h-1.5 bg-white rounded-full" />
             <div className="w-[1.5px] h-2.5 bg-white rounded-full" />
             <div className="w-[1.5px] h-2 bg-white/20 rounded-full" />
             <div className="w-[1.5px] h-3 bg-white/20 rounded-full" />
           </div>
           <div className="w-5 h-2.5 rounded-[3px] border border-white/40 relative">
             <div className="absolute left-[1px] top-[1px] bottom-[1px] w-2.5 bg-white rounded-[1px]" />
           </div>
        </div>
      </div>

      {/* Header */}
      <header className="px-4 py-3 flex-none flex justify-between items-center z-40">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/15 rounded-full transition-colors"
        >
          <Menu size={20} className="text-white" />
        </button>

        <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/5">
          <button 
            onClick={() => { onSelectTool(null); setActiveTab('chat'); }}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors"
          >
            <Edit3 size={18} className="text-white/80" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors">
            <MoreVertical size={18} className="text-white/80" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool?.id || activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute top-0 bottom-0 left-0 w-4/5 bg-[#171717] z-[80] shadow-2xl p-6 flex flex-col"
            >
               <div className="flex items-center gap-3 mb-10 mt-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                     <AudioLines size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight tracking-tighter italic">AkinAI</h2>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Neural Matrix</p>
                  </div>
               </div>

               <div className="flex-1 space-y-2">
                  {[
                    { id: 'chat', icon: MessageSquare, label: 'Neural Chat' },
                    { id: 'explore', icon: LayoutDashboard, label: 'Applications' },
                    { id: 'profile', icon: User, label: 'Founder Profile' },
                    { id: 'settings', icon: Settings, label: 'System Config' }
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => { 
                        setActiveTab(item.id as any); 
                        setIsMenuOpen(false); 
                        if(item.id === 'chat') onSelectTool(null);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                        activeTab === item.id ? "bg-white/10 text-white" : "text-stone-400 hover:bg-white/5"
                      )}
                    >
                      <item.icon size={20} />
                      <span className="text-sm font-bold">{item.label}</span>
                    </button>
                  ))}
               </div>

               <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 p-2">
                     <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-[10px] font-black">
                        {userEmail.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-xs font-medium text-stone-400 truncate">{userEmail}</span>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Explore Dashboard Overlay */}
      {activeTab === 'explore' && !activeTool && (
        <NeuralDashboard 
          onSelectTool={(tool) => { onSelectTool(tool); setActiveTab('chat'); }}
          onClose={() => setActiveTab('chat')}
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
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" 
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
