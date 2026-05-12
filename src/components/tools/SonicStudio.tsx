import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Play, Pause, Download, Share2, 
  Settings, Volume2, Mic2, Disc, RefreshCw,
  Sparkles, Layers, Sliders, Headphones
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const SonicStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    lyrics: string;
    production: string;
    style: string;
    bpm: number;
    key: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateMusic = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      if (!apiKey) throw new Error('API Key missing');
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [{
            text: `You are a world-class AI Music Producer (Sonic Studio by AkinAI). 
            The user wants to create: "${prompt}". 
            Generate a detailed "Sonic Blueprint" in JSON format including:
            - title: A catchy song title
            - lyrics: Full verses and chorus
            - production: Technical details (instruments, mixing techniques, soundscapes)
            - style: Musical genre/vibe
            - bpm: Beats per minute (number)
            - key: Musical key (string)
            
            Return ONLY the valid JSON.`
          }]
        }
      });

      const text = response.text;
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const data = JSON.parse(text.slice(jsonStart, jsonEnd));
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-950 text-stone-100">
      <div className="px-8 py-12 max-w-6xl mx-auto w-full space-y-12">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/20">
                <Music size={28} className="text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Sonic Studio</h1>
            </div>
            <p className="text-stone-500 font-medium">Professional AI Music Composition & Neural Mastering</p>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">AkinAI Audio Engine</span>
                <span className="text-xs font-bold text-stone-400">Low Latency / 32-bit Float</span>
             </div>
             <Settings className="text-stone-600 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Studio Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-8">
             <div className="bg-stone-900/50 rounded-[40px] p-8 border border-white/5 space-y-6">
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em]">Neural Prompt</h3>
                   <textarea
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     placeholder='e.g. "Afrobeats with Liberia-style percussion and highlife guitar..." '
                     className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-stone-700 resize-none"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                      <span className="text-[10px] font-black text-stone-500 uppercase">AI Vocalist</span>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                         <span className="text-xs font-bold">Kin Female V1</span>
                      </div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                      <span className="text-[10px] font-black text-stone-500 uppercase">Mastering</span>
                      <div className="flex items-center gap-2 text-xs font-bold">
                         Neural EQ-8 <Sparkles size={12} className="text-yellow-400" />
                      </div>
                   </div>
                </div>

                <button
                  onClick={generateMusic}
                  disabled={isGenerating || !prompt}
                  className="w-full py-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-purple-900/40 transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin" /> Layering Harmonies...
                    </>
                  ) : (
                    <>
                      <Disc size={20} className="animate-pulse" /> Create Hit Song
                    </>
                  )}
                </button>
             </div>

             <div className="p-6 bg-stone-900/30 rounded-3xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                   <Mic2 className="text-purple-400" />
                </div>
                <div>
                   <h4 className="text-xs font-bold text-white uppercase">Voice Training</h4>
                   <p className="text-[10px] text-stone-500 italic">Clone your specific Liberian accent into AkinAI...</p>
                </div>
             </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
             <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/5 rounded-[48px] space-y-4"
                  >
                     <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center text-stone-700 animate-pulse">
                        <Headphones size={32} />
                     </div>
                     <p className="text-stone-600 font-medium">Ready to produce. Describe your vision to begin neural synthesis.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-stone-900 rounded-[48px] overflow-hidden border border-white/10 shadow-3xl"
                  >
                     {/* Player UI */}
                     <div className="p-10 space-y-10">
                        <div className="flex items-start justify-between">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{result.style}</span>
                              <h2 className="text-3xl font-black italic">{result.title}</h2>
                           </div>
                           <div className="flex gap-2">
                              <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold">{result.bpm} BPM</div>
                              <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold">KEY: {result.key}</div>
                           </div>
                        </div>

                        {/* Visualizer Simulation */}
                        <div className="h-40 flex items-center justify-center gap-1">
                           {[...Array(40)].map((_, i) => (
                             <motion.div 
                               key={i}
                               animate={{ 
                                 height: isPlaying ? [10, 80, 20, 60, 10] : [10, 15, 10],
                                 backgroundColor: isPlaying ? ["#9333ea", "#c084fc", "#9333ea"] : "#292524"
                               }}
                               transition={{ repeat: Infinity, duration: 0.8 + Math.random(), delay: i * 0.02 }}
                               className="w-1.5 rounded-full"
                             />
                           ))}
                        </div>

                        <div className="flex items-center gap-8">
                           <button 
                             onClick={() => setIsPlaying(!isPlaying)}
                             className="w-20 h-20 bg-white text-stone-900 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/10 shrink-0"
                           >
                             {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                           </button>
                           
                           <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                 <Volume2 size={16} className="text-stone-500" />
                                 <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                                    <motion.div 
                                      animate={{ width: isPlaying ? "100%" : "0%" }}
                                      transition={{ duration: 180, ease: "linear" }}
                                      className="h-full bg-purple-500 rounded-full"
                                    />
                                 </div>
                              </div>
                              <div className="flex justify-between text-[9px] font-bold text-stone-500 uppercase tracking-widest">
                                 <span>Neural Stream</span>
                                 <span>Free Download Enabled</span>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <button className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
                              <Download size={18} /> Download HQ MP3
                           </button>
                           <button className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">
                              <Share2 size={18} /> Share Studio Link
                           </button>
                        </div>
                     </div>

                     {/* Lyrics / Tech View */}
                     <div className="border-t border-white/10 bg-black/40 p-10">
                        <div className="flex items-center gap-6 border-b border-white/5 pb-6 mb-8">
                           <button className="text-xs font-black uppercase tracking-widest border-b-2 border-purple-500 pb-2">Lyrics</button>
                           <button className="text-xs font-black uppercase tracking-widest text-stone-600 hover:text-stone-400 pb-2 flex items-center gap-2">
                              Production Notes <Sliders size={12} />
                           </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto space-y-6 pr-4 customized-scrollbar">
                           <pre className="text-sm font-medium leading-relaxed whitespace-pre-wrap font-sans text-stone-300">
                             {result.lyrics}
                           </pre>
                           <div className="p-6 bg-purple-500/5 rounded-3xl border border-purple-500/10">
                              <div className="flex items-center gap-2 text-purple-400 mb-2">
                                 <Layers size={14} />
                                 <span className="text-[10px] font-black uppercase">Arrangement Details</span>
                              </div>
                              <p className="text-xs text-stone-400 leading-relaxed italic">
                                 {result.production}
                              </p>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        {/* Footer Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
           <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-4 hover:border-purple-500/30 transition-all group">
              <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
                <Sparkles size={20} />
              </div>
              <h4 className="font-bold text-white uppercase tracking-tight">Zero-Cost Masters</h4>
              <p className="text-xs text-stone-500">Unlike Suno or Udio, AkinAI allows full commercial-use downloads of your neural stems.</p>
           </div>
           <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-4 hover:border-purple-500/30 transition-all group">
              <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
                <Disc size={20} />
              </div>
              <h4 className="font-bold text-white uppercase tracking-tight">Hybrid Synthesis</h4>
              <p className="text-xs text-stone-500">Advanced percussion models specifically trained on West African rhythmic structures.</p>
           </div>
           <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-4 hover:border-purple-500/30 transition-all group">
              <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
                <Sliders size={20} />
              </div>
              <h4 className="font-bold text-white uppercase tracking-tight">Studio Collaboration</h4>
              <p className="text-xs text-stone-500">Export MIDI and multi-track stems directly into professional DAWs like FL Studio or Logic.</p>
           </div>
        </div>

      </div>
    </div>
  );
};
