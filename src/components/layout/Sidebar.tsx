/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Menu, 
  X, 
  ChevronRight,
  MessageSquare, Brain, BookOpen, PenTool, Clapperboard,
  Cpu, Bug, Database, Mail, TrendingUp, Share2, Type,
  Languages, FileText, Zap, Calculator, Lightbulb, UserPlus,
  Mic, Search as SearchIcon, Gamepad2, Calendar, Compass,
  LayoutDashboard, MapPin, Video, Image, MessageCircle, Music, Eye, Activity, Brush, GraduationCap, Server
} from 'lucide-react';
import { AITool, ToolCategory } from '../../types';
import { TOOLS } from '../../constants';
import { cn } from '../../lib/utils';
import { CreatorInfo } from './CreatorInfo';

interface SidebarProps {
  activeToolId: string;
  onSelectTool: (tool: AITool) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ICON_MAP: Record<string, any> = {
  MessageSquare, Brain, BookOpen, PenTool, Clapperboard,
  Cpu, Bug, Database, Mail, TrendingUp, Share2, Type,
  Languages, FileText, Zap, Calculator, Lightbulb, UserPlus,
  Mic, Search: SearchIcon, Gamepad2, Calendar, Compass, MapPin, Video, Image, MessageCircle, Music, Eye, Activity, Brush, GraduationCap, Server
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeToolId, 
  onSelectTool, 
  isOpen, 
  onToggle 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categories = Object.values(ToolCategory);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden" 
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 w-64 bg-stone-950 text-stone-300 z-50 flex flex-col shadow-2xl",
          "lg:translate-x-0 lg:static"
        )}
      >
        <div className="p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
               <div className="w-5 h-5 bg-white text-black rounded flex items-center justify-center font-black text-[10px]">A</div>
               AkinAI
            </h1>
            <button onClick={onToggle} className="lg:hidden p-2 text-stone-500 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <button 
            onClick={() => {
              onSelectTool(TOOLS[0]); // Default to first tool as fallback
              if (window.innerWidth < 1024) onToggle();
            }}
            id="sidebar-home-btn"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-4 rounded-2xl transition-all group relative border border-white/5 bg-gradient-to-br from-indigo-600/20 to-transparent",
              activeToolId === 'dashboard' ? "bg-indigo-600 text-white" : "text-stone-300 hover:bg-stone-900"
            )}
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
               <Globe size={18} />
            </div>
            <div className="flex flex-col items-start leading-none">
               <span className="text-xs font-black uppercase tracking-widest">Live Platform</span>
               <span className="text-[10px] font-bold text-stone-500 uppercase mt-1">Ecosystem Hub</span>
            </div>
          </button>
          
          <button 
            onClick={() => onSelectTool(TOOLS[0])}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-900 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-stone-800 flex items-center justify-center">
                 <Zap size={12} className="text-stone-500 group-hover:text-white" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-widest">New Tool</span>
            </div>
            <PenTool size={14} className="text-stone-700" />
          </button>
        </div>

        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={14} />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-stone-900 rounded-lg text-xs text-white focus:outline-none focus:border-stone-800 transition-all placeholder:text-stone-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-8 customized-scrollbar-dark">
          {categories.map(category => {
            const categoryTools = filteredTools.filter(tool => tool.category === category);
            if (categoryTools.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <h3 className="px-3 text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] mb-2">
                  {category}
                </h3>
                {categoryTools.map(tool => {
                  const isActive = activeToolId === tool.id;
                  const Icon = ICON_MAP[tool.icon] || LayoutDashboard;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onSelectTool(tool);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative",
                        isActive 
                          ? "bg-stone-900 text-white" 
                          : "text-stone-500 hover:bg-stone-900 hover:text-stone-200"
                      )}
                    >
                      {isActive && <div className="absolute left-0 w-1 h-4 bg-white rounded-r-full" />}
                      <Icon size={14} className={cn(isActive ? "text-white" : "text-stone-700 group-hover:text-stone-400")} />
                      <span className="text-[13px] font-medium flex-1 text-left line-clamp-1">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="mt-auto p-3 bg-stone-950">
          <div className="p-3 bg-stone-900/50 rounded-xl space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-stone-800 border border-green-500/30 flex items-center justify-center">
                   <MessageCircle size={14} className="text-green-500" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-white uppercase">Pro Plan</span>
                   <span className="text-[9px] text-stone-500">Unrestricted Creative Access</span>
                </div>
             </div>
             <button className="w-full py-2 bg-stone-800 text-[10px] font-bold text-white rounded-lg hover:bg-white hover:text-black transition-all uppercase tracking-widest">
                Upgrade Engine
             </button>
          </div>
        </div>
        <div className="pb-4">
          <CreatorInfo />
        </div>
      </motion.aside>
    </>
  );
};
