import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, GraduationCap, Globe, Cpu, RefreshCw, ExternalLink, Calendar, Bell, Bookmark, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchLatestNews, syncNewsToFeed, NewsItem } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';

export const NewsHub: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scholarship' | 'tech' | 'liberia'>('all');

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const realNews = await fetchLatestNews();
      
      if (realNews.length > 0) {
        setNews(realNews);
        syncNewsToFeed(realNews);
      } else {
        const prompt = `Generate 6 current "live" news/opportunity items for a dashboard. 
        Categories: 'scholarship', 'tech', 'liberia'. 
        Focus on West Africa and Liberia.`;
        
        const data = await geminiService.generateJson(prompt);
        setNews(Array.isArray(data) ? data : data.news || []);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setNews([
        { id: '1', title: 'GEM Fellowship 2026 Open', excerpt: 'Full funding for STEM graduate degrees in the US.', category: 'scholarship', date: '12 May', source: 'AkinAI Education', link: '#' },
        { id: '2', title: '5G Expansion in Monrovia', excerpt: 'Leading telcos announce rollout of ultra-fast internet.', category: 'liberia', date: '11 May', source: 'LN Daily', link: '#' },
        { id: '3', title: 'AI Ethics Summit', excerpt: 'Global leaders convene to discuss neural safety.', category: 'tech', date: '10 May', source: 'TechCrunch', link: '#' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = filter === 'all' ? news : news.filter(n => n.category === filter);

  return (
    <div className="flex-1 flex flex-col bg-stone-50">
      <div className="px-8 py-12 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Hero / Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-stone-900 rounded-xl text-white">
                  <Compass size={24} />
               </div>
               <h1 className="text-3xl font-bold tracking-tight text-stone-900">AkinAI Discovery Hub</h1>
            </div>
            <p className="text-stone-500 max-w-lg">
              Stay ahead with curated real-time updates on scholarships, global tech, and local progress in Liberia.
            </p>
          </div>
          
          <button 
            onClick={fetchNews}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-100 hover:border-stone-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
            {isLoading ? 'Syncing...' : 'Live Updates Active'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'scholarship', 'tech', 'liberia'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                filter === f 
                  ? "bg-stone-900 text-white border-stone-900 shadow-md" 
                  : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item, i) => {
              const Icon = item.category === 'scholarship' ? GraduationCap : item.category === 'tech' ? Cpu : Globe;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-stone-300 transition-all flex flex-col overflow-hidden"
                >
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "p-2.5 rounded-xl",
                          item.category === 'scholarship' ? "bg-blue-50 text-blue-600" :
                          item.category === 'tech' ? "bg-purple-50 text-purple-600" :
                          "bg-green-50 text-green-600"
                        )}>
                          <Icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                          {item.date}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <a href={item.link} target="_blank" rel="noreferrer">
                          <h3 className="text-lg font-bold text-stone-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h3>
                        </a>
                         <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">
                           {item.excerpt}
                         </p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Source</span>
                        <span className="text-xs font-bold text-stone-900 tracking-tight uppercase">{item.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                          <Bookmark size={16} />
                        </button>
                        <a href={item.link} target="_blank" rel="noreferrer" className="p-2 text-stone-400 hover:text-indigo-600 transition-colors">
                           <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Global Connection CTA */}
        <div className="bg-stone-900 rounded-[40px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
           <div className="absolute inset-0 bg-stone-800/50 mix-blend-overlay pointer-events-none" />
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
           
           <div className="flex-1 space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                <Bell size={12} className="animate-bounce" /> Official Community
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                Join the AkinAI <br /> WhatsApp Ecosystem
              </h2>
              <p className="text-stone-400 max-w-md">
                Get instant notifications on your phone. Connect with thousands of Liberian students and tech leaders.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                 <a 
                   href="https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
                   target="_blank" rel="noreferrer"
                   className="flex items-center gap-3 px-8 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg active:scale-95"
                 >
                   Main Discussion Group
                 </a>
                 <a 
                   href="https://whatsapp.com/channel/0029VbCYgbzL7UVcJBJGAu3u"
                   target="_blank" rel="noreferrer"
                   className="flex items-center gap-3 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all backdrop-blur"
                 >
                   Follow Channel
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
