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

export const LiveFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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
    { id: 'ads', label: 'Ads', icon: Megaphone },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 border-b border-stone-100 bg-stone-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
           <div>
              <h1 className="text-3xl font-black tracking-tight uppercase italic text-indigo-600">AkinAI. Live Feed</h1>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Real-time updates from the AkinAI ecosystem</p>
           </div>
           
           <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                    filter === cat.id 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
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
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Loading live updates...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={post.id}
                  className="group bg-white border border-stone-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden bg-stone-900">
                    <img 
                      src={post.mediaUrl} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                          {post.type}
                       </span>
                    </div>
                    {post.type === 'videos' && (
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white scale-110 group-hover:scale-125 transition-transform">
                             <Play fill="currentColor" size={24} />
                          </div>
                       </div>
                    )}
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                      <Calendar size={12} />
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags?.map((tag: string, j: number) => (
                        <span key={j} className="text-[10px] font-bold text-stone-400">#{tag}</span>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 self-start group-hover:gap-3 transition-all">
                      Read More <ExternalLink size={14} />
                    </button>
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
    </div>
  );
};
