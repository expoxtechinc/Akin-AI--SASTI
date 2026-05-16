/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brush, Eraser, Download, Share2, Layers, Zap, Info, Wand2, Type, Video, PhoneOff, Mic, MicOff } from 'lucide-react';
import { ToolInterface } from './ToolInterface';
import { TOOLS } from '../../constants';
import { cn } from '../../lib/utils';
import { GoogleGenAI, Modality } from "@google/genai";
import { AKIN_TOOLS, handleLiveToolCall } from '../../services/liveTools';

const illustratorTool = TOOLS.find(t => t.id === 'illustrator')!;
const apiKey = process.env.GEMINI_API_KEY;

export const IllustrationAI: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIllustration, setCurrentIllustration] = useState<string | null>(null);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  const [mode, setMode] = useState<'canvas' | 'live'>('canvas');
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [aiTranscription, setAiTranscription] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startLiveVision = async () => {
    if (!apiKey) return;
    try {
      setMode('live');
      setIsCalling(true);
      setStatus('Initializing Visual Design Engine...');
      const ai = new GoogleGenAI({ apiKey });
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
             setStatus('Live Vision ACTIVE');
             setupStreams();
          },
          onmessage: async (message) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) playPcmData(part.inlineData.data);
                if (part.text) setAiTranscription(part.text);
                
                if (part.functionCall) {
                  const result = await handleLiveToolCall(part.functionCall);
                  session.sendToolResponse({
                    functionResponses: [{
                      name: part.functionCall.name,
                      response: result,
                      id: part.functionCall.id
                    }]
                  });
                }
              }
            }
          },
          onclose: () => stopLiveVision(),
          onerror: () => stopLiveVision()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: AKIN_TOOLS,
          systemInstruction: "You are the Creative Director at AkinIllustrator. Help users with their visual designs by analyzing what they show you through their camera. Provide expert artistic advice, suggest colors, and brainstorm compositions."
        }
      });
      sessionRef.current = session;
    } catch (err) {
      console.error(err);
      setMode('canvas');
      setIsCalling(false);
    }
  };

  const setupStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      processor.onaudioprocess = (e) => {
        if (!sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({ audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } });
      };
      source.connect(processor);
      processor.connect(audioContext.destination);
      videoIntervalRef.current = window.setInterval(captureFrame, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const captureFrame = () => {
    if (!sessionRef.current || !videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
    sessionRef.current.sendRealtimeInput({ video: { data: base64Data, mimeType: 'image/jpeg' } });
  };

  const playPcmData = (base64: string) => {
    if (!audioContextRef.current) return;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pcm = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) float32[i] = pcm[i] / 0x7FFF;
    const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime;
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  const stopLiveVision = () => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    sessionRef.current?.close();
    sessionRef.current = null;
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    setMode('canvas');
    setIsCalling(false);
    setAiTranscription('');
  };
  
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
            <button 
               onClick={startLiveVision}
               className="px-4 py-2 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:brightness-110 transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
               <Video size={14} /> Live Vision
            </button>
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
                    {mode === 'live' ? (
                      <motion.div 
                        key="live"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full relative"
                      >
                         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60" />
                         <canvas ref={canvasRef} className="hidden" width="320" height="240" />

                         <div className="absolute inset-0 z-10 flex flex-col p-12 justify-between">
                            <div className="flex justify-between items-start">
                               <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
                                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Vision Mode: ACTIVE</span>
                                     <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">{status}</span>
                                  </div>
                               </div>
                               <button onClick={stopLiveVision} className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/20 hover:scale-110 active:scale-95 transition-all">
                                  <PhoneOff size={24} />
                                </button>
                            </div>

                            <AnimatePresence>
                               {aiTranscription && (
                                 <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="self-center max-w-2xl bg-black/90 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-3xl text-center"
                                 >
                                    <p className="text-white text-lg font-bold leading-relaxed tracking-tight">"{aiTranscription}"</p>
                                 </motion.div>
                               )}
                            </AnimatePresence>

                            <div className="flex justify-center">
                               <div className="px-8 py-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] italic">
                                  Creative Director is analyzing your composition...
                                </div>
                            </div>
                         </div>
                      </motion.div>
                    ) : isGenerating ? (
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
