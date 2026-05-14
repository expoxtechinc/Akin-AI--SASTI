/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowUpRight,
  Loader2,
  Play,
  Cpu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { db, auth, OperationType, handleFirestoreError } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'ads', label: 'Ads', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminMenuItems = [
    { id: 'gallery', label: 'Gallery', icon: ImageIcon, color: 'text-pink-500' },
    { id: 'music', label: 'Audio', icon: Music, color: 'text-purple-500' },
    { id: 'products', label: 'Store', icon: ShoppingBag, color: 'text-orange-500' },
    { id: 'videos', label: 'Videos', icon: Video, color: 'text-blue-500' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden max-w-md mx-auto relative border-x border-white/5 shadow-2xl bg-mesh">
      {/* Mobile-Style Status Bar Area */}
      <div className="h-10 flex-none flex justify-between items-center px-6 pt-4 z-50">
        <span className="text-xs font-black tracking-tight font-display">9:41</span>
        <div className="flex items-center gap-1.5">
           <div className="w-4 h-4 rounded-full border border-white/20 animate-pulse" />
           <div className="w-4 h-4 rounded-full border border-white/20" />
           <div className="w-4 h-4 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-8 flex-none flex justify-between items-center z-50">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic text-indigo-500 font-display text-glow">Admin.</h1>
          <p className="text-[9px] font-black text-stone-500 uppercase tracking-[0.3em]">AkinAI Intelligence Hub</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
            <Bell size={18} className="text-stone-400 group-hover:text-white transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
          </button>
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 shadow-lg shadow-indigo-500/20">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[10px] font-black border border-white/10 italic">
              AS
            </div>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto customized-scrollbar pb-32">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="px-6 space-y-8"
        >
          {activeTab === 'overview' && (
            <>
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-4">
                {adminMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="aspect-square bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all group active:scale-95"
                  >
                    <div className={cn("p-5 rounded-[24px] bg-black/60 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500", item.color)}>
                      <item.icon size={28} />
                    </div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Stats Card */}
              <div className="bg-indigo-600 rounded-[48px] p-10 space-y-8 relative overflow-hidden shadow-2xl shadow-indigo-600/30 border border-white/10">
                <div className="absolute -top-10 -right-10 opacity-10 rotate-12 scale-150">
                  <Cpu size={180} />
                </div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 text-indigo-50">Node_Delta_8</span>
                  <span className="text-[10px] font-black text-green-300 bg-black/20 px-3 py-1 rounded-full">+48.2%</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-5xl font-black tracking-tighter font-display italic">92.4k</h3>
                  <p className="text-[11px] font-bold text-indigo-100/70 uppercase tracking-widest mt-1">Live AI Synchronizations</p>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full relative z-10 p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
                  />
                </div>
              </div>

              {/* Recent Activity List */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-black tracking-widest uppercase italic font-display text-indigo-400">Security Logs</h3>
                  <button className="text-[9px] font-bold text-stone-600 uppercase tracking-widest hover:text-white transition-colors">Archive</button>
                </div>
                <div className="space-y-4">
                  <RecentActivityList />
                </div>
              </div>
            </>
          )}

          {activeTab === 'news' && <PublishTab title="News" type="news" />}
          {activeTab === 'ads' && <PublishTab title="Ads" type="ads" />}
          {activeTab === 'gallery' && <PublishTab title="Gallery" type="gallery" />}
          {activeTab === 'music' && <PublishTab title="Music" type="music" />}
          {activeTab === 'products' && <PublishTab title="Products" type="products" />}
          {activeTab === 'videos' && <PublishTab title="Videos" type="videos" />}
          
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tight italic font-display text-indigo-500 text-glow">System Settings</h2>
              <div className="space-y-4">
                {[
                  { label: 'Neural Network', status: 'Optimal', icon: Cpu, color: 'text-indigo-400' },
                  { label: 'Blockchain Core', status: 'Synchronized', icon: LayoutDashboard, color: 'text-purple-400' },
                  { label: 'Secure Identity', status: 'Encrypted', icon: Users, color: 'text-rose-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 glass rounded-3xl group hover:bg-white/10 transition-all border border-white/5">
                    <div className="flex items-center gap-5">
                      <div className={cn("p-4 bg-black/40 rounded-2xl group-hover:scale-110 transition-transform", item.color)}>
                        <item.icon size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black italic">{item.label}</p>
                        <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.1em]">{item.status}</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center px-1">
                      <div className="w-4 h-4 bg-indigo-500 rounded-full ml-auto shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={onLogout}
                className="w-full py-6 mt-10 p-1 rounded-3xl bg-gradient-to-r from-red-500/20 to-transparent border border-red-500/20 shadow-xl shadow-red-500/5 group hover:from-red-500/30 transition-all"
              >
                <div className="flex items-center justify-center gap-3 text-red-400 font-black uppercase tracking-[0.3em] text-[10px]">
                  <LogOut size={16} />
                  Terminate Session
                </div>
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 inset-x-0 h-28 bg-black/40 backdrop-blur-3xl border-t border-white/5 px-8 flex items-center justify-between pb-10 z-[100]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300",
              activeTab === item.id 
                ? "text-indigo-500 scale-110 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" 
                : "text-stone-600 hover:text-stone-400"
            )}
          >
            <div className={cn(
              "p-2.5 rounded-2xl transition-all duration-500",
              activeTab === item.id ? "bg-indigo-500/10 rotate-12" : ""
            )}>
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/5 rounded-full z-50" />
    </div>
  );
};

const RecentActivityList = () => {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  if (recentPosts.length === 0) {
    return (
      <div className="py-12 text-center text-stone-600 font-black uppercase tracking-widest text-[10px] italic">
        No Activity Detected...
      </div>
    );
  }

  return (
    <>
      {recentPosts.map((post) => (
        <div key={post.id} className="flex items-center gap-5 glass p-5 rounded-[32px] group hover:bg-white/10 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all relative overflow-hidden">
             <img src={post.mediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />
             <CheckCircle2 size={18} className="text-indigo-500 relative z-10 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[11px] font-black uppercase tracking-tight italic truncate">{post.title}</p>
            <span className="text-[9px] text-stone-500 font-black uppercase tracking-widest leading-none">
              {post.type.toUpperCase()} • {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
            </span>
          </div>
          <ArrowUpRight size={14} className="text-stone-700" />
        </div>
      ))}
    </>
  );
};

const PublishTab = ({ title, type }: { title: string, type: string }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    mediaUrl: ''
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'), 
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentUploads(allPosts.filter((p: any) => p.type === type));
    });
    return () => unsubscribe();
  }, [type]);

  const handlePublish = async () => {
    if (!formData.title || !formData.description) {
      alert("Required: Title and Description.");
      return;
    }

    if (!auth.currentUser) {
      alert("Authentication required.");
      return;
    }
    
    setIsPublishing(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.description,
        type: type,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        mediaUrl: formData.mediaUrl || `https://picsum.photos/seed/${encodeURIComponent(formData.title)}/1200/800`,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts'), payload);

      setFormData({ title: '', description: '', tags: '', mediaUrl: '' });
      alert(`Success: ${title} is now synchronized.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsPublishing(false);
    }
  };

  const placeholderText = title.toLowerCase().includes('video') ? "MP4 / YouTube Link" : 
                          title.toLowerCase().includes('music') ? "MP3 / Audio URL" : 
                          "Image / Media URL";

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tighter uppercase italic font-display text-indigo-500 text-glow">Forge {title}.</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Injecting new intelligence into the stream</p>
      </div>

      <div className="space-y-8">
         <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-600 block pl-2">System_Headline</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
              placeholder={`Enter ${title} title...`}
              className="w-full bg-white/5 border border-white/10 p-6 rounded-[32px] outline-none focus:border-indigo-500/50 transition-all font-black text-xs italic"
            />
         </div>
         <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-600 block pl-2">Neural_Description</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
              placeholder={`Synthesize description...`}
              className="w-full bg-white/5 border border-white/10 p-6 rounded-[32px] outline-none focus:border-indigo-500/50 transition-all font-black text-xs italic resize-none"
            />
         </div>
         <div className="space-y-3 relative">
            <label className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-600 block pl-2">Media_Source</label>
            <input 
              type="text" 
              value={formData.mediaUrl}
              onChange={(e) => setFormData(f => ({ ...f, mediaUrl: e.target.value }))}
              placeholder={placeholderText}
              className="w-full bg-white/5 border border-white/10 p-6 rounded-[32px] outline-none focus:border-indigo-500/50 transition-all font-black text-xs italic"
            />
            <div className="absolute right-4 bottom-4">
               <ImageIcon size={18} className="text-stone-700" />
            </div>
         </div>
         
         <button 
           onClick={handlePublish}
           disabled={isPublishing}
           className="w-full relative group py-8 rounded-[40px] overflow-hidden transition-all duration-700"
         >
           <div className="absolute inset-0 bg-indigo-600 group-hover:scale-110 transition-transform duration-700" />
           <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
           <div className="relative z-10 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-white">
              {isPublishing ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
              Execute Publish
           </div>
         </button>
      </div>

      <div className="pt-8 border-t border-white/5 space-y-8">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] font-display text-indigo-400">Stream Archive</h3>
        <div className="grid grid-cols-2 gap-4 pb-12">
           {recentUploads.map((post) => (
             <div key={post.id} className="glass rounded-[32px] overflow-hidden group border border-white/5">
                <div className="aspect-[4/3] relative">
                   <img src={post.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                   <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[10px] font-black uppercase tracking-tight truncate leading-none mb-1">{post.title}</p>
                      <span className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">Live • Verified</span>
                   </div>
                </div>
             </div>
           ))}
           {recentUploads.length === 0 && (
             <div className="col-span-2 py-10 text-center text-[9px] font-black uppercase tracking-[0.4em] text-stone-700 italic border border-white/5 rounded-[32px]">
                Fragment Null: No Data Found
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
