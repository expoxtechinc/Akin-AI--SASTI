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
import { X, Send, Heart, MessageCircle, Share2, Volume2, Globe, ArrowRight, Zap } from 'lucide-react';

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
    { id: 'all', label: 'All', icon: Tag },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'gallery', label: 'Photos', icon: ImageIcon },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'videos', label: 'Videos', icon: Video },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white bg-mesh relative overflow-hidden">
      {/* Category Scroller */}
      <div className="px-6 py-8 flex-none overflow-x-auto no-scrollbar flex items-center gap-4 z-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={cn(
              "px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.3em] whitespace-nowrap transition-all border shrink-0",
              filter === cat.id 
                ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110" 
                : "bg-white/5 text-stone-500 border-white/10 hover:border-white/20"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto customized-scrollbar pb-6 px-6 space-y-6 pt-2">
        {/* Founder's Welcome Card */}
        {filter === 'all' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-indigo-600 rounded-[48px] relative overflow-hidden shadow-2xl shadow-indigo-600/30"
          >
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                      <img src="https://kommodo.ai/i/gO5HPhOr5NCy7nE7ymSo" alt="Akin S. Sokpah" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <h4 className="font-black uppercase tracking-widest text-[10px]">Akin S. Sokpah • Founder</h4>
                      <p className="text-[8px] font-bold text-indigo-200 uppercase tracking-[0.2em]">Mount Barclay, Liberia</p>
                   </div>
                </div>
                <h2 className="text-3xl font-black tracking-tighter leading-none italic uppercase">Architecting the <br /> Liberian Future.</h2>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                   <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100">Genesis v4.0 Active</span>
                   <Globe size={14} className="text-indigo-200 animate-spin-slow" />
                </div>
             </div>
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap size={120} className="text-white fill-white" />
             </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-6">
            {filteredPosts.map((post, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.8 }}
                key={post.id}
                className="group relative bg-black/40 border border-white/5 rounded-[48px] overflow-hidden transition-all flex flex-col active:scale-[0.98] cursor-pointer hover:border-indigo-500/30 shadow-2xl"
                onClick={() => setSelectedPost(post)}
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img 
                    src={post.mediaUrl} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                  
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-indigo-600 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                       {post.type}
                    </span>
                  </div>
                  
                  {post.type === 'videos' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center text-white ring-1 ring-white/40 shadow-2xl group-hover:scale-125 transition-transform duration-500">
                          <Play fill="currentColor" size={24} className="ml-1" />
                       </div>
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                    <div className="w-1 h-1 bg-stone-800 rounded-full" />
                    <span className="text-[9px] font-black text-stone-600 uppercase tracking-[0.2em] italic">Intelligence Authenticated</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter leading-[1.1] font-display uppercase italic text-glow">
                    {post.title}
                  </h3>
                  <p className="text-stone-400 text-sm leading-relaxed line-clamp-2 font-serif italic opacity-80">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 mt-2 border-t border-white/5">
                     <div className="flex items-center gap-3 group/author">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-600/20">AI</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover/author:text-white transition-colors">AkinAI Official</span>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500">
                        <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 px-12">
            <h3 className="text-lg font-black uppercase mb-2">Feed Empty</h3>
            <p className="text-stone-600 text-[10px] font-bold uppercase tracking-widest">Nothing to show for this category yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPost && (
          <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};
