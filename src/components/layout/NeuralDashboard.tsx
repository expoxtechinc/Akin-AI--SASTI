/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Activity, 
  Zap, 
  Shield, 
  Globe, 
  Database,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { TOOLS } from '../../constants';
import { AITool } from '../../types';

interface NeuralDashboardProps {
  onSelectTool: (tool: AITool) => void;
  onClose: () => void;
}

export const NeuralDashboard: React.FC<NeuralDashboardProps> = ({ onSelectTool, onClose }) => {
  const stats = [
    { label: 'Uptime', value: '99.99%', icon: Activity, color: 'text-green-500' },
    { label: 'Latency', value: '12ms', icon: Zap, color: 'text-amber-500' },
    { label: 'Neural Load', value: '42%', icon: Cpu, color: 'text-indigo-500' },
    { label: 'Security', value: 'Defensive', icon: Shield, color: 'text-blue-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-[#050505] z-[60] p-6 pt-16 overflow-y-auto customized-scrollbar-dark pb-32"
    >
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Omniscient.<span className="text-indigo-500">Core</span></h2>
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">Network Diagnostic & Neural Hub</p>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 glass rounded-[28px] border border-white/5"
          >
            <div className={stat.color}>
              <stat.icon size={18} className="mb-4" />
            </div>
            <span className="block text-2xl font-black italic tracking-tighter leading-none mb-1">{stat.value}</span>
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest leading-none">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Tool Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Available Modules</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent mx-4" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {TOOLS.map((tool, i) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => onSelectTool(tool)}
              className="w-full group relative overflow-hidden p-5 glass rounded-[32px] border border-white/5 text-left transition-all hover:bg-white/[0.07] hover:border-white/20 active:scale-[0.98]"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-white transition-all group-hover:scale-110 group-hover:rotate-3">
                   {/* Map icon based on category for variety */}
                   {tool.category === 'Communication' ? <Globe size={24} /> : 
                    tool.category === 'Productivity' ? <Database size={24} /> : 
                    <Cpu size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate">{tool.name}</h4>
                    <ArrowUpRight size={14} className="text-stone-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest truncate">{tool.category} Protocol</p>
                </div>
              </div>
              
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-indigo-500/0 via-indigo-500/2 to-transparent group-hover:via-indigo-500/10 transition-all duration-700" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
