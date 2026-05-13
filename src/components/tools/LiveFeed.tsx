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
import { X, Send, Heart, MessageCircle, Share2, Volume2, Globe } from 'lucide-react';

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
      <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-6xl bg-white border border-stone-100 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center transition-all z-20"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-3/5 bg-stone-50 flex items-center justify-center p-4">
           {isVideo ? (
             <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl">
                {post.mediaUrl.includes('youtube.com') || post.mediaUrl.includes('youtu.be') ? (
                  <iframe 
                    src={post.mediaUrl.replace('watch?v=', 'embed/')} 
                    className="w-full h-full" 
                    allowFullScreen 
                  />
                ) : (
                  <video src={post.mediaUrl} controls className="w-full h-full object-contain bg-black" />
                )}
             </div>
           ) : isMusic ? (
             <div className="w-full p-12 space-y-8 flex flex-col items-center">
                <div className="w-64 h-64 rounded-[40px] shadow-2xl overflow-hidden bg-stone-200 relative group">
                   <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-indigo-600/20 mix-blend-multiply" />
                </div>
                <div className="w-full space-y-4">
                   <audio src={post.musicUrl || post.mediaUrl} controls className="w-full custom-audio-player" />
                   <div className="flex justify-center gap-8 text-stone-400">
                      <Volume2 size={24} />
                      <Share2 size={24} />
                      <Heart size={24} />
                   </div>
                </div>
             </div>
           ) : (
             <img src={post.mediaUrl} alt="" className="w-full h-full object-contain" />
           )}
        </div>

        <div className="w-full md:w-2/5 p-12 flex flex-col overflow-y-auto">
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">AI</div>
                 <div>
                    <h4 className="font-black uppercase tracking-tight text-stone-900">AkinAI Admin</h4>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Published {post.createdAt?.toDate().toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {post.type}
                 </span>
                 <h2 className="text-3xl font-black tracking-tight leading-none text-stone-900">
                    {post.title}
                 </h2>
                 <p className="text-stone-500 text-lg leading-relaxed whitespace-pre-wrap">
                    {post.content}
                 </p>
              </div>

              <div className="flex flex-wrap gap-2">
                 {post.tags?.map((tag: string, i: number) => (
                   <span key={i} className="px-4 py-2 bg-stone-100 rounded-full text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                     #{tag}
                   </span>
                 ))}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-12 border-t border-stone-100">
                 <button className="flex flex-col items-center gap-2 p-4 rounded-3xl hover:bg-stone-50 transition-colors">
                    <Heart size={20} className="text-stone-400" />
                    <span className="text-[10px] font-black uppercase text-stone-500">2.4K</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-4 rounded-3xl hover:bg-stone-50 transition-colors">
                    <MessageCircle size={20} className="text-stone-400" />
                    <span className="text-[10px] font-black uppercase text-stone-500">142</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-4 rounded-3xl hover:bg-stone-50 transition-colors">
                    <Share2 size={20} className="text-stone-400" />
                    <span className="text-[10px] font-black uppercase text-stone-500">Share</span>
                 </button>
              </div>

              <div className="pt-8 space-y-4">
                 <h5 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Comments</h5>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-100 shrink-0" />
                    <div className="bg-stone-50 p-4 rounded-2xl flex-1">
                       <p className="text-sm font-bold text-stone-700">This is exactly what the platform needed! 🔥</p>
                    </div>
                 </div>
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
