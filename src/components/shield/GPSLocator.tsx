import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Smartphone, 
  Send, 
  AlertTriangle, 
  Shield, 
  Lock,
  Wifi,
  Radio,
  ExternalLink,
  Target,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function GPSLocator() {
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState({ lat: 6.5244, lng: 3.3792 }); // Lagos dummy
  const [accuracy, setAccuracy] = useState(98.4);

  const startLocate = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      // Small jitter for realism
      setCoords(prev => ({ 
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001 
      }));
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Map View */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Active Recovery Beacon</h2>
            <p className="text-sm text-cyan-500/60 font-mono uppercase tracking-widest">Satellite tracking enabled</p>
          </div>
          <button 
            onClick={startLocate}
            disabled={isLocating}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-[#05080a] font-bold rounded-lg text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            <RefreshCw size={14} className={isLocating ? 'animate-spin' : ''} />
            Recalibrate
          </button>
        </div>

        <div className="relative aspect-video rounded-3xl overflow-hidden border border-cyan-500/20 bg-cyan-950/20 group">
           {/* UI Overlay on Map */}
           <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
              <div className="bg-[#05080a]/80 backdrop-blur-md border border-cyan-500/20 rounded-xl p-3 flex items-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                 <div className="p-2 rounded-lg bg-cyan-500/20">
                   <Target className="text-cyan-400" size={16} />
                 </div>
                 <div>
                   <p className="text-white text-[11px] font-bold uppercase tracking-tight">Signal Locked</p>
                   <p className="text-cyan-500/60 text-[9px] font-mono">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
                 </div>
              </div>
           </div>

           <div className="absolute bottom-6 right-6 z-10">
              <div className="bg-[#05080a]/80 backdrop-blur-md border border-cyan-400/30 rounded-full px-4 py-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                 <span className="text-[10px] font-mono text-cyan-100/80 uppercase">Accuracy: {accuracy}%</span>
              </div>
           </div>

           {/* Grid Pattern instead of real map for futuristic vibe */}
           <div className="absolute inset-0 bg-[#081016]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent" />
              
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div 
                   animate={{ y: ['0%', '100%'] }}
                   transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                   className="w-full h-[1px] bg-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                />
              </div>

              {/* Target Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                   <motion.div 
                     animate={{ scale: [1, 2, 1] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"
                   />
                   <div className="w-12 h-12 bg-cyan-400/10 border-2 border-cyan-400 rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                      <div className="absolute top-[-30px] bg-cyan-400 text-[#05080a] text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest whitespace-nowrap">
                        Last Known POS
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <StatusBox icon={<Radio size={16} />} label="Signal Stream" value="Broadcasting" detail="Secure L-Band" />
           <StatusBox icon={<Wifi size={16} />} label="Connectivity" value="Ultra Wideband" detail="Satellite Link 7" />
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="space-y-6">
         <div className="bg-[#05080a] border border-cyan-500/10 rounded-3xl p-8 relative overflow-hidden">
            <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={24} />
              Kill Switch
            </h3>
            
            <div className="space-y-4">
              <EmergencyAction 
                icon={<Lock size={18} />} 
                label="Full Device Lock" 
                detail="Brick all interfaces immediately"
              />
              <EmergencyAction 
                icon={<AlertTriangle size={18} />} 
                label="Emergency Siren" 
                detail="Play at 110dB (Ignored Silent)"
              />
              <EmergencyAction 
                icon={<Smartphone size={18} />} 
                label="Wipe Device" 
                variant="danger"
                detail="Permanent factory reset (NNSA Grade)"
              />
            </div>
         </div>

         <div className="bg-cyan-950/10 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-sm">
            <h4 className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.2em] mb-6">Emergency Contacts</h4>
            <div className="space-y-4">
               <ContactItem name="Akin S. Sokpah" status="Guardian" />
               <ContactItem name="Local Response Team" status="Priority" />
               <button className="w-full py-4 border-2 border-dashed border-cyan-500/20 rounded-2xl flex items-center justify-center gap-2 text-cyan-500/40 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
                 <Send size={16} />
                 <span className="text-[11px] font-bold uppercase tracking-widest">Sync New Guardian</span>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatusBox({ icon, label, value, detail }: any) {
  return (
    <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-5 flex items-center gap-4">
       <div className="p-3 rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
         {icon}
       </div>
       <div>
         <p className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest">{label}</p>
         <h4 className="text-sm font-bold text-white uppercase">{value}</h4>
         <p className="text-[10px] text-cyan-100/30 uppercase mt-0.5">{detail}</p>
       </div>
    </div>
  );
}

function EmergencyAction({ icon, label, detail, variant }: any) {
  return (
    <button className={cn(
      "w-full text-left p-4 rounded-2xl border transition-all group relative overflow-hidden",
      variant === 'danger' 
        ? "bg-red-500/5 border-red-500/20 hover:bg-red-500 text-white" 
        : "bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-400 text-[#05080a]"
    )}>
       <div className="flex items-center gap-4 relative z-10">
         <div className={cn(
           "p-2.5 rounded-xl border flex items-center justify-center",
           variant === 'danger' ? "bg-red-500/10 border-red-500/20 group-hover:border-white/40" : "bg-cyan-500/10 border-cyan-500/20 group-hover:border-[#05080a]/40"
         )}>
           {icon}
         </div>
         <div className="min-w-0">
           <h5 className="text-xs font-bold uppercase tracking-widest">{label}</h5>
           <p className={cn(
             "text-[9px] uppercase font-mono mt-0.5",
             variant === 'danger' ? "text-red-400/60 group-hover:text-white/80" : "text-cyan-500/60 group-hover:text-[#05080a]/80"
           )}>{detail}</p>
         </div>
       </div>
    </button>
  );
}

function ContactItem({ name, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-cyan-500/5 rounded-2xl border border-cyan-400/5">
       <div>
         <p className="text-xs font-bold text-white tracking-tight">{name}</p>
         <p className="text-[10px] text-cyan-500/60 font-mono uppercase">{status}</p>
       </div>
       <div className="flex items-center gap-2">
         <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
         <span className="text-[9px] text-cyan-400 font-mono uppercase">Online</span>
       </div>
    </div>
  );
}
