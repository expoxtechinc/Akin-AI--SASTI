/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, BookOpen, GraduationCap, Sparkles, Upload, History, Brain, Trophy, ChevronRight, Search, Microscope, Calculator, Video, PhoneOff } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { ToolInterface } from './ToolInterface';
import { TOOLS } from '../../constants';
import { cn } from '../../lib/utils';
import { AKIN_TOOLS, handleLiveToolCall } from '../../services/liveTools';

const apiKey = process.env.GEMINI_API_KEY;
const scholarTool = TOOLS.find(t => t.id === 'scholar-cam')!;

export const ScholarCam: React.FC = () => {
  const [mode, setMode] = useState<'camera' | 'upload' | 'chat' | 'live'>('chat');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [status, setStatus] = useState('Ready to Learn');
  const [aiTranscription, setAiTranscription] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startLiveStudy = async () => {
    if (!apiKey) return;
    try {
      setMode('live');
      setStatus('Connecting to Tutor...');
      const ai = new GoogleGenAI({ apiKey });
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setStatus('Live Session Active');
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
          onclose: () => stopLiveStudy(),
          onerror: () => stopLiveStudy()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: AKIN_TOOLS,
          systemInstruction: "You are a professional tutor at AkinAI's ScholarCam. Help students understand complex concepts visualized through their camera. Be encouraging, clear, and academic."
        }
      });
      sessionRef.current = session;
    } catch (err) {
      console.error(err);
      setMode('chat');
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

  const stopLiveStudy = () => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    sessionRef.current?.close();
    sessionRef.current = null;
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    setMode('chat');
    setAiTranscription('');
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target?.result as string);
        setMode('chat');
        setIsAnalyzing(true);
        // Analytics/Processing simulation would go here
        setTimeout(() => setIsAnalyzing(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Education Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between z-20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
               <GraduationCap size={24} />
            </div>
            <div>
               <h1 className="text-lg font-black text-stone-900 tracking-tight uppercase italic">ScholarCam</h1>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">Global Tutor v4.0</span>
                  <span className="text-[10px] text-stone-400 font-bold">• 200+ Subjects</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><History size={20} /></button>
            <button className="px-4 py-2 bg-stone-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest flex items-center gap-2">
               <Trophy size={14} className="text-yellow-400" /> Leaderboard
            </button>
         </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white">
         <AnimatePresence mode="wait">
            {mode === 'chat' ? (
              <motion.div 
                 key="chat"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="h-full relative"
              >
                 <ToolInterface tool={scholarTool} />
                 
                 {/* Snap Overlay Button */}
                 <div className="absolute top-2 right-4 flex gap-2">
                    <button 
                       onClick={startLiveStudy}
                       className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-rose-500/20 hover:scale-105 transition-all"
                    >
                       <Video size={14} /> Live Study
                    </button>
                    <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all"
                    >
                       <Camera size={14} /> Snap & Solve
                    </button>
                 </div>
                 
                 {isAnalyzing && (
                   <div className="absolute inset-x-0 top-0 h-1 bg-stone-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-full bg-indigo-600"
                        transition={{ duration: 3 }}
                      />
                   </div>
                 )}
              </motion.div>
            ) : mode === 'live' ? (
              <motion.div 
                 key="live"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="h-full bg-stone-900 relative flex flex-col"
              >
                 <div className="absolute inset-0">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60" />
                    <canvas ref={canvasRef} className="hidden" width="320" height="240" />
                 </div>

                 <div className="relative z-10 flex-1 flex flex-col p-8 justify-between">
                    <div className="flex justify-between items-start">
                       <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Tutor: {status}</span>
                       </div>
                       <button onClick={stopLiveStudy} className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-all">
                          <PhoneOff size={24} />
                       </button>
                    </div>

                    <AnimatePresence>
                       {aiTranscription && (
                         <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="self-center max-w-xl bg-black/80 backdrop-blur-xl border-l-4 border-indigo-500 p-6 rounded-r-2xl shadow-2xl"
                         >
                            <p className="text-white text-sm font-bold leading-relaxed tracking-tight italic">"{aiTranscription}"</p>
                         </motion.div>
                       )}
                    </AnimatePresence>

                    <div className="flex justify-center gap-4">
                       <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest italic">
                          AI is analyzing your coursework...
                       </div>
                    </div>
                 </div>
              </motion.div>
            ) : null}
         </AnimatePresence>

         <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleCapture} 
            className="hidden" 
            accept="image/*" 
            capture="environment"
         />
      </div>

      {/* Subject Quick Bar */}
      <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 overflow-x-auto customized-scrollbar">
         <div className="flex items-center gap-4 min-w-max">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mr-2">Specialized Curricula:</label>
            {[
              { id: 'nursing', label: 'Global Nursing', icon: BookOpen },
              { id: 'math', label: 'Advanced Calc', icon: Calculator },
              { id: 'science', label: 'Bio-Microscope', icon: Microscope },
              { id: 'engineering', label: 'Neural Logic', icon: Brain },
            ].map(subject => (
              <button 
                key={subject.id}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full text-[10px] font-bold text-stone-600 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
              >
                 <subject.icon size={12} />
                 {subject.label}
              </button>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors">
               Explore 1,200+ Courses <ChevronRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};
