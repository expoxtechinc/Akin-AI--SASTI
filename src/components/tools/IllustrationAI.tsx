/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brush, Eraser, Download, Share2, Layers, Zap, Info, Wand2, Type } from 'lucide-react';
import { ToolInterface } from './ToolInterface';
import { TOOLS } from '../../constants';
import { cn } from '../../lib/utils';

const illustratorTool = TOOLS.find(t => t.id === 'illustrator')!;

export const IllustrationAI: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIllustration, setCurrentIllustration] = useState<string | null>(null);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  
  const handleIllustrationRequest = (request: string) => {
    setIsGenerating(true);
    setGenerationSteps(['Initializing Master Canvas...', 'Analyzing stylistic vocabulary...', 'Mapping brush structures...', 'Layering neural textures...']);
    
    // Simulate generation process
    setTimeout(() => {
      setCurrentIllustration(`https://picsum.photos/seed/${encodeURIComponent(request)}/1080/1080`);
      setIsGenerating(false);
      setGenerationSteps([]);
    }, 4000);
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 overflow-hidden font-sans">
      {/* Illustrator Header */}
      <div className="bg-stone-950 border-b border-white/5 px-6 py-4 flex items-center justify-between z-20">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-stone-900 shadow-xl shadow-yellow-500/20 transform rotate-3">
               <Brush size={24} />
            </div>
            <div>
               <h1 className="text-lg font-black text-white tracking-widest uppercase italic">AkinIllustrator</h1>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Neural Drawing Engine v2.0</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-stone-800 text-stone-300 text-[10px] font-bold rounded-lg border border-white/5 hover:border-white/10 transition-all uppercase tracking-widest flex items-center gap-2">
               <Download size={14} /> Vector Export
            </button>
            <button className="px-4 py-2 bg-yellow-400 text-stone-900 text-[10px] font-bold rounded-lg hover:brightness-110 transition-all uppercase tracking-widest flex items-center gap-2">
               <Share2 size={14} /> Publish
            </button>
         </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Chat & Prompting Side */}
        <div className="lg:w-[450px] border-r border-white/5 flex flex-col bg-stone-950">
           <div className="p-6 border-b border-white/5">
              <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">Master Prompt Controls</label>
           </div>
           <div className="flex-1 overflow-hidden">
              <ToolInterface tool={illustratorTool} />
           </div>
        </div>

        {/* Live Canvas Side */}
        <div className="flex-1 bg-stone-900 relative overflow-hidden flex flex-col">
           {/* Canvas Controls Overlay */}
           <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-2 pointer-events-auto">
                 {[1, 2, 3].map(layer => (
                   <button
                     key={layer}
                     onClick={() => setActiveLayer(layer)}
                     className={cn(
                       "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border",
                       activeLayer === layer ? "bg-white text-stone-950 border-white" : "bg-stone-950/50 text-stone-500 border-white/5"
                     )}
                   >
                     L{layer}
                   </button>
                 ))}
                 <div className="w-px h-6 bg-white/5 mx-2" />
                 <button className="w-8 h-8 bg-stone-950/50 text-stone-500 rounded-lg flex items-center justify-center border border-white/5 hover:text-white transition-all">
                    <Layers size={14} />
                 </button>
              </div>

              <div className="flex items-center gap-3 pointer-events-auto">
                 <div className="flex items-center bg-stone-950/80 backdrop-blur-xl border border-white/5 p-1 rounded-xl shadow-2xl">
                    <button className="p-2 text-stone-500 hover:text-white transition-colors"><Eraser size={18} /></button>
                    <button className="p-2 text-stone-500 hover:text-white transition-colors"><Type size={18} /></button>
                    <button className="p-2 text-yellow-400"><Wand2 size={18} /></button>
                 </div>
              </div>
           </div>

           {/* The Canvas */}
           <div className="flex-1 p-8 md:p-12 lg:p-24 flex items-center justify-center relative">
              <div className="w-full h-full max-w-4xl aspect-square bg-[#1a1a1a] rounded-[48px] shadow-2xl relative overflow-hidden flex items-center justify-center border border-white/5 group">
                 <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div 
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-6"
                      >
                         <div className="w-24 h-24 relative">
                            <motion.div 
                               animate={{ rotate: 360 }}
                               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                               className="absolute inset-0 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full"
                            />
                            <motion.div 
                               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                               transition={{ repeat: Infinity, duration: 1.5 }}
                               className="absolute inset-4 bg-yellow-400 rounded-full blur-xl"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <Brush size={32} className="text-yellow-400" />
                            </div>
                         </div>
                         <div className="space-y-3 text-center">
                            <p className="text-xs font-black text-white uppercase tracking-[0.4em] animate-pulse">Illustrating Masterpiece</p>
                            <div className="flex flex-col items-center gap-1">
                               {generationSteps.map((step, i) => (
                                 <motion.span 
                                   initial={{ opacity: 0, y: 5 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   key={i}
                                   className="text-[9px] font-bold text-stone-500 uppercase tracking-widest"
                                 >
                                   {step}
                                 </motion.span>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                    ) : currentIllustration ? (
                      <motion.div
                        key="illustration"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full relative"
                      >
                         <img 
                            src={currentIllustration} 
                            alt="AI Illustration" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                            referrerPolicy="no-referrer"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-12">
                            <div className="space-y-2">
                               <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.3em]">Master Composition</span>
                               <h4 className="text-2xl font-bold text-white tracking-tight">Neural Render completed in 4.2s</h4>
                            </div>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                         key="empty"
                         className="flex flex-col items-center gap-6 opacity-20"
                      >
                         <div className="w-20 h-20 bg-stone-800 rounded-3xl flex items-center justify-center text-white">
                            <Brush size={40} strokeWidth={1} />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Canvas Ready</p>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>

           {/* Footer Stats */}
           <div className="p-6 bg-stone-950 flex items-center justify-between border-t border-white/5">
              <div className="flex gap-8">
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-stone-500 uppercase">Resolution</span>
                    <span className="text-[10px] font-bold text-white">4096 x 4096 (Neural HD)</span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-stone-500 uppercase">Style Engine</span>
                    <span className="text-[10px] font-bold text-white">DeepIllustration v4.2</span>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <Zap size={12} className="text-yellow-400" />
                    <span className="text-[8px] font-bold text-stone-500 uppercase">Real-time sync active</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
