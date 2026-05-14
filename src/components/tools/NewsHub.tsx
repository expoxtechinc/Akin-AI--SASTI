import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, GraduationCap, Globe, Cpu, RefreshCw, ExternalLink, Calendar, Bell, Bookmark, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { fetchLatestNews, syncNewsToFeed, NewsItem } from '../../services/newsService';

const apiKey = process.env.GEMINI_API_KEY;

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
        if (!apiKey) throw new Error('API Key missing');
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: {
            parts: [{
              text: `Generate 6 current "live" news/opportunity items for a dashboard in JSON format. 
              Categories: 'scholarship', 'tech', 'liberia'. 
              Return ONLY a JSON array of objects with fields: id, title, excerpt, category, date (Day Month), source, link.`
            }]
          }
        });

        const text = response.text;
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']') + 1;
        const data = JSON.parse(text.slice(jsonStart, jsonEnd));
        setNews(data);
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
    <div className="flex-1 flex flex-col bg-[#050505] overflow-y-auto customized-scrollbar-dark">
      <div className="px-6 py-10 max-w-7xl mx-auto w-full space-y-10">
        
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Intelligence Stream</span>
            </div>
            <button 
              onClick={fetchNews}
              disabled={isLoading}
              className="p-2 bg-white/5 rounded-xl border border-white/10 text-stone-500 hover:text-white transition-colors"
            >
              <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
            </button>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white leading-none">Global Discovery.</h1>
            <p className="text-stone-500 text-sm font-medium">Curated intelligence for the next generation.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide py-2">
          {(['all', 'scholarship', 'tech', 'liberia'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border shrink-0",
                filter === f 
                  ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                  : "bg-white/5 text-stone-500 border-white/10 hover:bg-white/10"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item, i) => {
              const Icon = item.category === 'scholarship' ? GraduationCap : item.category === 'tech' ? Cpu : Globe;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-[#0A0A0A] rounded-[32px] border border-white/5 p-6 hover:bg-[#0F0F0F] transition-all"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                          item.category === 'scholarship' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                          item.category === 'tech' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        )}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">{item.category} Protocol</p>
                          <span className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-tighter">{item.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 text-stone-600 hover:text-white transition-colors">
                          <Bookmark size={16} />
                        </button>
                        <a href={item.link} target="_blank" rel="noreferrer" className="p-2 text-stone-600 hover:text-indigo-400 transition-colors">
                           <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <a href={item.link} target="_blank" rel="noreferrer">
                        <h3 className="text-xl font-black text-white line-clamp-2 leading-tight tracking-tight group-hover:text-indigo-400 transition-colors uppercase italic">
                          {item.title}
                        </h3>
                      </a>
                      <p className="text-sm text-stone-400 leading-relaxed line-clamp-3 font-medium">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[8px] font-black uppercase text-stone-500">
                          {item.source.charAt(0)}
                        </div>
                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{item.source}</span>
                      </div>
                      <Share2 size={14} className="text-stone-700 cursor-pointer hover:text-white transition-colors" />
                    </div>
                  </div>
                  
                  {/* Hover Accent */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-full blur-[2px]" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Global Connection CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-[40px] p-8 border border-white/10 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
              <Globe size={10} className="text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Neural Network Invite</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white leading-none">Accelerate <br /><span className="text-indigo-400">Collaboration.</span></h2>
            <p className="text-stone-400 text-sm font-medium max-w-sm">Join the master discussion ecosystem and synchronize with global innovators.</p>
            <div className="flex flex-col gap-3 pt-2">
              <a 
                href="https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
                target="_blank" rel="noreferrer"
                className="w-full py-4 bg-white text-black text-center font-black uppercase tracking-[0.2em] text-[10px] rounded-[20px] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
              >
                Join Global Core
              </a>
              <a 
                href="https://whatsapp.com/channel/0029VbCYgbzL7UVcJBJGAu3u"
                target="_blank" rel="noreferrer"
                className="w-full py-4 bg-white/5 border border-white/10 text-white text-center font-black uppercase tracking-[0.2em] text-[10px] rounded-[20px] transition-all hover:bg-white/10"
              >
                Sync with Channel
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
