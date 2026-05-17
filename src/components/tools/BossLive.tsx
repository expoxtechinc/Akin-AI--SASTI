/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2, Zap, Eye, Target, Shield, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { cn } from '../../lib/utils';
import { AKIN_TOOLS, handleLiveToolCall } from '../../services/liveTools';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export const BossLive: React.FC = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAiMuted, setIsAiMuted] = useState(false);
  const [status, setStatus] = useState<string>('System Offline');
  const [aiTranscription, setAiTranscription] = useState<string>('');
  const [detections, setDetections] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startBossLive = async () => {
    setIsCalling(true);
    setStatus('BossLive: Active Surveillance');
    setAiTranscription('Visual systems activated. Surveillance log initialized. Point sensor at target and describe what you see.');
    setDetections(['System: ONLINE', 'Visual Cortex: READY']);
  };

  const handleSurveillanceAction = async (prompt: string) => {
    try {
      setStatus('Analyzing visual stream...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: [
            { role: 'user', parts: [{ text: "Initiate Vision" }] },
            { role: 'model', parts: [{ text: "Visual systems activated. Surveillance log initialized. Point sensor at target and describe what you see." }] }
          ],
          personality: 'concise'
        })
      });
      const data = await response.json();
      if (data.reply) {
        setAiTranscription(data.reply);
        setDetections(prev => [data.reply, ...prev].slice(0, 10));
        setIntensity(Math.min(100, intensity + 15));
      }
      setStatus('BossLive: Active Surveillance');
    } catch (error) {
      console.error("Surveillance Error:", error);
      setStatus('Analysis Failed');
    }
  };

  const stopCall = () => {
    setIsCalling(false);
    setStatus('Surveillance Offline');
    setAiTranscription('');
    setIntensity(0);
  };

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden font-mono">
      {/* Tactical HUD Header */}
      <div className="px-6 py-4 bg-red-950/20 backdrop-blur border-b border-red-500/20 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-10 h-10 bg-red-600/10 rounded flex items-center justify-center border border-red-500/30">
                <Eye size={20} className="text-red-500" />
             </div>
             {isCalling && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase">BossLive Live-Vision</h3>
            <div className="flex items-center gap-2">
               <span className={cn(
                 "text-[8px] font-black uppercase tracking-widest",
                 isCalling ? "text-red-400" : "text-stone-600"
               )}>
                 {status}
               </span>
               {isCalling && <span className="text-[8px] text-red-500/50">| FPS: 30 | LATENCY: 120ms</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-bold">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-stone-500 uppercase">Surveillance Level</span>
              <div className="w-32 h-1 bg-stone-900 mt-1 overflow-hidden">
                 <motion.div 
                   animate={{ width: `${intensity}%` }}
                   className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                 />
              </div>
           </div>
           <Shield className="text-red-500/30" size={18} />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {/* Main Surveillance Feed */}
        <div className="flex-1 relative bg-stone-950 overflow-hidden">
           <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={cn(
                "w-full h-full object-cover transition-all duration-1000",
                !isCalling ? "grayscale blur-2xl opacity-10" : "grayscale opacity-80 contrast-125 brightness-75 scale-105"
              )}
           />
           
           {/* HUD Overlays */}
           <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between border-[20px] border-transparent">
              <div className="flex justify-between items-start opacity-50">
                 <div className="w-12 h-12 border-t-2 border-l-2 border-red-500" />
                 <div className="w-12 h-12 border-t-2 border-r-2 border-red-500" />
              </div>
              
              {isCalling && (
                <div className="flex flex-col items-center justify-center flex-1">
                   {/* Centered Scanning Reticle */}
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                     className="w-48 h-48 border border-red-500/20 rounded-full flex items-center justify-center relative"
                   >
                      <div className="w-1 h-20 bg-red-500/40 blur-[2px]" />
                      <AnimatePresence>
                         {detections.length > 0 && (
                           <motion.div
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             className="absolute inset-0"
                           >
                              <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-red-500 animate-pulse" />
                              <div className="absolute bottom-10 right-10 w-4 h-4 border-b border-r border-red-500 animate-pulse" />
                              <div className="absolute top-1/2 left-0 w-3 h-px bg-red-500/50" />
                              <div className="absolute top-1/2 right-0 w-3 h-px bg-red-500/50" />
                           </motion.div>
                         )}
                      </AnimatePresence>
                   </motion.div>
                   
                   <motion.div 
                      animate={{ 
                        x: [0, 20, -20, 0],
                        y: [0, -10, 10, 0],
                        width: [120, 140, 120]
                      }}
                      transition={{ repeat: Infinity, duration: 5 }}
                      className="absolute top-1/3 left-1/3 border border-red-500/40 p-1"
                   >
                      <div className="w-full h-full border border-red-500/20 relative">
                         <div className="absolute -top-1 -left-1 text-[6px] text-red-500 font-bold bg-black px-1 uppercase tracking-tighter">OBJ_TRK_01</div>
                      </div>
                   </motion.div>
                </div>
              )}

              <div className="flex justify-between items-end opacity-50">
                 <div className="w-12 h-12 border-b-2 border-l-2 border-red-500" />
                 <div className="w-12 h-12 border-b-2 border-r-2 border-red-500" />
              </div>
           </div>

          <AnimatePresence>
            {aiTranscription && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-12 left-12 max-w-sm bg-black/60 backdrop-blur-xl border-l-4 border-red-600 p-6 shadow-2xl space-y-4"
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-1 bg-red-500 animate-ping" />
                       <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Analysis</span>
                    </div>
                 </div>
                 <p className="text-white text-xs leading-relaxed font-bold tracking-tight">"{aiTranscription}"</p>
                 <div className="flex gap-2 border-t border-white/5 pt-3">
                    <input 
                      placeholder="Surveillance Prompt..."
                      className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-[10px] text-white outline-none focus:border-red-500 transition-all font-bold"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSurveillanceAction((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

           {!isCalling && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startBossLive}
                  className="px-12 py-6 bg-red-600 text-white rounded font-black tracking-[0.4em] uppercase text-xl shadow-[0_0_50px_rgba(220,38,38,0.4)]"
                >
                   Initiate Vision
                </motion.button>
             </div>
           )}
        </div>

        {/* Tactical Info Panel (Right) */}
        <div className="md:w-80 bg-stone-950 border-l border-red-500/10 flex flex-col">
           <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Telemetry Log</span>
              <Target size={14} className="text-red-500/50" />
           </div>

           <div className="flex-1 p-6 space-y-4 overflow-y-auto customized-scrollbar-dark">
              {detections.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className="flex gap-3 text-[11px]"
                >
                   <span className="text-red-950 font-bold">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                   <p className="text-stone-400 font-medium leading-relaxed">{log}</p>
                </motion.div>
              ))}
              {detections.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 pt-12">
                   <AlertTriangle className="text-stone-500" size={32} />
                   <p className="text-[10px] font-black uppercase text-center tracking-widest">Waiting for Signal...</p>
                </div>
              )}
           </div>

           <div className="p-8 bg-zinc-900/50 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                 <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={cn(
                      "py-3 border flex items-center justify-center rounded transition-all",
                      isMuted ? "bg-red-500/10 border-red-500 text-red-500" : "bg-black border-stone-800 text-stone-500 hover:text-white"
                    )}
                 >
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                 </button>
                 <button
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className={cn(
                      "py-3 border flex items-center justify-center rounded transition-all",
                      isVideoMuted ? "bg-red-500/10 border-red-500 text-red-500" : "bg-black border-stone-800 text-stone-500 hover:text-white"
                    )}
                 >
                    {isVideoMuted ? <VideoOff size={16} /> : <Video size={16} />}
                 </button>
              </div>

              {isCalling && (
                <button
                  onClick={stopCall}
                  className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all border border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                   Sever Connection
                </button>
              )}

              <div className="pt-4 flex items-center justify-center gap-4 text-stone-800">
                  <Volume2 size={12} />
                  <div className="flex-1 h-px bg-stone-900" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">AkinAI BossLive Suite</span>
              </div>
           </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" width="640" height="480" />
    </div>
  );
};
