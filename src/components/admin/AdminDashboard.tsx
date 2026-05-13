/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Newspaper, 
  Image as ImageIcon, 
  Music, 
  Megaphone, 
  ShoppingBag, 
  Video, 
  Plus, 
  BarChart3,
  Users,
  Settings,
  Bell,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'news', label: 'News & Articles', icon: Newspaper },
    { id: 'gallery', label: 'Pictures / Gallery', icon: ImageIcon },
    { id: 'music', label: 'Music & Audio', icon: Music },
    { id: 'ads', label: 'Advertisements', icon: Megaphone },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'videos', label: 'Videos', icon: Video },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col pt-8">
        <div className="px-8 mb-12">
          <h1 className="text-2xl font-black tracking-tighter italic text-indigo-500">AkinAI.</h1>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Admin Hub</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === item.id 
                  ? "bg-white text-black" 
                  : "text-stone-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-2 w-96">
            <Search size={16} className="text-stone-500" />
            <input 
              type="text" 
              placeholder="Search content, users, or data..." 
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-stone-400 hover:text-white transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#050505]" />
            </button>
            <div className="w-10 h-10 rounded-full bg-white text-black font-black flex items-center justify-center text-sm">
              AS
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 customized-scrollbar">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab !== 'overview' && <PublishTab title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />}
        </div>
      </main>
    </div>
  );
};

const OverviewTab = () => {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Visits', val: '2.4M', change: '+12%', icon: BarChart3 },
          { label: 'Content Posts', val: '12,842', change: '+8%', icon: Newspaper },
          { label: 'Active Users', val: '84.2K', change: '+15%', icon: Users },
          { label: 'Revenue', val: '$420K', change: '+22%', icon: ShoppingBag },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[32px] space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/10 rounded-2xl text-stone-300">
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{stat.label}</span>
              <h3 className="text-3xl font-black tracking-tight">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tight">Recent Activity</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400">View All</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-all">
                  <Clock size={18} className="text-stone-400 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">New system update deployed successfully</p>
                  <span className="text-[10px] font-bold text-stone-500 uppercase">2 hours ago</span>
                </div>
                <ArrowUpRight size={16} className="text-stone-600 group-hover:text-indigo-400 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[40px] space-y-8 text-white relative overflow-hidden">
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
           <h3 className="text-3xl font-black leading-tight">System Status: <br /> High Performance</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center transition-all">
                 <span className="text-xs font-bold uppercase tracking-widest">Server Uptime</span>
                 <span className="text-xl font-black uppercase tracking-tighter italic">99.99%</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full">
                 <div className="h-full w-[99.99%] bg-white rounded-full" />
              </div>
           </div>
           <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-2xl">
              Check Diagnostics
           </button>
        </div>
      </div>
    </div>
  );
};

const PublishTab = ({ title }: { title: string }) => {
  return (
    <div className="max-w-4xl space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight uppercase">Publish {title}</h2>
        <p className="text-stone-500">Manage and publish new {title.toLowerCase()} content to the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Title / Headline</label>
              <input 
                type="text" 
                placeholder={`Enter ${title} title...`}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
              />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Description</label>
              <textarea 
                rows={4}
                placeholder={`Describe the ${title.toLowerCase()}...`}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm resize-none"
              />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Category Tags</label>
              <input 
                type="text" 
                placeholder="news, tech, music, etc. (comma separated)"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
              />
           </div>
        </div>

        <div className="space-y-6">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Upload Media</label>
              <div className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center p-8 text-center group hover:border-indigo-500/50 transition-all cursor-pointer">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-stone-500 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Plus size={32} />
                 </div>
                 <p className="text-sm font-bold text-stone-400">Click or drag to upload media files</p>
                 <span className="text-[10px] font-bold text-stone-600 uppercase mt-2">Max Size: 500MB</span>
              </div>
           </div>
           
           <div className="pt-4">
              <button className="w-full py-6 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                Publish {title}
              </button>
           </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-12">
        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Recent {title} Uploads</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map((item) => (
             <div key={item} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                <div className="aspect-video bg-stone-900 group-hover:scale-105 transition-transform" />
                <div className="p-4 flex justify-between items-center">
                   <div>
                      <h4 className="text-sm font-bold">New Post {item}</h4>
                      <span className="text-[10px] font-bold text-stone-500">LIVE • 2h ago</span>
                   </div>
                   <CheckCircle2 size={16} className="text-green-500" />
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
