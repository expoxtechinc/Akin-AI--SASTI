/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  ExternalLink, 
  Calendar, 
  User, 
  Tag, 
  Search,
  Filter,
  Newspaper,
  Image as ImageIcon,
  Music,
  Video,
  ShoppingBag,
  Megaphone
} from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { AnimatePresence } from 'framer-motion';
import { X, Send, Heart, MessageCircle, Share2, Volume2, Globe, ArrowRight } from 'lucide-react';

const PostModal = ({ post, onClose }: { post: any; onClose: () => void }) => {
  const isVideo = post.type === 'videos';
  const isMusic = post.type === 'music';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        className="relative w-full max-w-6xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all z-[120] text-white border border-white/20"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-3/5 bg-stone-900 flex items-center justify-center relative overflow-hidden">
           {isVideo ? (
             <div className="w-full h-full relative">
                {post.mediaUrl.includes('youtube.com') || post.mediaUrl.includes('youtu.be') ? (
                  <iframe 
                    src={post.mediaUrl.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1'} 
                    className="w-full h-full" 
                    allow="autoplay; fullscreen"
                  />
                ) : (
                  <video src={post.mediaUrl} controls autoPlay className="w-full h-full object-contain" />
                )}
             </div>
           ) : isMusic ? (
             <div className="w-full h-full p-12 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-stone-950 relative">
                <div className="absolute inset-0 overflow-hidden opacity-30">
                   <img src={post.mediaUrl} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
                </div>
                <div className="relative z-10 space-y-12 flex flex-col items-center w-full">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     className="w-72 h-72 rounded-full shadow-2xl overflow-hidden border-8 border-white/10 ring-1 ring-white/20"
                   >
                      <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                   </motion.div>
                   <div className="w-full max-w-md space-y-6">
                      <div className="text-center">
                         <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{post.title}</h3>
                         <p className="text-indigo-300 font-bold uppercase tracking-widest text-[10px] mt-2">Streaming Now on AkinAI Music</p>
                      </div>
                      <audio src={post.mediaUrl} controls className="w-full custom-audio-player invert hue-rotate-180" />
                      <div className="flex justify-center gap-12 text-white/40">
                         <button className="hover:text-white transition-colors"><Volume2 size={24} /></button>
                         <button className="hover:text-white transition-colors"><Share2 size={24} /></button>
                         <button className="hover:text-white transition-colors"><Heart size={24} /></button>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
           )}
        </div>

        <div className="w-full md:w-2/5 p-12 lg:p-16 flex flex-col overflow-y-auto bg-white">
           <div className="space-y-10">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-100">AI</div>
                 <div>
                    <h4 className="font-black uppercase tracking-tighter text-stone-900 text-lg">AkinAI Official</h4>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Verified Platform Partner</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <span className="px-5 py-2 bg-stone-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                       {post.type}
                    </span>
                    <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                       {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                 </div>
                 <h2 className="text-4xl font-black tracking-tighter leading-none text-stone-900 uppercase italic">
                    {post.title}
                 </h2>
                 <p className="text-stone-500 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                    {post.content}
                 </p>
              </div>

              <div className="flex flex-wrap gap-3">
                 {post.tags?.map((tag: string, i: number) => (
                   <span key={i} className="px-6 py-3 bg-stone-100 rounded-2xl text-[10px] font-black text-stone-500 uppercase tracking-widest border border-stone-200/50">
                     #{tag}
                   </span>
                 ))}
              </div>

              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-stone-100">
                 <button className="flex flex-col items-center gap-3 p-6 rounded-[32px] hover:bg-stone-50 transition-all group">
                    <Heart size={24} className="text-stone-400 group-hover:text-rose-500 transition-colors" />
                    <span className="text-[11px] font-black uppercase text-stone-500">2.4K</span>
                 </button>
                 <button className="flex flex-col items-center gap-3 p-6 rounded-[32px] hover:bg-stone-50 transition-all group">
                    <MessageCircle size={24} className="text-stone-400 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-[11px] font-black uppercase text-stone-500">142</span>
                 </button>
                 <button className="flex flex-col items-center gap-3 p-6 rounded-[32px] hover:bg-stone-50 transition-all group">
                    <Share2 size={24} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                    <span className="text-[11px] font-black uppercase text-stone-500">Share</span>
                 </button>
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const LiveFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));

    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(p => filter === 'all' || p.type === filter);

  const categories = [
    { id: 'all', label: 'All Content', icon: Tag },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'products', label: 'Products', icon: ShoppingBag },
  ];

  const getPostIcon = (type: string) => {
    switch(type) {
      case 'news': return <Newspaper size={14} />;
      case 'gallery': return <ImageIcon size={14} />;
      case 'music': return <Music size={14} />;
      case 'videos': return <Video size={14} />;
      case 'products': return <ShoppingBag size={14} />;
      default: return <Tag size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 border-b border-stone-100 bg-stone-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                 <Globe size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight uppercase italic text-stone-900 leading-none">AkinAI. Live</h1>
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Real-time ecosystem updates</p>
              </div>
           </div>
           
           <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                    filter === cat.id 
                      ? "bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-200" 
                      : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                  )}
                >
                  <cat.icon size={12} />
                  {cat.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 customized-scrollbar">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Syncing with blockchain...</p>
            </div>
          ) : (filteredPosts.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredPosts.map((post, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={post.id}
                  className="group bg-white border border-stone-100 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-stone-900">
                    <img 
                      src={post.mediaUrl} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-6 left-6">
                       <span className="px-4 py-2 bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2">
                          {getPostIcon(post.type)}
                          {post.type}
                       </span>
                    </div>
                    {post.type === 'videos' && (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform">
                             <Play fill="currentColor" size={24} />
                          </div>
                       </div>
                    )}
                    {post.type === 'music' && (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-indigo-600/80 backdrop-blur-xl rounded-full flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform">
                             <Music size={24} />
                          </div>
                       </div>
                    )}
                  </div>

                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[10px] font-black text-stone-400 uppercase tracking-widest mb-6">
                      <Calendar size={12} className="text-indigo-600" />
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      <span className="w-1 h-1 bg-stone-200 rounded-full" />
                      <span className="text-indigo-600">Live</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-indigo-600 transition-colors leading-none">
                      {post.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-3 font-medium">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-stone-50">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-stone-100 border-2 border-white" />)}
                          <span className="pl-4 text-[10px] font-black text-stone-400 uppercase">+1.2K</span>
                       </div>
                       <button 
                         className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:gap-3 transition-all"
                       >
                         Read More <ArrowRight size={14} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-black uppercase mb-2">No results found</h3>
              <p className="text-stone-400 text-sm max-w-xs mx-auto">Try selecting a different category or wait for the admin to publish more content.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
