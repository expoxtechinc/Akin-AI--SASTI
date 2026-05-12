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
  LayoutDashboard, MapPin, Video, Image, MessageCircle
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
  Mic, Search: SearchIcon, Gamepad2, Calendar, Compass, MapPin, Video, Image, MessageCircle
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
          "fixed top-0 left-0 bottom-0 w-80 bg-stone-50 border-r border-stone-200 z-50 flex flex-col",
          "lg:translate-x-0 lg:static"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-xl shadow-md border border-stone-200">
              <img 
                src="https://www.image2url.com/r2/default/images/1778503153344-dedc222a-cefc-456a-b4b2-50e8b3e2226f.jpg" 
                alt="AkinAI Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-stone-900 group">
              Akin<span className="text-stone-500">AI</span>
            </h1>
          </div>
          <button onClick={onToggle} className="lg:hidden p-2 text-stone-500 hover:text-stone-900">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Find a tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6 scrollbar-thin">
          {categories.map(category => {
            const categoryTools = filteredTools.filter(tool => tool.category === category);
            if (categoryTools.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <h3 className="px-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                  {category}
                </h3>
                {categoryTools.map(tool => {
                  const Icon = ICON_MAP[tool.icon] || LayoutDashboard;
                  const isActive = activeToolId === tool.id;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onSelectTool(tool);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                        isActive 
                          ? "bg-stone-900 text-stone-50 shadow-lg shadow-stone-200" 
                          : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900"
                      )}
                    >
                      <Icon size={18} className={cn(isActive ? "text-stone-50" : "text-stone-400 group-hover:text-stone-900")} />
                      <span className="text-sm font-medium flex-1 text-left">{tool.name}</span>
                      <ChevronRight size={14} className={cn("opacity-0 transition-opacity", isActive ? "opacity-100" : "group-hover:opacity-100")} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-stone-200">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">Community</h4>
            <div className="flex flex-col gap-2">
              <a 
                href="https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={16} />
                WhatsApp Group
              </a>
              <a 
                href="https://whatsapp.com/channel/0029VbCYgbzL7UVcJBJGAu3u" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors"
              >
                <div className="w-4 h-4 bg-stone-900 rounded-full flex items-center justify-center text-[8px] text-white">A</div>
                WhatsApp Channel
              </a>
            </div>
          </div>
        </div>
        <CreatorInfo />
      </motion.aside>
    </>
  );
};
