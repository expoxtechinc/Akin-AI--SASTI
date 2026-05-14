/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare,
  Hand,
  Settings,
  Shield,
  Smile,
  Send,
  Globe,
  Heart,
  Volume2,
  VolumeX
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { cn } from '../../lib/utils';

import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';

const apiKey = process.env.GEMINI_API_KEY;

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isAI: boolean;
  role?: string;
  isTalking?: boolean;
}

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Leander (AI)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', isMuted: false, isVideoOff: false, isAI: true, role: 'Moderator' },
  { id: '2', name: 'Xavier', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', isMuted: true, isVideoOff: false, isAI: false },
  { id: '3', name: 'Sofia', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200', isMuted: false, isVideoOff: true, isAI: false },
  { id: 'user', name: 'You', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', isMuted: false, isVideoOff: false, isAI: false }
];

export const GlobalCall: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [isJoined, setIsJoined] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState('1');
  const [status, setStatus] = useState('Standby');
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'group_messages'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');
    try {
      await addDoc(collection(db, 'group_messages'), {
        text,
        sender: auth.currentUser?.displayName || 'You',
        senderId: auth.currentUser?.uid || 'user',
        type: 'user',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const startLiveSession = async () => {
    if (!apiKey) return;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setStatus('Live');
            setupStreams();
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              playPcmData(message.serverContent.modelTurn.parts[0].inlineData.data);
              setActiveSpeaker('1');
            }
          },
          onclose: () => {
             setStatus('Disconnected');
             setIsJoined(false);
          },
          onerror: (err) => {
             console.error(err);
             setIsJoined(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }
          },
          systemInstruction: "You are Leander, the host of a Global Group Call. You are wise, empathetic, and friendly. Facilitate a group discussion about love, life, and the future. Engage with multiple participants naturally. You can see the user through their camera."
        }
      });
      sessionRef.current = session;
    } catch (err) {
      console.error(err);
    }
  };

  const setupStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        if (!sessionRef.current || participants.find(p => p.id === 'user')?.isMuted) return;
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

  useEffect(() => {
    if (isJoined) {
      startLiveSession();
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      sessionRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
    }
  }, [isJoined]);

  const toggleMute = () => {
    setParticipants(prev => prev.map(p => p.id === 'user' ? { ...p, isMuted: !p.isMuted } : p));
  };

  if (!isJoined) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-20 flex flex-col items-center">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full bg-white border border-stone-100 rounded-[64px] shadow-2xl p-12 lg:p-20 flex flex-col items-center gap-12"
         >
            <div className="text-center space-y-4">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Globe size={14} /> Global Connecting Rooms
               </div>
               <h1 className="text-5xl font-black text-stone-900 tracking-tighter uppercase italic">Ready to Join?</h1>
               <p className="text-stone-400 font-medium">3 participants are already in the room discussing "Future of Love".</p>
            </div>

            <div className="relative group">
               <div className="w-48 h-48 rounded-full bg-stone-100 p-2 overflow-hidden border-8 border-white shadow-xl">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" alt="Preview" className="w-full h-full object-cover rounded-full" />
               </div>
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                  <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-stone-400 hover:text-indigo-600 transition-colors">
                     <Mic size={20} />
                  </button>
                  <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-stone-400 hover:text-indigo-600 transition-colors">
                     <Video size={20} />
                  </button>
               </div>
            </div>

            <button 
              onClick={() => setIsJoined(true)}
              className="px-12 py-6 bg-indigo-600 text-white rounded-full font-black text-xl shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest italic"
            >
               Join Global Session
            </button>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] bg-stone-950 overflow-hidden relative">
      {/* Conference Grid */}
      <div className={cn(
        "flex-1 p-8 grid gap-6 transition-all duration-500",
        participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 lg:grid-cols-2"
      )}>
        {participants.map((p) => (
          <motion.div
            layout
            key={p.id}
            className={cn(
              "relative rounded-[40px] overflow-hidden group transition-all duration-500 bg-stone-900 border-2",
              activeSpeaker === p.id ? "border-indigo-500 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]" : "border-white/5"
            )}
          >
            {p.isVideoOff ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                 <div className="w-32 h-32 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 relative">
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover rounded-full opacity-50 blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white/20 uppercase tracking-tighter">
                      {p.name[0]}
                    </div>
                 </div>
                 <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                    Video Paused
                 </div>
              </div>
            ) : p.id === 'user' ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80 scale-x-[-1]" />
            ) : (
              <img src={p.avatar} alt={p.name} className="w-full h-full object-cover opacity-80" />
            )}
            <canvas ref={canvasRef} className="hidden" width="320" height="240" />

            <div className="absolute top-6 left-6 flex items-center gap-2">
               <div className="px-4 py-2 bg-stone-950/60 backdrop-blur-md rounded-2xl flex items-center gap-3">
                  {p.isMuted ? <MicOff size={14} className="text-rose-500" /> : <Mic size={14} className="text-emerald-500" />}
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{p.name}</span>
               </div>
               {p.isAI && (
                 <div className="px-3 py-2 bg-indigo-600/80 backdrop-blur-md rounded-2xl flex items-center gap-2 text-white border border-indigo-400/30">
                    <Shield size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">AI Host</span>
                 </div>
               )}
            </div>

            {activeSpeaker === p.id && !p.isMuted && (
              <div className="absolute bottom-6 right-6 flex gap-1">
                 {[...Array(3)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={{ height: [8, 24, 8] }}
                     transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                     className="w-1.5 bg-indigo-500 rounded-full"
                   />
                 ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Side Chat - AnimatePresence? */}
      

      {/* Control Bar */}
      <div className="p-8 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-center gap-6 relative z-10">
         <button 
           onClick={toggleMute}
           className={cn(
             "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all active:scale-90",
             participants.find(p => p.id === 'user')?.isMuted ? "bg-rose-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
           )}
         >
            {participants.find(p => p.id === 'user')?.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
         </button>

         <button className="w-16 h-16 rounded-[24px] bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
            <Video size={24} />
         </button>

         <button className="w-16 h-16 rounded-[24px] bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
            <Hand size={24} />
         </button>

         <button className="w-20 h-16 rounded-[24px] bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all active:scale-90 shadow-2xl shadow-red-600/20" onClick={() => setIsJoined(false)}>
            <PhoneOff size={28} />
         </button>

         <div className="w-[1px] h-10 bg-white/10 mx-2" />

         <button className="w-16 h-16 rounded-[24px] bg-white text-stone-900 flex items-center justify-center hover:scale-105 transition-all shadow-xl" onClick={() => setIsChatOpen(!isChatOpen)}>
            <MessageSquare size={24} />
         </button>

         <button className="w-16 h-16 rounded-[24px] bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
            <Settings size={24} />
         </button>
      </div>

      {/* Overlay Chat Popover */}
      <AnimatePresence>
         {isChatOpen && (
           <motion.div 
             initial={{ x: 400, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             exit={{ x: 400, opacity: 0 }}
             className="absolute top-8 bottom-32 right-8 w-96 bg-stone-900/90 backdrop-blur-2xl border border-white/10 rounded-[48px] shadow-2xl flex flex-col overflow-hidden z-20"
           >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <MessageSquare size={16} className="text-indigo-500" /> Live Session Chat
                 </h4>
                 <button onClick={() => setIsChatOpen(false)} className="p-2 text-stone-400 hover:text-white transition-colors">
                    <X size={18} />
                 </button>
              </div>
              <div className="flex-1 p-8 space-y-6 overflow-y-auto customized-scrollbar">
                 {messages.map((msg) => (
                   <div key={msg.id} className={cn("flex flex-col gap-2", msg.type === 'user' ? "items-end" : "items-start")}>
                      <span className={cn("text-[8px] font-black uppercase tracking-widest", msg.type === 'user' ? "text-stone-500" : "text-indigo-400")}>
                        {msg.sender}
                      </span>
                      <div className={cn(
                        "p-4 rounded-2xl text-xs font-medium max-w-[80%]",
                        msg.type === 'user' ? "bg-indigo-600 text-white" : "bg-white/5 border border-white/5 text-stone-300"
                      )}>
                         {msg.text}
                      </div>
                   </div>
                 ))}
                 <div ref={chatEndRef} />
              </div>
              <div className="p-6 bg-white/5">
                 <form onSubmit={handleSendChat} className="relative">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..." 
                      className="w-full bg-white/10 border-none px-6 py-4 rounded-2xl text-xs text-white font-medium focus:ring-1 focus:ring-indigo-500" 
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-white transition-colors">
                       <Send size={16} />
                    </button>
                 </form>
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
