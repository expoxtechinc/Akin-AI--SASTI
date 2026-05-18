import React, { useState } from 'react';
import { 
  Scan, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Lock, 
  Smartphone,
  Eye,
  Activity,
  Zap,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function ThreatScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedItems, setScannedItems] = useState([
    { name: 'System Kernel', status: 'clean', time: '0.2ms' },
    { name: 'Network Protocol', status: 'clean', time: '0.5ms' },
    { name: 'App Permissions', status: 'clean', time: '0.8ms' },
  ]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 1;
      });
    }, 40);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Neural Threat Scanner</h2>
          <p className="text-sm text-cyan-500/60 font-mono">Deep heuristic system analysis</p>
        </div>
        <button 
          onClick={startScan}
          disabled={isScanning}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all shadow-[0_0_20px_rgba(34,211,238,0.1)]",
            isScanning 
              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-500/40 cursor-not-allowed" 
              : "bg-cyan-400 border-cyan-500 text-[#05080a] hover:bg-white hover:scale-105"
          )}
        >
          {isScanning ? 'Scan in progress...' : 'Initiate Full Scan'}
        </button>
      </div>

      {/* Futuristic Scan Visualizer */}
      <div className="relative aspect-video bg-cyan-950/10 border border-cyan-500/10 rounded-3xl overflow-hidden flex items-center justify-center group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-[0.03]" />
        
        {/* Radar Effect */}
        <div className="relative w-64 h-64 flex items-center justify-center">
           <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin-slow" />
           <div className="absolute inset-[15%] rounded-full border border-cyan-500/10 border-dashed" />
           <div className="absolute inset-[30%] rounded-full border border-cyan-500/5" />
           
           {isScanning && (
             <motion.div 
               initial={{ rotate: 0 }}
               animate={{ rotate: 360 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent origin-center w-full h-[2px] top-1/2 -translate-y-1/2"
             />
           )}

           <div className="z-10 flex flex-col items-center">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-500",
                isScanning ? "bg-cyan-400/10 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] animate-pulse" : "bg-cyan-500/5 border-cyan-500/20"
              )}>
                {isScanning ? <Scan size={40} className="text-cyan-400" /> : <ShieldCheck size={40} className="text-cyan-500/40" />}
              </div>
              <div className="mt-4 text-center">
                 <span className="text-3xl font-display font-bold text-white leading-none">{scanProgress}%</span>
                 <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mt-1">
                   {isScanning ? 'Analyzing Entropy' : 'Ready'}
                 </p>
              </div>
           </div>
        </div>

        {/* Floating Data Points */}
        <AnimatePresence>
          {isScanning && [...Array(8)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ 
                 opacity: [0, 1, 0], 
                 scale: [0.5, 1, 0.5],
                 x: Math.sin(i) * 150,
                 y: Math.cos(i) * 150 
               }}
               transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
               className="absolute w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]"
             />
          ))}
        </AnimatePresence>
      </div>

      {/* Permission Scan Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-cyan-950/5 border border-cyan-500/10 rounded-2xl p-6">
           <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
             <Fingerprint size={16} className="text-cyan-400" />
             Permission Integrity
           </h3>
           <div className="space-y-3">
             <PermissionItem label="Microphone Access" user="4 Apps" risk="Low" />
             <PermissionItem label="Camera Access" user="2 Apps" risk="Secure" />
             <PermissionItem label="Location Tracking" user="1 App" risk="Monitored" />
             <PermissionItem label="Contact Export" user="0 Apps" risk="Blocked" />
           </div>
        </div>

        <div className="bg-cyan-950/5 border border-cyan-500/10 rounded-2xl p-6">
           <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
             <Cpu size={16} className="text-cyan-400" />
             Neural Scanner Log
           </h3>
           <div className="space-y-2 max-h-[160px] overflow-y-auto customized-scrollbar pr-2">
              {scannedItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-cyan-500/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                    <span className="text-[11px] text-cyan-100/60 font-medium">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-500/40 uppercase">Clean</span>
                </div>
              ))}
              {isScanning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-[9px] font-mono text-cyan-400 mt-2 uppercase tracking-tight"
                >
                  Scanning memory sectors 0x7FFFB...
                </motion.div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function PermissionItem({ label, user, risk }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-cyan-500/5 rounded-xl border border-white/5">
      <div>
        <p className="text-xs font-bold text-white">{label}</p>
        <p className="text-[10px] text-cyan-500/60 font-mono uppercase">{user}</p>
      </div>
      <span className={cn(
        "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border",
        risk === 'Blocked' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
      )}>
        {risk}
      </span>
    </div>
  );
}
