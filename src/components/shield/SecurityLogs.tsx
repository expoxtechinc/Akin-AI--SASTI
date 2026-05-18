import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Camera, 
  MoreVertical,
  Fingerprint,
  Smartphone,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const logs = [
  {
    id: '1',
    type: 'intruder_alert',
    description: 'Multiple failed fingerprint attempts detected.',
    timestamp: '2 mins ago',
    location: 'Lagos, Nigeria',
    device: 'Galaxy S24 Ultra',
    priority: 'high',
    hasSelfie: true
  },
  {
    id: '2',
    type: 'wrong_password',
    description: 'System lockout engaged after 3 pattern failures.',
    timestamp: '45 mins ago',
    location: 'Lagos, Nigeria',
    device: 'Galaxy S24 Ultra',
    priority: 'medium',
    hasSelfie: false
  },
  {
    id: '3',
    type: 'vpn_anomaly',
    description: 'Unexpected tunnel disconnection. Re-established AES-256 link.',
    timestamp: '2 hours ago',
    location: 'Global Node #4',
    device: 'Network Stack',
    priority: 'low',
    hasSelfie: false
  }
];

export function SecurityLogs() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Security Telemetry</h2>
          <p className="text-sm text-cyan-500/60 font-mono">24-hour incident monitoring</p>
        </div>
        <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-all">
          Clear All Logs
        </button>
      </div>

      <div className="space-y-4">
        {logs.map((log, idx) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "group relative bg-cyan-950/10 border rounded-2xl p-5 backdrop-blur-sm hover:bg-cyan-950/20 transition-all cursor-pointer",
              log.priority === 'high' ? "border-red-500/30" : "border-cyan-500/10"
            )}
          >
            <div className="flex items-start gap-5">
              <div className={cn(
                "p-3 rounded-xl border shrink-0",
                log.priority === 'high' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
              )}>
                {log.type === 'intruder_alert' ? <Camera size={20} /> : <AlertTriangle size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                    {log.type.replace('_', ' ')}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-cyan-500/40 font-mono">
                    <Clock size={10} />
                    {log.timestamp}
                  </div>
                </div>
                <p className="text-sm text-cyan-100/60 mb-4">{log.description}</p>
                
                <div className="flex flex-wrap gap-4 pt-4 border-t border-cyan-500/5">
                   <div className="flex items-center gap-1.5 text-[10px] text-cyan-500/60 font-mono">
                     <MapPin size={10} />
                     {log.location}
                   </div>
                   <div className="flex items-center gap-1.5 text-[10px] text-cyan-500/60 font-mono">
                     <Smartphone size={10} />
                     {log.device}
                   </div>
                   {log.hasSelfie && (
                     <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-mono">
                       <Camera size={10} />
                       SELFIE CAPTURED
                     </div>
                   )}
                </div>
              </div>

              <button className="p-2 text-cyan-500/30 hover:text-cyan-400 transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>

            {log.hasSelfie && (
              <div className="mt-4 overflow-hidden rounded-xl h-0 group-hover:h-32 transition-all duration-500 border border-red-500/20 relative">
                <img 
                  src="https://images.unsplash.com/photo-1544391682-17ef1f356b46?auto=format&fit=crop&q=80&w=800" 
                  alt="Intruder"
                  className="w-full h-full object-cover filter grayscale sepia(20%) opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 to-transparent" />
                <div className="absolute bottom-2 left-3 text-[10px] text-white font-mono font-bold tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                   FACIAL SCAN STORED
                </div>
              </div>
            )}
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
               <ChevronRight size={20} className="text-cyan-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
