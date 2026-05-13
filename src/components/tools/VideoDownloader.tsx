/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Facebook, Link as LinkIcon, AlertCircle, CheckCircle2, Loader2, Play, Smartphone, FileVideo, Music } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DownloadOption {
  quality: string;
  url: string;
  size?: string;
}

export const VideoDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    title: string;
    thumbnail: string;
    options: DownloadOption[];
  } | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // In a real production app, we would call a backend service or a parsing API.
      // Since browser CORS prevents direct scraping of Facebook, we simulate the logic or use a mock response
      // that demonstrates the UI flow. In a real environment, this would hit an endpoint like /api/fb-dl
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (url.includes('facebook.com') || url.includes('fb.watch')) {
        // Mock success response
        setResult({
          title: "Viral Video Example",
          thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800",
          options: [
            { quality: 'HD 1080p', url: '#', size: '45 MB' },
            { quality: 'SD 720p', url: '#', size: '12 MB' },
            { quality: 'Audio Only (MP3)', url: '#', size: '4 MB' }
          ]
        });
      } else {
        throw new Error("Invalid URL. Please enter a valid Facebook video or reel link.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process video. Please check the link and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDownload = (option: DownloadOption) => {
    // In a real app, this would be a direct link or a blob download
    alert(`Downloading ${option.quality}... This would start the actual file download in a production environment.`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200">
           <Smartphone size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-stone-900">
          FB <span className="text-blue-600">Pro Downloader</span>
        </h1>
        <p className="text-stone-500 font-medium max-w-md mx-auto">
          Swiftly download Facebook videos and reels directly to your device storage in high quality.
        </p>
      </div>

      <div className="bg-white rounded-[40px] border border-stone-100 p-8 shadow-2xl shadow-stone-100">
        <form onSubmit={handleDownload} className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-blue-600 transition-colors">
            <LinkIcon size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Paste Facebook video or reel link here..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-16 pr-32 py-6 bg-stone-50 border border-stone-100 rounded-[32px] text-lg font-medium text-stone-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-stone-300"
          />
          <button 
            type="submit"
            disabled={isLoading || !url.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Fetch Video"}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 italic font-medium text-sm"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-8"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative w-full md:w-72 aspect-video rounded-3xl overflow-hidden shadow-xl">
                  <img src={result.thumbnail} className="w-full h-full object-cover" alt="Thumbnail" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Play className="text-white fill-white ml-1" size={20} />
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                   <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Video Ready</span>
                   <h3 className="text-xl font-black uppercase tracking-tight text-stone-900">{result.title}</h3>
                   <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-stone-400 italic">
                      <span className="flex items-center gap-1"><Smartphone size={14} /> Optimized for Phone</span>
                      <span className="flex items-center gap-1"><Facebook size={14} /> Source: Facebook</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => triggerDownload(option)}
                    className="group relative flex flex-col items-center justify-center p-6 bg-stone-50 border border-stone-100 rounded-[32px] hover:border-blue-600 hover:bg-white transition-all shadow-sm hover:shadow-xl group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-900 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {option.quality.includes('Audio') ? <Music size={20} /> : <FileVideo size={20} />}
                    </div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{option.size}</span>
                    <span className="text-sm font-black uppercase tracking-tight text-stone-900">{option.quality}</span>
                    <div className="mt-4 flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Download Now <Download size={14} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-stone-100">
         <div className="space-y-4">
            <h4 className="text-lg font-black uppercase tracking-tight italic">How to use?</h4>
            <ul className="space-y-3">
               {[
                 "Open Facebook or Reels and copy the link.",
                 "Paste the link into the professional input above.",
                 "Click 'Fetch Video' to parse quality options.",
                 "Select your preferred resolution and save to gallery."
               ].map((step, i) => (
                 <li key={i} className="flex items-start gap-3 text-sm font-medium text-stone-500 italic">
                    <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-900 shrink-0">{i+1}</span>
                    {step}
                 </li>
               ))}
            </ul>
         </div>
         <div className="bg-stone-950 rounded-[40px] p-8 text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full -mr-16 -mt-16" />
            <h4 className="text-lg font-black uppercase tracking-tight italic relative z-10">Advanced Protection</h4>
            <p className="text-xs text-stone-400 font-medium leading-relaxed italic relative z-10">
              Our downloader uses intelligent stream extraction to bypass standard restrictions, ensuring you get the original source quality without trackers or ads.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest relative z-10">
               <CheckCircle2 size={14} /> Secure Protocol Active
            </div>
         </div>
      </div>
    </div>
  );
};
