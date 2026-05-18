import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Activity, 
  Cpu, 
  Wifi, 
  Globe,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

const data = [
  { time: '00:00', threats: 12 },
  { time: '04:00', threats: 15 },
  { time: '08:00', threats: 45 },
  { time: '12:00', threats: 32 },
  { time: '16:00', threats: 28 },
  { time: '20:00', threats: 35 },
  { time: '23:59', threats: 18 },
];

export function DashboardHub() {
  const [insight, setInsight] = useState("Initializing neural analysis...");

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: "Analyze current system state: VPN is Stockholm, Neural load 4.2%, 1284 threats blocked today. Any advice?",
            personality: "cyber"
          })
        });
        const data = await response.json();
        if (data.reply) setInsight(data.reply);
      } catch (err) {
        setInsight("AI Insight Node Offline. VPN remains active.");
      }
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-8">
      {/* ... previous grid ... */}
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<ShieldCheck className="text-cyan-400" />} 
          label="Protection Status" 
          value="Active" 
          subValue="256-bit AES Engaged"
          trend="UP"
        />
        <StatCard 
          icon={<Activity className="text-emerald-400" />} 
          label="Neural Load" 
          value="4.2%" 
          subValue="Optimally Balanced"
          trend="STABLE"
        />
        <StatCard 
          icon={<AlertCircle className="text-amber-400" />} 
          label="Threats Blocked" 
          value="1,284" 
          subValue="+12 today"
          trend="UP"
        />
        <StatCard 
          icon={<Wifi className="text-blue-400" />} 
          label="VPN Tunnel" 
          value="Stockholm" 
          subValue="12ms Latency"
          trend="SECURE"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Threat Graph */}
        <div className="lg:col-span-2 bg-cyan-950/20 border border-cyan-500/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Threat Analysis Matrix</h3>
              <p className="text-xs text-cyan-500/60 font-mono">Real-time neural detection telemetry</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-[10px] uppercase font-bold tracking-widest border border-cyan-500/20">Live</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0891b2" vertical={false} opacity={0.1} />
                <XAxis 
                   dataKey="time" 
                   stroke="#0891b2" 
                   fontSize={10} 
                   tickLine={false} 
                   axisLine={false}
                   opacity={0.5}
                />
                <YAxis 
                   stroke="#0891b2" 
                   fontSize={10} 
                   tickLine={false} 
                   axisLine={false}
                   opacity={0.5}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#05080a', border: '1px solid rgba(8, 145, 178, 0.2)', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="threats" 
                  stroke="#22d3ee" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorThreats)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/20 border border-cyan-400/30 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <Zap size={60} className="text-cyan-400" />
              </div>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Shield className="text-cyan-400" size={18} />
                AI Threat Insight
              </h3>
              <p className="text-sm text-cyan-100/70 leading-relaxed mb-6">
                {insight}
              </p>
              <button className="w-full py-3 bg-cyan-400 text-[#05080a] font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                Optimize Response
              </button>
           </div>

           <div className="bg-[#05080a] border border-cyan-500/10 rounded-2xl p-6">
              <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-500/60 mb-4">Neural Scanner Nodes</h4>
              <div className="space-y-4">
                <NodeStatus label="Memory Interceptor" status="ONLINE" />
                <NodeStatus label="DNS Blackhole" status="ONLINE" />
                <NodeStatus label="Vault Sentinel" status="STANDBY" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-cyan-950/10 border border-cyan-500/10 rounded-2xl p-6 backdrop-blur-sm group hover:border-cyan-500/30 transition-all shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/10 group-hover:border-cyan-500/30 transition-colors">
          {icon}
        </div>
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 tracking-tighter uppercase">
          {trend}
        </span>
      </div>
      <p className="text-xs text-cyan-500/60 font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-display font-bold text-white tracking-tight mb-1">{value}</h3>
      <p className="text-[10px] text-cyan-500/30 font-mono tracking-wide">{subValue}</p>
    </motion.div>
  );
}

function NodeStatus({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex items-center justify-between bg-cyan-500/5 rounded-lg p-3 border border-cyan-500/5">
      <span className="text-xs text-cyan-200/60 font-medium">{label}</span>
      <span className={cn(
        "text-[9px] font-mono px-2 py-0.5 rounded border",
        status === 'ONLINE' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
      )}>
        {status}
      </span>
    </div>
  );
}
