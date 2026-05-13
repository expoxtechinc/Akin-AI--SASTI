/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Cpu, 
  Database, 
  Zap, 
  Globe, 
  Shield, 
  Terminal, 
  Activity,
  ChevronRight,
  Plus,
  Minus,
  Settings,
  HardDrive
} from 'lucide-react';
import { AITool } from '../../types';
import { cn } from '../../lib/utils';

interface CloudArchitectProps {
  tool: AITool;
}

export const CloudArchitect: React.FC<CloudArchitectProps> = ({ tool }) => {
  const [config, setConfig] = useState({
    vCPUs: 8,
    ram: 32,
    storage: 500,
    gpu: 'RTX 4090',
    os: 'Ubuntu 24.04 LTS',
    bandwidth: 1,
    region: 'US-East (N. Virginia)',
    purpose: 'Deep Learning Training'
  });

  const regions = [
    'US-East (N. Virginia)',
    'US-West (Oregon)',
    'Europe (Frankfurt)',
    'Asia Pacific (Tokyo)',
    'South America (São Paulo)',
    'Africa (Monrovia, LR)'
  ];

  const gpus = [
    'None',
    'RTX 4090 (24GB)',
    'NVIDIA A100 (80GB)',
    'NVIDIA H100 (80GB)',
    'NVIDIA L40S (48GB)'
  ];

  const oss = [
    'Ubuntu 24.04 LTS',
    'Ubuntu 22.04 LTS',
    'CentOS Stream 9',
    'Debian 12',
    'Windows Server 2022'
  ];

  const purposes = [
    'Deep Learning Training',
    'LLM Inferencing',
    'Web Application Hosting',
    'Data Analytics Pipeline',
    'Game Server Build'
  ];

  const estimatedMonthly = useMemo(() => {
    let base = (config.vCPUs * 5) + (config.ram * 2) + (config.storage * 0.1);
    const gpuPrice = {
      'None': 0,
      'RTX 4090 (24GB)': 250,
      'NVIDIA A100 (80GB)': 1200,
      'NVIDIA H100 (80GB)': 2800,
      'NVIDIA L40S (48GB)': 800
    }[config.gpu as keyof typeof gpuPrice] || 0;
    
    return Math.round((base + gpuPrice + (config.bandwidth * 10)) * 100) / 100;
  }, [config]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 border-b border-stone-100">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <Server size={24} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">{tool.name}</h1>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">{tool.description}</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 customized-scrollbar">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Configuration Form */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Compute */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-stone-900">
                <Cpu size={20} className="text-indigo-600" />
                <h2 className="text-sm font-black uppercase tracking-wider">Compute & Memory</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">vCPUs</label>
                    <span className="text-sm font-black text-indigo-600">{config.vCPUs} Cores</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setConfig(c => ({ ...c, vCPUs: Math.max(2, c.vCPUs - 2) }))}
                      className="w-10 h-10 border border-stone-200 rounded-xl flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="range" min="2" max="128" step="2"
                      value={config.vCPUs} 
                      onChange={(e) => setConfig(c => ({ ...c, vCPUs: parseInt(e.target.value) }))}
                      className="flex-1 h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <button 
                      onClick={() => setConfig(c => ({ ...c, vCPUs: Math.min(128, c.vCPUs + 2) }))}
                      className="w-10 h-10 border border-stone-200 rounded-xl flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">RAM (Memory)</label>
                    <span className="text-sm font-black text-indigo-600">{config.ram} GB</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setConfig(c => ({ ...c, ram: Math.max(4, c.ram - 4) }))}
                      className="w-10 h-10 border border-stone-200 rounded-xl flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="range" min="4" max="1024" step="4"
                      value={config.ram} 
                      onChange={(e) => setConfig(c => ({ ...c, ram: parseInt(e.target.value) }))}
                      className="flex-1 h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <button 
                      onClick={() => setConfig(c => ({ ...c, ram: Math.min(1024, c.ram + 4) }))}
                      className="w-10 h-10 border border-stone-200 rounded-xl flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage & OS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-stone-900">
                <HardDrive size={20} className="text-indigo-600" />
                <h2 className="text-sm font-black uppercase tracking-wider">Storage & Software</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">NVMe SSD Storage</label>
                  <select 
                    value={config.storage}
                    onChange={(e) => setConfig(c => ({ ...c, storage: parseInt(e.target.value) }))}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                  >
                    {[100, 250, 500, 1000, 2000, 5000].map(s => (
                      <option key={s} value={s}>{s >= 1000 ? `${s/1000} TB` : `${s} GB`}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Operating System</label>
                  <select 
                    value={config.os}
                    onChange={(e) => setConfig(c => ({ ...c, os: e.target.value }))}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                  >
                    {oss.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* GPU & Performance */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-stone-900">
                <Zap size={20} className="text-indigo-600" />
                <h2 className="text-sm font-black uppercase tracking-wider">Acceleration (GPU)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">GPU Model</label>
                  <select 
                    value={config.gpu}
                    onChange={(e) => setConfig(c => ({ ...c, gpu: e.target.value }))}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                  >
                    {gpus.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Bandwidth (Gbps)</label>
                  <select 
                    value={config.bandwidth}
                    onChange={(e) => setConfig(c => ({ ...c, bandwidth: parseInt(e.target.value) }))}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                  >
                    {[1, 5, 10, 25, 40, 100].map(b => (
                      <option key={b} value={b}>{b} Gbps Guaranteed</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Deployment Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-stone-900">
                <Globe size={20} className="text-indigo-600" />
                <h2 className="text-sm font-black uppercase tracking-wider">Deployment & Region</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Data Center Region</label>
                  <select 
                    value={config.region}
                    onChange={(e) => setConfig(c => ({ ...c, region: e.target.value }))}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                  >
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Server Purpose</label>
                  <select 
                    value={config.purpose}
                    onChange={(e) => setConfig(c => ({ ...c, purpose: e.target.value }))}
                    className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                  >
                    {purposes.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout / Summary */}
          <div className="lg:col-span-1">
             <div className="sticky top-0 bg-[#0a0a0a] text-white p-8 rounded-[40px] shadow-2xl shadow-indigo-500/10 space-y-8">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 block mb-2">Order Summary</span>
                   <h2 className="text-2xl font-black tracking-tight">Configuration Profile</h2>
                </div>

                <div className="space-y-4 border-y border-white/5 py-6">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                      <span>Compute</span>
                      <span className="text-white">{config.vCPUs} vCPUs / {config.ram}GB RAM</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                      <span>Storage</span>
                      <span className="text-white">{config.storage >= 1000 ? `${config.storage/1000}TB` : `${config.storage}GB`} SSD</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                      <span>GPU</span>
                      <span className="text-indigo-400">{config.gpu}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                      <span>Network</span>
                      <span className="text-white">{config.bandwidth} Gbps</span>
                   </div>
                </div>

                <div className="space-y-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Estimated Monthly Cost</span>
                   <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">${estimatedMonthly}</span>
                      <span className="text-sm font-bold text-stone-500">/ mo</span>
                   </div>
                </div>

                <button className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                   Provision Now <ChevronRight size={18} />
                </button>

                <div className="flex items-center gap-3 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                   <Shield size={14} className="text-green-500" />
                   <span>99.99% Uptime SLA Guaranteed</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
