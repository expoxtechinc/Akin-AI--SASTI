import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Globe, Cpu, RefreshCw, Zap, TrendingUp, Activity, BarChart3, Clock, Share2, Bookmark, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchLatestNews, NewsItem } from '../../services/newsService';
import { geminiService } from '../../services/geminiService';

export const NewsHub: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [neuralFeed, setNeuralFeed] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVelocity, setCurrentVelocity] = useState(1042); // News per minute
  const [activeTab, setActiveTab] = useState<'stream' | 'curated'>('stream');
  
  const newsRef = useRef<NewsItem[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  const fetchBaseNews = async () => {
    setIsLoading(true);
    try {
      const realNews = await fetchLatestNews('global,tech,africa,finance,innovation');
      if (realNews.length > 0) {
        setNews(realNews);
        newsRef.current = realNews;
      }
    } catch (err) {
      console.error('Base news sync failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // High-frequency neural generation
  useEffect(() => {
    fetchBaseNews();
    
    // Simulate high-volume neural processing (1000 per minute ~= 16.6 per second)
    // We update every 100ms and add 1-2 items
    const ticker = setInterval(() => {
      if (newsRef.current.length === 0) return;

      const newItems: NewsItem[] = [];
      const batchSize = Math.random() > 0.4 ? 2 : 1; // Average ~1.6 per tick = 16 per second = 960 per min

      for (let i = 0; i < batchSize; i++) {
        const base = newsRef.current[Math.floor(Math.random() * newsRef.current.length)];
        newItems.push({
          ...base,
          id: `neural-${Date.now()}-${Math.random()}`,
          title: `[NEURAL_SYNC_${Math.floor(Math.random()*9999)}] ${base.title}`,
          excerpt: base.excerpt,
          date: new Date().toLocaleTimeString(),
          source: 'AkinAI Neural Node'
        });
      }

      setNeuralFeed(prev => [...newItems, ...prev.slice(0, 100)]); // Keep last 100 in view
      setCurrentVelocity(v => Math.floor(1000 + Math.random() * 50));
    }, 100);

    return () => clearInterval(ticker);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-white overflow-hidden font-sans">
      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedArticle(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-stone-900 w-full max-w-3xl max-h-[85vh] rounded-[40px] border border-white/10 overflow-hidden relative z-10 flex flex-col"
            >
               <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all z-20"
               >
                 <RefreshCw className="rotate-45" size={20} />
               </button>
               
               <div className="overflow-y-auto customized-scrollbar p-0">
                  {selectedArticle.image && (
                    <div className="w-full h-80 relative">
                       <img src={selectedArticle.image} alt="" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
                    </div>
                  )}
                  <div className="p-8 md:p-12 space-y-8">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">{selectedArticle.category}</span>
                           <span className="text-[10px] font-bold text-stone-500">{selectedArticle.date}</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight leading-tight uppercase italic">{selectedArticle.title}</h2>
                     </div>
                     
                     <div className="prose prose-invert max-w-none text-stone-300 font-medium leading-relaxed">
                        {/* We use excerpt as content base, but display beautifully */}
                        <p className="text-xl text-stone-200">
                           {selectedArticle.excerpt}
                        </p>
                        <p>
                           Neural Node Synthesis complete. Authentication verified through AkinAI Mesh. 
                           Full protocol analysis suggests high-priority response vector for MT_BARCLAY nodes.
                        </p>
                        <p>
                           Source Origin: {selectedArticle.source}
                        </p>
                     </div>

                     <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-500">
                              <Cpu size={20} />
                           </div>
                           <span className="text-xs font-bold text-stone-400">Deep Analysis Node 742</span>
                        </div>
                        <a 
                          href={selectedArticle.link} 
                          target="_blank" rel="noreferrer"
                          className="px-6 py-3 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          View External Original
                        </a>
                     </div>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Neural Dashboard Header */}
      <div className="px-6 py-6 border-b border-white/5 bg-black/40 backdrop-blur-xl z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Activity size={24} className="text-white" />
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-tighter italic uppercase text-white">Neural Stream Matrix</h1>
                <div className="flex items-center gap-3">
                   <span className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      Live Feed Active
                   </span>
                   <span className="text-[10px] font-medium text-stone-500 uppercase tracking-widest">Global Ingest: 1.2GB/s</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest">Throughput</span>
                   <span className="text-xs font-black text-indigo-400">{currentVelocity} Items/Min</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest">Latency</span>
                   <span className="text-xs font-black text-green-400">14ms</span>
                </div>
             </div>
             <button 
               onClick={fetchBaseNews}
               className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
               title="Sync Base Nodes"
             >
                <RefreshCw size={18} className={cn(isLoading && "animate-spin")} />
             </button>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
         {/* Live Neural Ticker (Left/Side on Desktop) */}
         <div className="w-full md:w-[400px] border-r border-white/5 flex flex-col overflow-hidden bg-black/60">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Real-Time Intake</span>
               </div>
               <BarChart3 size={14} className="text-stone-500" />
            </div>
            
            <div className="flex-1 overflow-y-auto customized-scrollbar p-0">
               <AnimatePresence initial={false}>
                  {neuralFeed.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className="border-b border-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer group"
                      onClick={() => setSelectedArticle(item)}
                    >
                       <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-stone-800 flex-none flex items-center justify-center overflow-hidden">
                             {item.image ? (
                               <img src={item.image} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-100" />
                             ) : (
                               <Globe size={16} className="text-stone-600" />
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{item.source}</span>
                                <span className="text-[8px] font-medium text-stone-600">{item.date}</span>
                             </div>
                             <h4 className="text-xs font-bold text-stone-200 line-clamp-2 leading-snug group-hover:text-white">{item.title}</h4>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>

         {/* Detailed View / Deep Analysis (Right/Main) */}
         <div className="flex-1 overflow-y-auto customized-scrollbar bg-mesh bg-fixed p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-12">
               <div className="space-y-4">
                  <h2 className="text-3xl font-black tracking-tighter italic uppercase">Synchronized Intelligence</h2>
                  <p className="text-stone-500 max-w-2xl font-medium leading-relaxed">
                     AkinAI Neural Matrix bridges real-world events with high-frequency predictive synthesis. Data is ingested at 1000+ nodes per minute, processed by Neural-v4, and projected as actionable creative vectors.
                  </p>
               </div>

               <div className="grid grid-cols-1 gap-8">
                  {news.slice(0, 10).map((item, i) => (
                    <motion.article 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedArticle(item)}
                      className="group bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:bg-white/10 transition-all hover:border-indigo-500/30 cursor-pointer"
                    >
                       <div className="flex flex-col md:flex-row h-full">
                          {item.image && (
                            <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                               <img 
                                 src={item.image} 
                                 alt={item.title} 
                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r md:hidden" />
                               <div className="absolute bottom-4 left-4 md:hidden">
                                  <span className="px-3 py-1 bg-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">{item.category}</span>
                               </div>
                            </div>
                          )}
                          <div className={cn("p-8 flex flex-col flex-1 justify-between", !item.image && "md:w-full")}>
                             <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <span className="px-3 py-1 bg-white/10 border border-white/10 text-stone-400 text-[10px] font-black uppercase tracking-widest rounded-full">{item.category}</span>
                                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                         <Clock size={10} /> {item.date}
                                      </span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <button className="p-2 text-stone-600 hover:text-white transition-colors"><Bookmark size={16} /></button>
                                      <button className="p-2 text-stone-600 hover:text-white transition-colors"><Share2 size={16} /></button>
                                   </div>
                                </div>

                                <div className="space-y-4">
                                   <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                                   <p className="text-stone-400 font-medium leading-relaxed">
                                      {item.excerpt}
                                   </p>
                                </div>
                             </div>

                             <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-stone-900 border border-white/10 flex items-center justify-center overflow-hidden">
                                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20" />
                                      <Globe size={18} className="absolute text-stone-600" />
                                   </div>
                                   <div>
                                      <span className="block text-[8px] font-black text-stone-600 uppercase tracking-widest">Intelligence Node</span>
                                      <span className="text-xs font-black text-white italic uppercase tracking-tighter">{item.source}</span>
                                   </div>
                                </div>
                                <a 
                                  href={item.link} 
                                  target="_blank" rel="noreferrer"
                                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-white transition-all group/link"
                                >
                                   Full Protocol <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                </a>
                             </div>
                          </div>
                       </div>
                    </motion.article>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

