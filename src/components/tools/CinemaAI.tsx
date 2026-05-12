import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clapperboard, Play, Download, Share2, 
  Settings, Video, Film, Sparkles, RefreshCw,
  Camera, Zap, Monitor, Layers, Cpu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const CinemaAI: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    description: string;
    cinematography: string;
    vfx: string;
    duration: string;
    resolution: string;
    fps: number;
  } | null>(null);

  const generateVideo = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      if (!apiKey) throw new Error('API Key missing');
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [{
            text: `You are a world-class AI Film Director (Cinema AI by AkinAI). 
            The user wants to generate a video: "${prompt}". 
            Generate a detailed "Direction Blueprint" in JSON format including:
            - title: A cinematic title
            - description: Vivid description of the visuals
            - cinematography: Camera angles, lighting, and movement
            - vfx: Technical visual effects details
            - duration: Length of the clip (e.g., "15s")
            - resolution: Resolution (e.g., "4K Ultra HD")
            - fps: Frames per second (number)
            
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
    <div className="flex-1 flex flex-col bg-stone-900 text-stone-100 pb-20">
      <div className="px-8 py-12 max-w-7xl mx-auto w-full space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 p-12 bg-black/40 rounded-[64px] border border-white/5 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20">
                    <Clapperboard size={32} className="text-white" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AkinAI Motion Lab</span>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic">Cinema AI</h1>
                 </div>
              </div>
              <p className="text-stone-400 max-w-xl text-lg font-medium leading-relaxed">
                Transform text into cinematic reality. Precision-engineered for ultra-high definition motion synthesis and professional film grain simulation.
              </p>
           </div>
           
           <div className="flex items-center gap-6 relative z-10">
              <div className="text-right">
                 <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Engine Status</p>
                 <p className="text-sm font-bold text-green-400 flex items-center gap-2 justify-end">
                    HYPER-REAL READY <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                 </p>
              </div>
              <Settings className="text-stone-600 hover:text-white cursor-pointer" />
           </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Directorial Control (Left) */}
           <div className="lg:col-span-4 space-y-10">
              <div className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Directorial Prompt</h3>
                    <Sparkles size={14} className="text-blue-500 animate-pulse" />
                 </div>
                 <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='Describe your scene... (e.g., "A hyper-realistic cinematic shot of a liberian beach with glowing bio-luminescent waves at night")'
                    className="w-full h-56 bg-black/60 border border-white/5 rounded-[40px] p-8 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-stone-700 resize-none leading-relaxed"
                 />
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <Camera size={20} className="text-blue-400" />
                       <span className="text-xs font-bold text-stone-300">Anamorphic Lens</span>
                    </div>
                    < Zap size={14} className="text-stone-600 group-hover:text-yellow-400" />
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <Monitor size={20} className="text-blue-400" />
                       <span className="text-xs font-bold text-stone-300">8K RAW Neutral Color</span>
                    </div>
                    <Zap size={14} className="text-stone-600 group-hover:text-yellow-400" />
                 </div>
              </div>

              <button 
                 onClick={generateVideo}
                 disabled={isGenerating || !prompt}
                 className="w-full py-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-[40px] font-black uppercase tracking-[0.3em] text-sm shadow-3xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                 {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin" /> Rendering Sequence...
                    </>
                 ) : (
                    <>
                      <Play size={20} fill="currentColor" /> Render Cinematic
                    </>
                 )}
              </button>
           </div>

           {/* Cinematic Preview (Right) */}
           <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                 {!result ? (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="aspect-video bg-black/40 rounded-[64px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-20 space-y-6"
                   >
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-stone-700 animate-pulse">
                         <Film size={40} />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-bold text-stone-500">Virtual Viewfinder</h3>
                         <p className="text-sm text-stone-600 max-w-xs mx-auto italic">Waiting for directorial instructions. Render your scene to preview neural motion.</p>
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="space-y-8"
                   >
                      <div className="aspect-video bg-stone-950 rounded-[64px] overflow-hidden border border-white/10 relative shadow-4xl group">
                         {/* Mock Video Placeholder with high-end UI */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-4">
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] animate-pulse">Processing Advanced Motion Vectors</p>
                               <div className="flex items-center gap-2 justify-center">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-1 h-8 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                                  ))}
                               </div>
                            </div>
                         </div>
                         
                         {/* Labels */}
                         <div className="absolute top-10 left-10 z-20 flex gap-4">
                            <div className="px-5 py-2 bg-black/60 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                               {result.resolution}
                            </div>
                            <div className="px-5 py-2 bg-black/60 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                               {result.fps} FPS
                            </div>
                         </div>

                         <div className="absolute bottom-10 left-10 right-10 z-20 flex items-end justify-between">
                            <div className="space-y-1">
                               <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Sequence</span>
                               <h2 className="text-2xl font-black italic">{result.title}</h2>
                            </div>
                            <div className="flex gap-4">
                               <button className="p-4 bg-white text-stone-900 rounded-2xl hover:scale-110 transition-all">
                                  <Download size={20} />
                               </button>
                               <button className="p-4 bg-white/10 backdrop-blur text-white rounded-2xl hover:scale-110 transition-all border border-white/10">
                                  <Share2 size={20} />
                               </button>
                            </div>
                         </div>
                      </div>

                      {/* Film Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="p-10 bg-black/40 rounded-[48px] border border-white/5 space-y-6">
                            <div className="flex items-center gap-3 text-blue-400">
                               <Camera size={18} />
                               <h4 className="text-xs font-black uppercase tracking-widest">Cinematography</h4>
                            </div>
                            <p className="text-sm text-stone-400 leading-relaxed font-medium capitalize prose-stone">
                               {result.cinematography}
                            </p>
                         </div>
                         <div className="p-10 bg-black/40 rounded-[48px] border border-white/5 space-y-6">
                            <div className="flex items-center gap-3 text-blue-400">
                               <Layers size={18} />
                               <h4 className="text-xs font-black uppercase tracking-widest">Visual Effects (VFX)</h4>
                            </div>
                            <p className="text-sm text-stone-400 leading-relaxed font-medium italic">
                               {result.vfx}
                            </p>
                         </div>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { icon: Cpu, name: "Neural Stems", desc: "Layered AI generation for custom edits." },
             { icon: Zap, name: "Zero Latency", desc: "Instant low-res previews before rendering." },
             { icon: Monitor, name: "Free Export", desc: "Full resolution downloads, no watermark." },
             { icon: Film, name: "True Motion", desc: "Advanced temporal consistency engine." }
           ].map((feat, i) => (
              <div key={i} className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-4 hover:bg-white/10 transition-all group">
                 <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:text-blue-400 transition-colors">
                    <feat.icon size={20} />
                 </div>
                 <h5 className="font-bold uppercase tracking-tight text-white">{feat.name}</h5>
                 <p className="text-[10px] text-stone-500 font-medium">{feat.desc}</p>
              </div>
           ))}
        </div>

      </div>
    </div>
  );
};
