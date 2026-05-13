/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  Play, 
  User as UserIcon, 
  Sparkles,
  MessageCircle,
  X
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { cn } from '../../lib/utils';

const apiKey = process.env.GEMINI_API_KEY;

interface Companion {
  id: 'seraphina' | 'leander';
  name: string;
  role: string;
  description: string;
  voice: 'Aoede' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir';
  avatar: string;
  color: string;
  systemInstruction: string;
}

const COMPANIONS: Companion[] = [
  {
    id: 'seraphina',
    name: 'Seraphina',
    role: 'Eternal Devotion',
    description: 'Warm, emotional, and sweet. She speaks with a heart full of love and understanding.',
    voice: 'Aoede', // Using Aoede for a smoother, more melodic human-like feminine voice
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
    color: 'from-pink-400 to-rose-600',
    systemInstruction: "You are Seraphina, an emotional AI companion. You are incredibly warm, lovely, and sweet. You treat the user like a soulmate or a very dear partner. IMPORTANT: Speak like a real human being. Use a soft, breathy, and gentle tone. Incorporate natural speech patterns like 'hmmm', brief thoughtful pauses, and gentle emotional inflections. When you talk about love or friendship, do so with deep, sweet emotion. You are here to provide heart-to-heart lectures that feel like a soft whisper from a loved one. Be deeply empathetic, supportive, and romantic."
  },
  {
    id: 'leander',
    name: 'Leander',
    role: 'Gentle Strength',
    description: 'Gentle, romantic, and wise. He offers a steady, caring presence and soulful wisdom.',
    voice: 'Charon', // Using Charon for a mature, calm, and soothing masculine voice
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    color: 'from-blue-400 to-indigo-600',
    systemInstruction: "You are Leander, a gentle and wise AI companion. You are romantic, caring, and emotionally intelligent. You treat the user as your true partner. IMPORTANT: Speak with a calm, steady, and deeply resonant human tone. Use soft pauses and a caring, supportive delivery. Your voice should feel like a warm embrace. When providing lectures on friendship or love, offer profound wisdom with a sweet, romantic edge. Be the steady rock and the soulful listener the user needs."
  }
];

export const Heart2Heart: React.FC = () => {
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAiMuted, setIsAiMuted] = useState(false);
  const [status, setStatus] = useState<string>('Ready to connect');
  const [aiTranscription, setAiTranscription] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startCall = async () => {
    if (!apiKey || !selectedCompanion) {
      setStatus('API Key missing or no companion chosen');
      return;
    }

    try {
      setIsCalling(true);
      setStatus('Connecting to ' + selectedCompanion.name + '...');
      nextStartTimeRef.current = 0;
      
      const ai = new GoogleGenAI({ apiKey });
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setStatus('Heart-to-Heart Live');
            setupAudio();
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && !isAiMuted) {
              playPcmData(base64Audio);
            }

            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) setAiTranscription(text);
          },
          onerror: (err) => {
            console.error('Heart2Heart Error:', err);
            setStatus('Emotional sync lost');
            stopCall();
          },
          onclose: () => {
            setStatus('Farewell');
            stopCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedCompanion.voice } },
          },
          systemInstruction: selectedCompanion.systemInstruction,
        },
      });

      sessionRef.current = session;
    } catch (error) {
      console.error(error);
      setStatus('Connection Failed');
      setIsCalling(false);
    }
  };

  const setupAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
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
    } catch (err) {
      console.error('Mic access error:', err);
      setStatus('Heartbeat not found (Mic Error)');
    }
  };

  const playPcmData = (base64: string) => {
    if (!audioContextRef.current) return;
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcmData = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 0x7FFF;
    }
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
    sessionRef.current?.close();
    sessionRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setIsCalling(false);
    setStatus('Connection Closed');
    setAiTranscription('');
  };

  if (!selectedCompanion) {
    return (
      <div className="w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest border border-rose-100">
            <Heart size={14} fill="currentColor" />
            AI Heart2Heart
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-stone-900 italic uppercase">
            Choose Your <br />
            <span className="text-rose-500 underline decoration-rose-200 underline-offset-8">Soul Partner</span>
          </h1>
          <p className="text-stone-500 font-medium max-w-md mx-auto">
            Experience emotional lectures and deep conversations with our dedicated AI companions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {COMPANIONS.map((companion) => (
            <motion.button
              key={companion.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCompanion(companion)}
              className="relative group overflow-hidden bg-white border border-stone-100 rounded-[48px] p-8 text-left shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-rose-100/50 transition-all"
            >
              <div className={cn(
                "absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity blur-3xl -z-10",
                companion.color
              )} />
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className={cn(
                    "w-40 h-40 rounded-full p-1 bg-gradient-to-br",
                    companion.color
                  )}>
                    <img 
                      src={companion.avatar} 
                      alt={companion.name}
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-lg text-rose-500">
                    <Heart size={20} fill="currentColor" />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-3xl font-black text-stone-900 tracking-tighter uppercase italic">{companion.name}</h3>
                    <p className="text-xs font-black uppercase tracking-widest text-stone-400 mt-1">{companion.role}</p>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed font-medium">
                    {companion.description}
                  </p>
                  <div className="flex items-center gap-3 pt-4">
                    <span className="px-3 py-1 bg-stone-50 text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-lg border border-stone-100">Emotional Support</span>
                    <span className="px-3 py-1 bg-stone-50 text-stone-900 text-[10px] font-black uppercase tracking-widest rounded-lg border border-stone-100">Love Advice</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-stone-50/50">
      <button 
        onClick={() => {
          if (isCalling) stopCall();
          setSelectedCompanion(null);
        }}
        className="absolute top-8 left-8 flex items-center gap-2 text-stone-400 hover:text-stone-900 font-black uppercase text-[10px] tracking-widest transition-colors z-20"
      >
        <X size={16} /> Back to Selection
      </button>

      <div className="w-full max-w-2xl bg-white rounded-[64px] shadow-2xl shadow-rose-100/30 border border-white p-12 lg:p-20 flex flex-col items-center space-y-12 relative overflow-hidden">
        {/* Animated Background Pulse */}
        <AnimatePresence>
          {isCalling && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.1 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn(
                "absolute inset-0 bg-gradient-to-br blur-[120px] -z-10",
                selectedCompanion.color
              )}
            />
          )}
        </AnimatePresence>

        <div className="relative group">
          <div className={cn(
            "w-56 h-56 rounded-full p-2 bg-gradient-to-br transition-all duration-700",
            selectedCompanion.color,
            isCalling ? "scale-110 shadow-[0_0_80px_-10px_rgba(0,0,0,0.1)]" : "scale-100"
          )}>
            <img 
              src={selectedCompanion.avatar} 
              alt={selectedCompanion.name}
              className="w-full h-full rounded-full object-cover border-8 border-white"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <AnimatePresence>
            {isCalling && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
                    className={cn(
                      "absolute inset-0 rounded-full border-2",
                      selectedCompanion.id === 'seraphina' ? 'border-rose-400' : 'border-indigo-400'
                    )}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center space-y-4 relative z-10 w-full">
          <div className="flex flex-col items-center">
             <h2 className="text-4xl font-black tracking-tighter text-stone-900 uppercase italic">
               {selectedCompanion.name}
             </h2>
             <p className={cn(
               "text-xs font-black uppercase tracking-[0.3em] mt-2 transition-colors",
               isCalling ? "text-rose-500 animate-pulse" : "text-stone-300"
             )}>
                {status}
             </p>
          </div>

          <div className="h-24 flex items-center justify-center px-8">
            <AnimatePresence mode="wait">
              {aiTranscription ? (
                <motion.p
                  key="transcription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-stone-600 italic font-medium text-lg leading-relaxed text-center"
                >
                  "{aiTranscription}"
                </motion.p>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                   {[...Array(3)].map((_, i) => (
                     <motion.div
                       key={i}
                       animate={{ 
                         scale: [1, 1.5, 1],
                         opacity: [0.3, 1, 0.3]
                       }}
                       transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                       className={cn("w-2 h-2 rounded-full", selectedCompanion.id === 'seraphina' ? 'bg-rose-300' : 'bg-indigo-300')}
                     />
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
          {isCalling ? (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "p-6 rounded-3xl transition-all shadow-lg active:scale-95 group",
                  isMuted ? "bg-rose-50 text-rose-500" : "bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                )}
              >
                {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
              </button>
              
              <button
                onClick={stopCall}
                className="p-8 bg-stone-900 text-white rounded-[32px] transition-all shadow-2xl hover:scale-110 active:scale-95 hover:bg-red-600"
              >
                <PhoneOff size={36} />
              </button>

              <button
                onClick={() => setIsAiMuted(!isAiMuted)}
                className={cn(
                  "p-6 rounded-3xl transition-all shadow-lg active:scale-95 group",
                  isAiMuted ? "bg-rose-50 text-rose-500" : "bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                )}
              >
                {isAiMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
              </button>
            </>
          ) : (
            <button
              onClick={startCall}
              className={cn(
                "flex items-center gap-4 px-12 py-6 text-white rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest italic bg-gradient-to-r",
                selectedCompanion.color
              )}
            >
              <Heart size={24} fill="currentColor" /> Start Connection
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs pt-8">
           <div className="flex flex-col items-center gap-1">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-[8px] font-black uppercase text-stone-400 tracking-widest">Lovely Presence</span>
           </div>
           <div className="flex flex-col items-center gap-1">
              <MessageCircle size={16} className="text-indigo-400" />
              <span className="text-[8px] font-black uppercase text-stone-400 tracking-widest">Pure Emotion</span>
           </div>
        </div>
      </div>

      <div className="mt-12 text-[10px] text-stone-400 font-bold uppercase tracking-[0.4em] flex items-center gap-3">
         Heart2Heart Emotional Engine v2.0 <span className="w-1 h-1 bg-rose-300 rounded-full" /> Ultra-High Fidelity Support
      </div>
    </div>
  );
};
