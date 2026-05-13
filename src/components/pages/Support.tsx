/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  MessageSquare, 
  Search, 
  Book, 
  Mail, 
  MessageCircle,
  LifeBuoy,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const FAQ_CATEGORIES = [
  { id: 'basics', name: 'Platform Basics', icon: Book },
  { id: 'account', name: 'Account & Billing', icon: Mail },
  { id: 'technique', name: 'Advanced AI', icon: Zap },
  { id: 'security', name: 'Privacy & Safety', icon: ShieldCheck }
];

export const HelpSupport: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('basics');

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-20 pb-32">
      <div className="relative mb-20">
         <div className="absolute inset-0 bg-indigo-600/5 blur-[120px] -z-10 rounded-full" />
         <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-stone-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-stone-100 border border-stone-50">
               <LifeBuoy size={14} className="text-indigo-600" /> Support Ecosystem
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-stone-900 italic uppercase leading-none">
              How can we <br />
              <span className="text-indigo-600">Elevate</span> your experience?
            </h1>
            <div className="max-w-2xl mx-auto relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
               <input 
                  type="text" 
                  placeholder="Search our knowledge archive..." 
                  className="w-full pl-16 pr-8 py-6 bg-white border border-stone-100 rounded-[32px] text-lg font-medium text-stone-900 shadow-2xl shadow-stone-100 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-4">
           {FAQ_CATEGORIES.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={cn(
                 "w-full flex items-center justify-between p-6 rounded-[32px] transition-all group",
                 activeCategory === cat.id 
                  ? "bg-stone-900 text-white shadow-2xl shadow-stone-300" 
                  : "bg-white text-stone-500 hover:bg-stone-50 border border-stone-100"
               )}
             >
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                     activeCategory === cat.id ? "bg-white/10" : "bg-stone-100 group-hover:bg-stone-200"
                   )}>
                      <cat.icon size={20} />
                   </div>
                   <span className="font-black uppercase tracking-widest text-[11px]">{cat.name}</span>
                </div>
                <ChevronRight size={18} className={cn("transition-transform", activeCategory === cat.id ? "rotate-90" : "")} />
             </button>
           ))}

           <div className="mt-12 p-8 bg-indigo-600 rounded-[40px] text-white space-y-6 shadow-2xl shadow-indigo-200">
              <MessageSquare size={32} />
              <h4 className="text-xl font-black uppercase tracking-tight italic">Live Concierge</h4>
              <p className="text-sm text-indigo-100 font-medium leading-relaxed">Need human intervention? Our support architects are standing by for real-time resolution.</p>
              <button className="w-full py-4 bg-white text-indigo-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] transition-transform">
                 Initiate Chat
              </button>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[48px] p-12 border border-stone-100 min-h-[500px]">
              <h3 className="text-2xl font-black uppercase tracking-tight text-stone-900 mb-8 pb-4 border-b border-stone-100">
                / Popular Questions
              </h3>
              <div className="space-y-6">
                 {[1, 2, 3, 4].map((i) => (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     key={i} 
                     className="group p-6 rounded-[32px] hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all cursor-pointer"
                   >
                      <div className="flex items-start justify-between gap-4">
                         <div className="space-y-2">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Platform Tutorial</span>
                            <h5 className="font-black uppercase tracking-tight text-lg text-stone-900 italic">How do I fine-tune Seraphina's emotional response?</h5>
                            <p className="text-stone-500 text-sm font-medium leading-relaxed">Learn the art of emotional prompt engineering to achieve deep resonance...</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={16} className="text-stone-400" />
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
