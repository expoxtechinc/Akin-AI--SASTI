/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  MapPin, 
  Files, 
  Zap, 
  Settings, 
  Bell, 
  Smartphone,
  Cpu,
  Fingerprint,
  Wifi,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Scan,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardHub } from './components/shield/DashboardHub';
import { SecurityLogs } from './components/shield/SecurityLogs';
import { FileVault } from './components/shield/FileVault';
import { ThreatScanner } from './components/shield/ThreatScanner';
import { GPSLocator } from './components/shield/GPSLocator';
import { Sidebar } from './components/shield/Sidebar';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'vault' | 'scanner' | 'gps'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [shieldStatus, setShieldStatus] = useState<'healthy' | 'alert' | 'breach'>('healthy');
  
  return (
    <div className="min-h-screen bg-[#05080a] text-[#c0d6df] font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative flex h-screen overflow-hidden border-t border-cyan-500/20">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto customized-scrollbar relative">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[#05080a]/80 backdrop-blur-md border-b border-cyan-500/10">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/20"
                >
                  <Menu size={20} className="text-cyan-400" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-display font-bold tracking-wider text-white flex items-center gap-2">
                   <Shield className="text-cyan-400" size={24} />
                   FREEME <span className="text-cyan-400">SHIELD</span>
                </h1>
                <p className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-widest">Quantum Encryption Active</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/5 border border-cyan-500/20 rounded-full">
                <div className={`w-2 h-2 rounded-full ${shieldStatus === 'healthy' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] animate-pulse'}`} />
                <span className="text-[11px] font-mono uppercase tracking-tight">System {shieldStatus}</span>
              </div>
              
              <button className="relative p-2 text-cyan-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#05080a]" />
              </button>
              
              <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors">
                <Fingerprint size={18} className="text-cyan-400" />
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-8 pb-24">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <DashboardHub />
                </motion.div>
              )}
              {activeTab === 'logs' && <SecurityLogs key="logs" />}
              {activeTab === 'vault' && <FileVault key="vault" />}
              {activeTab === 'scanner' && <ThreatScanner key="scanner" />}
              {activeTab === 'gps' && <GPSLocator key="gps" />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-[#05080a] border-t border-cyan-500/10 px-4 flex items-center justify-between text-[10px] font-mono text-cyan-500/40 z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Wifi size={10} /> VPN: CONNECTED (AES-256)</span>
          <span className="flex items-center gap-1"><Cpu size={10} /> AI LOAD: 4.2%</span>
        </div>
        <div className="flex items-center gap-4 uppercase">
          <span>Shield Build v2.4.0</span>
          <span className="text-cyan-400/60">Ready for scan</span>
        </div>
      </footer>
    </div>
  );
}



