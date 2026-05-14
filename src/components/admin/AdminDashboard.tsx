/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  ArrowUpRight,
  Loader2,
  Play
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { db, auth, OperationType, handleFirestoreError } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';

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
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden max-w-md mx-auto relative border-x border-white/5 shadow-2xl">
      {/* Mobile-Style Status Bar Area */}
      <div className="h-10 flex-none flex justify-between items-center px-6 pt-4">
        <span className="text-xs font-bold tracking-tight">9:41</span>
        <div className="flex items-center gap-1.5">
           <div className="w-4 h-4 rounded-full border border-white/20" />
           <div className="w-4 h-4 rounded-full border border-white/20" />
           <div className="w-4 h-4 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-6 flex-none flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight italic text-indigo-500">Admin.</h1>
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">AkinAI Control Hub</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
            <Bell size={18} className="text-stone-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A0A]" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white text-black font-black flex items-center justify-center text-xs border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20">
            AS
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto customized-scrollbar pb-24">
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
                    <div className={cn("p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:scale-110 transition-transform", item.color)}>
                      <item.icon size={24} />
                    </div>
                    <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Stats Card */}
              <div className="bg-indigo-600 rounded-[40px] p-8 space-y-6 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BarChart3 size={120} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Weekly Performance</span>
                  <span className="text-[10px] font-black text-green-300">+24.8%</span>
                </div>
                <div>
                  <h3 className="text-4xl font-black tracking-tighter">84.2K</h3>
                  <p className="text-xs font-bold text-indigo-200">Active users interacting with AI</p>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full">
                  <div className="h-full w-3/4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </div>

              {/* Recent Activity List */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="text-lg font-black tracking-tight uppercase">Recent Logs</h3>
                  <button className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">See all</button>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold">New Post: "The Future of AI"</p>
                        <span className="text-[10px] text-stone-500 font-medium">Just now • Published</span>
                      </div>
                      <ArrowUpRight size={14} className="text-stone-600" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'news' && <PublishTab title="News" />}
          {activeTab === 'ads' && <PublishTab title="Ads" />}
          {activeTab === 'gallery' && <PublishTab title="Gallery" />}
          {activeTab === 'music' && <PublishTab title="Music" />}
          {activeTab === 'products' && <PublishTab title="Products" />}
          {activeTab === 'videos' && <PublishTab title="Videos" />}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">System Settings</h2>
              <div className="space-y-3">
                {[
                  { label: 'Cloud Database', status: 'Healthy', icon: Settings },
                  { label: 'WhatsApp API', status: 'Connected', icon: Megaphone },
                  { label: 'User Auth', status: 'Encrypted', icon: Users },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-2xl text-stone-400">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">{item.status}</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={onLogout}
                className="w-full py-5 border border-red-500/20 text-red-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 mt-8"
              >
                <LogOut size={16} />
                Logout Session
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 inset-x-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/5 px-6 flex items-center justify-between pb-4 z-50">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === item.id || (activeTab !== 'overview' && activeTab !== 'news' && activeTab !== 'ads' && activeTab !== 'settings' && item.id === 'overview')
                ? "text-indigo-500 scale-110" 
                : "text-stone-500 hover:text-stone-300"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Home Indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/10 rounded-full z-50 shadow-sm" />
    </div>
  );
};

const OverviewTab = () => {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    posts: 0,
    visits: '2.4M',
    users: '84.2K',
    revenue: '$420K'
  });

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentPosts(posts);
      setStats(prev => ({ ...prev, posts: snapshot.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Visits', val: stats.visits, change: '+12%', icon: BarChart3 },
          { label: 'Content Posts', val: recentPosts.length || stats.posts, change: '+8%', icon: Newspaper },
          { label: 'Active Users', val: stats.users, change: '+15%', icon: Users },
          { label: 'Revenue', val: stats.revenue, change: '+22%', icon: ShoppingBag },
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
            {recentPosts.length > 0 ? recentPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-all">
                  <Clock size={18} className="text-stone-400 group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Published: {post.title}</p>
                  <span className="text-[10px] font-bold text-stone-500 uppercase">
                    {post.createdAt?.toDate().toLocaleTimeString() || 'Just now'}
                  </span>
                </div>
                <ArrowUpRight size={16} className="text-stone-600 group-hover:text-indigo-400 transition-all" />
              </div>
            )) : (
              <div className="text-center py-8 text-stone-500 font-bold uppercase tracking-widest text-xs">
                No recent activity
              </div>
            )}
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    mediaUrl: ''
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'), 
      limit(6)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handlePublish = async () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in at least the title and description.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in to publish content. Please sign in again.");
      return;
    }
    
    setIsPublishing(true);
    try {
      const typeMap: {[key: string]: string} = {
        'news feed': 'news',
        'media gallery': 'gallery',
        'music streaming': 'music',
        'ads system': 'ads',
        'product store': 'products',
        'video studio': 'videos'
      };
      
      const postType = typeMap[title.toLowerCase()] || 'news';

      // Ensure that we include exactly what the validation helper expects
      const payload = {
        title: formData.title,
        content: formData.description,
        type: postType,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        mediaUrl: formData.mediaUrl || `https://picsum.photos/seed/${encodeURIComponent(formData.title || 'default')}/1200/800`,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'posts'), payload);

      setFormData({ title: '', description: '', tags: '', mediaUrl: '' });
      alert(`${title} published successfully! It's now live on the platform.`);
    } catch (error) {
      console.error("Publish Error:", error);
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsPublishing(false);
    }
  };

  const getPlaceholder = () => {
    if (title.toLowerCase().includes('video')) return "YouTube URL, MP4 link, or Cloudinary Video URL";
    if (title.toLowerCase().includes('music')) return "MP3 Link or Audio Streaming URL";
    if (title.toLowerCase().includes('gallery')) return "High-res Image URL";
    return "Media URL (Image or Video link)";
  };

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
                value={formData.title}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder={`Enter ${title} title...`}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
              />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder={`Describe the ${title.toLowerCase()}...`}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm resize-none"
              />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Category Tags</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={(e) => setFormData(f => ({ ...f, tags: e.target.value }))}
                placeholder="news, tech, music, etc. (comma separated)"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
              />
           </div>
        </div>

        <div className="space-y-6">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">{getPlaceholder()}</label>
              <input 
                type="text" 
                value={formData.mediaUrl}
                onChange={(e) => setFormData(f => ({ ...f, mediaUrl: e.target.value }))}
                placeholder="https://example.com/media-file.jpg"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
              />
              <div className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center p-8 text-center group hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden">
                 {formData.mediaUrl ? (
                   <>
                     {title.toLowerCase().includes('video') ? (
                       <div className="absolute inset-0 bg-stone-900 flex items-center justify-center">
                          {formData.mediaUrl.includes('youtube.com') || formData.mediaUrl.includes('youtu.be') ? (
                            <iframe 
                              src={formData.mediaUrl.replace('watch?v=', 'embed/').split('&')[0]} 
                              className="w-full h-full pointer-events-none opacity-60" 
                            />
                          ) : (
                            <video src={formData.mediaUrl} className="w-full h-full object-cover opacity-60" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                <Play size={32} />
                             </div>
                          </div>
                       </div>
                     ) : title.toLowerCase().includes('music') ? (
                       <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center p-8 gap-4">
                          <img src={formData.mediaUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                          <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center text-white backdrop-blur-md">
                             <Music size={40} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 z-10">Audio Preview Active</p>
                       </div>
                     ) : (
                       <img src={formData.mediaUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                     )}
                   </>
                 ) : (
                   <>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-stone-500 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <Plus size={32} />
                    </div>
                    <p className="text-sm font-bold text-stone-400">Click or drag to upload media files</p>
                    <span className="text-[10px] font-bold text-stone-600 uppercase mt-2">Max Size: 500MB</span>
                   </>
                 )}
              </div>
           </div>
           
           <div className="pt-4">
              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full py-6 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="animate-spin" /> : null}
                Publish {title}
              </button>
           </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-12">
        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Recent {title} Uploads</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {recentPosts.filter(p => p.type === title.toLowerCase().split(' ')[0] || (title.toLowerCase().includes('news') && p.type === 'news')).map((post) => (
             <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                <div className="aspect-video bg-stone-900 overflow-hidden">
                   <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4 flex justify-between items-center">
                   <div>
                      <h4 className="text-sm font-bold truncate max-w-[150px]">{post.title}</h4>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">
                         LIVE • {post.createdAt?.toDate().toLocaleDateString()}
                      </span>
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
