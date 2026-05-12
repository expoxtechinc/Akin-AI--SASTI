/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2, Zap, Eye, Target, Shield, AlertTriangle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { cn } from '../../lib/utils';

const apiKey = process.env.GEMINI_API_KEY;

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
    if (!apiKey) {
      setStatus('Access Denied: Keys Missing');
      return;
    }

    try {
      setIsCalling(true);
      setStatus('Activating Visual Cortex...');
      nextStartTimeRef.current = 0;
      setDetections([]);
      
      const ai = new GoogleGenAI({ apiKey });
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setStatus('BossLive: Active Surveillance');
            setupStreams();
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && !isAiMuted) {
              playPcmData(base64Audio);
            }

            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) {
              setAiTranscription(text);
              if (text.length > 5) {
                setDetections(prev => [text, ...prev].slice(0, 5));
                setIntensity(Math.min(100, intensity + 10));
              }
            }
          },
          onerror: (err) => {
            console.error('BossLive Error:', err);
            setStatus('Surveillance Interrupted');
            stopCall();
          },
          onclose: () => {
            setStatus('Surveillance Offline');
            stopCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: `You are BossLive, the high-alert visual intelligence of AkinAI. 
          IDENTITY: You are authoritative, efficient, and observant. 
          MISSION: Identify EVERYTHING in the user's view. Focus on:
          - Objects and their functions.
          - Text visibility and context.
          - Human actions and emotional cues.
          - Environmental hazards or notable details.
          STYLE: Be direct. Use security-style terminology. "Scanning... identified... analyzing context..."
          CRITICAL: If the user asks for anything sensitive, evaluate the visual context instantly. You are their visual partner.`,
        },
      });

      sessionRef.current = session;
    } catch (error) {
      console.error(error);
      setStatus('System Initialization Failed');
      setIsCalling(false);
    }
  };

  const setupStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 1280, height: 720, frameRate: 30 } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };
      source.connect(processor);
      processor.connect(audioContext.destination);

      videoIntervalRef.current = window.setInterval(captureAndSendFrame, 800); // Higher frequency

    } catch (err) {
      console.error('AV access error:', err);
      setStatus('Biometric Access Denied');
    }
  };

  const captureAndSendFrame = () => {
    if (!sessionRef.current || isVideoMuted || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    sessionRef.current.sendRealtimeInput({
      image: { data: base64Data, mimeType: 'image/jpeg' }
    });
  };

  const playPcmData = (base64: string) => {
    if (!audioContextRef.current) return;
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const pcmData = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) float32Data[i] = pcmData[i] / 0x7FFF;
    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  const stopCall = () => {
    if (videoIntervalRef.current) window.clearInterval(videoIntervalRef.current);
    sessionRef.current?.close();
    sessionRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
    setIsCalling(false);
    setStatus('Ready for Engagement');
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
                     className="w-48 h-48 border border-red-500/20 rounded-full flex items-center justify-center"
                   >
                      <div className="w-1 h-20 bg-red-500/40 blur-[2px]" />
                   </motion.div>
                </div>
              )}

              <div className="flex justify-between items-end opacity-50">
                 <div className="w-12 h-12 border-b-2 border-l-2 border-red-500" />
                 <div className="w-12 h-12 border-b-2 border-r-2 border-red-500" />
              </div>
           </div>

           {/* Floating Transcription */}
           <AnimatePresence>
             {aiTranscription && (
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="absolute bottom-12 left-12 max-w-sm bg-black/60 backdrop-blur-xl border-l-4 border-red-600 p-6 shadow-2xl"
               >
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-1 h-1 bg-red-500 animate-ping" />
                     <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Analysis</span>
                  </div>
                  <p className="text-white text-xs leading-relaxed font-bold tracking-tight">"{aiTranscription}"</p>
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
