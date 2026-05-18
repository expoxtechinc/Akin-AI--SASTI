import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Files, 
  Plus, 
  FileText, 
  Image as ImageIcon, 
  Shield, 
  Search,
  Grid,
  List as ListIcon,
  Download,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const mockFiles = [
  { id: '1', name: 'Private_Key_Backup.cert', type: 'key', size: '256 KB', date: '2024-05-18' },
  { id: '2', name: 'Identity_Encrypted.pdf', type: 'pdf', size: '2.4 MB', date: '2024-05-15' },
  { id: '3', name: 'Secure_Asset_List.xlsx', type: 'xlsx', size: '1.1 MB', date: '2024-05-10' },
  { id: '4', name: 'Voice_Memo_01.mp3', type: 'audio', size: '5.2 MB', date: '2024-05-08' },
];

export function FileVault() {
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsLocked(false);
    }
  };

  if (isLocked) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-950/20 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
              <Lock size={40} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Vault Locked</h2>
            <p className="text-sm text-cyan-500/60 font-mono">Quantum Passcode Required</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter 4-digit code"
                maxLength={4}
                className="w-full bg-[#05080a] border border-cyan-500/20 rounded-xl px-4 py-4 text-center text-2xl font-mono text-cyan-400 placeholder:text-cyan-500/10 focus:outline-none focus:border-cyan-400 transition-colors"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-cyan-400 text-[#05080a] font-bold rounded-xl text-sm uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            >
              Authorize Access
            </button>
            <p className="text-[10px] text-center text-cyan-500/30 uppercase mt-4">Hint: default is 1234</p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">SECURE VAULT</h2>
              <span className="px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] uppercase font-bold tracking-widest">v4.0</span>
           </div>
           <p className="text-sm text-cyan-500/60 font-mono">End-to-end encrypted storage active</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/40" size={16} />
             <input 
               type="text" 
               placeholder="Search encrypted files..." 
               className="w-full bg-cyan-500/5 border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
             />
          </div>
          <button className="p-2.5 bg-cyan-400 text-[#05080a] rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Plus size={20} />
          </button>
          <button 
            onClick={() => setIsLocked(true)}
            className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
          >
            <Lock size={20} />
          </button>
        </div>
      </div>

      {/* Grid Tabs */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4">
        <div className="flex gap-6">
          <TabButton label="All Assets" count={mockFiles.length} active />
          <TabButton label="Identity" count={2} />
          <TabButton label="Media" count={1} />
        </div>
        <div className="flex items-center gap-2 p-1 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("p-1.5 rounded transition-colors", viewMode === 'grid' ? "bg-cyan-500/20 text-cyan-400" : "text-cyan-500/40")}
          >
            <Grid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("p-1.5 rounded transition-colors", viewMode === 'list' ? "bg-cyan-500/20 text-cyan-400" : "text-cyan-500/40")}
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      {/* Files Display */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
      )}>
        <AnimatePresence>
          {mockFiles.map((file, i) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "group relative bg-cyan-950/5 border border-cyan-500/10 rounded-2xl transition-all hover:bg-cyan-950/15 overflow-hidden",
                viewMode === 'grid' ? "p-6 aspect-square flex flex-col items-center justify-center text-center" : "px-6 py-4 flex items-center flex-row gap-6"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform mb-4",
                viewMode === 'list' && "mb-0"
              )}>
                {file.type === 'key' ? <Lock size={32} /> : <FileText size={32} />}
              </div>
              
              <div className={cn(viewMode === 'grid' ? "flex flex-col items-center" : "flex-1 min-w-0")}>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate w-full">
                   {file.name}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-cyan-500/40 font-mono uppercase">{file.size}</span>
                  <span className="text-[10px] text-cyan-500/40 font-mono uppercase">•</span>
                  <span className="text-[10px] text-cyan-500/40 font-mono uppercase">{file.date}</span>
                </div>
              </div>

              {/* Actions Overlay */}
              <div className={cn(
                "flex items-center gap-2",
                viewMode === 'grid' 
                  ? "absolute inset-0 bg-[#05080a]/80 backdrop-blur-sm flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  : "opacity-0 group-hover:opacity-100 transition-opacity"
              )}>
                <ActionButton icon={<Eye size={16} />} />
                <ActionButton icon={<Download size={16} />} />
                <ActionButton icon={<Trash2 size={16} />} variant="danger" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Security Tip */}
      <div className="bg-gradient-to-r from-cyan-900/10 border-l-4 border-cyan-400 p-6 rounded-r-2xl">
         <div className="flex gap-4">
           <Shield className="text-cyan-400" size={24} />
           <div>
             <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Quantum Encryption Protocol v2</h5>
             <p className="text-xs text-cyan-100/60 leading-relaxed max-w-2xl">
               Your files are fragmented and stored across multiple neural nodes. Reversing the encryption without the biometric hash is mathematically impossible.
             </p>
           </div>
         </div>
      </div>
    </div>
  );
}

function TabButton({ label, count, active }: any) {
  return (
    <button className={cn(
      "flex items-center gap-2 pb-4 border-b-2 transition-all relative font-mono text-[11px] font-bold uppercase tracking-widest",
      active 
        ? "border-cyan-400 text-cyan-400" 
        : "border-transparent text-cyan-500/40 hover:text-cyan-400"
    )}>
      {label}
      <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-[9px]">{count}</span>
    </button>
  );
}

function ActionButton({ icon, variant }: any) {
  return (
    <button className={cn(
      "p-3 rounded-xl transition-all",
      variant === 'danger' 
        ? "bg-red-500/10 text-red-500 hover:bg-red-500 text-white" 
        : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-400 hover:text-[#05080a]"
    )}>
      {icon}
    </button>
  );
}
