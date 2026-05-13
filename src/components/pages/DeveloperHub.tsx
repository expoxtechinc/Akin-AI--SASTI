/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code2, Cpu, Globe, Database, Shield, ArrowRight, Zap, Boxes } from 'lucide-react';

const API_RESOURCES = [
  { title: 'REST API Reference', desc: 'Complete documentation for our low-latency inference endpoints.', icon: Globe },
  { title: 'SDK Libraries', desc: 'Official wrappers for TypeScript, Python, and Rust.', icon: Boxes },
  { title: 'Model Garden', desc: 'Detailed specs for our specific Seraphina & Leander archetypes.', icon: Cpu },
  { title: 'Security Protocols', desc: 'Overview of our data isolation and encryption standards.', icon: Shield }
];

export const DeveloperHub: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-20 pb-32">
      <div className="flex flex-col lg:flex-row items-center gap-12 mb-20 bg-stone-900 rounded-[64px] p-12 lg:p-20 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] rounded-full -mr-48 -mt-48" />
         <div className="flex-1 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
               <Terminal size={14} className="text-emerald-400" /> API VERSION 4.2.0
            </div>
            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-[0.9]">
              Build With <br />
              <span className="text-emerald-400">Intelligence</span>
            </h1>
            <p className="text-stone-400 font-medium text-lg leading-relaxed max-w-xl">
              Integrate the AkinAI emotional engine directly into your applications. Low latency, high empathy, infinite scale.
            </p>
            <div className="flex flex-wrap gap-4">
               <button className="px-8 py-4 bg-emerald-500 text-stone-950 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 transition-all shadow-xl shadow-emerald-500/20">
                  Generate API Key
               </button>
               <button className="px-8 py-4 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/5 transition-all">
                  Read Core SDK
               </button>
            </div>
         </div>
         <div className="flex-1 w-full relative z-10">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 font-mono text-sm space-y-4">
               <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-4 text-[10px] text-stone-500 uppercase font-black">Seraphina-Connect.ts</span>
               </div>
               <div className="space-y-1">
                  <p className="text-stone-500">{"// Initialize emotional bridge"}</p>
                  <p><span className="text-indigo-400">const</span> <span className="text-emerald-400">akin</span> = <span className="text-indigo-400">new</span> <span className="text-amber-400">AkinEngine</span>({'{'} apiKey: <span className="text-rose-400">"AKIN_..."</span> {'}'});</p>
                  <p className="pt-4"><span className="text-indigo-400">await</span> akin.<span className="text-emerald-400">connect</span>({'{'} </p>
                  <p className="pl-4">persona: <span className="text-rose-400">"SERAPHINA"</span>,</p>
                  <p className="pl-4">mode: <span className="text-rose-400">"LIVE_AUDIO"</span></p>
                  <p>{'}'});</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {API_RESOURCES.map((res, i) => (
           <div key={i} className="group p-8 bg-white border border-stone-100 rounded-[40px] hover:border-indigo-600 transition-all hover:shadow-2xl hoverShadow-indigo-100 cursor-pointer">
              <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-900 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                 <res.icon size={24} />
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight text-stone-900 mb-2">{res.title}</h4>
              <p className="text-stone-500 text-xs font-medium leading-relaxed italic">{res.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );
};
