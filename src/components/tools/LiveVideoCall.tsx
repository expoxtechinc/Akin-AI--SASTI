/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2, Play, Camera, Zap, HeartPulse, Activity, Code, BookOpen } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { cn } from '../../lib/utils';
import { AKIN_TOOLS, handleLiveToolCall } from '../../services/liveTools';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

const IconMap: Record<string, any> = {
  HeartPulse,
  Activity,
  Code,
  Zap,
};

export const LiveVideoCall: React.FC = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAiMuted, setIsAiMuted] = useState(false);
  const [status, setStatus] = useState<string>('Select Subject to Begin');
  const [aiTranscription, setAiTranscription] = useState<string>('');
  const [subject, setSubject] = useState<string>('nursing');
  const [lectureNotes, setLectureNotes] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const subjects = [
    { id: 'nursing', name: 'Nursing & Ethics', icon: 'HeartPulse' },
    { id: 'medical', name: 'Anatomy & Med-Surg', icon: 'Activity' },
    { id: 'tech', name: 'Tech & Architecture', icon: 'Code' },
    { id: 'general', name: 'General Problem Solving', icon: 'Zap' },
  ];

  const startCall = async () => {
    setIsCalling(true);
    setStatus(`Live: ${subject.charAt(0).toUpperCase() + subject.slice(1)} Session`);
    setAiTranscription(`Welcome to your elite 1-on-1 session on ${subject}. I am your Virtual Instructor, Kin. How may I assist you today?`);
  };

  const handleLessonMessage = async (message: string) => {
    try {
      setStatus('Kin is formulating response...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: [
            { role: 'user', parts: [{ text: "Start Lesson" }] },
            { role: 'model', parts: [{ text: `Welcome to your elite 1-on-1 session on ${subject}. I am your Virtual Instructor, Kin. How may I assist you today?` }] }
          ],
          personality: 'tutor'
        })
      });
      const data = await response.json();
      if (data.reply) {
        setAiTranscription(data.reply);
        setLectureNotes(prev => [data.reply, ...prev].slice(0, 10));
      }
      setStatus(`Live: ${subject.charAt(0).toUpperCase() + subject.slice(1)} Session`);
    } catch (error) {
      console.error("Lesson Error:", error);
      setStatus('Session Error');
    }
  };

  const setupStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
    }
  };

  const playPcmData = () => {};

  const stopCall = () => {
    setIsCalling(false);
    setStatus('Ready for Video Call');
    setAiTranscription('');
    streamRef.current?.getTracks().forEach(track => track.stop());
  };

  useEffect(() => {
    if (isCalling) {
      setupStreams();
    }
  }, [isCalling]);

  return (
    <div className="flex flex-col h-full bg-stone-950 overflow-hidden">
      {/* Header / Info */}
      <div className="px-6 py-4 bg-stone-900/50 backdrop-blur border-b border-white/5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Video size={18} className="text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Kin AI Virtual Classroom</h3>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-widest transition-colors",
              isCalling ? "text-green-400" : "text-stone-500"
            )}>
              {status}
            </p>
          </div>
        </div>
        
        {!isCalling && (
          <div className="hidden md:flex items-center gap-2">
            {subjects.map((sub) => {
              const Icon = IconMap[sub.icon];
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubject(sub.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                    subject === sub.id 
                      ? "bg-white text-stone-900 border-white" 
                      : "bg-stone-800 text-stone-400 border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={12} />
                    {sub.name}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* AI Instructor (Left) */}
        <div className="flex-1 border-r border-white/5 relative bg-stone-950 flex flex-col items-center justify-center p-8">
          <div className="absolute top-4 left-6">
             <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">AI Instructor (Kin)</span>
          </div>

          <div className="relative">
            <AnimatePresence>
              {isCalling && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute inset-0 bg-stone-500/10 rounded-full blur-3xl animate-pulse" />
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.1, 0.3],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 4 + i, 
                        ease: "linear" 
                      }}
                      className="absolute inset-[-40px] border border-white/10 rounded-full"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-stone-900 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl">
              {isCalling ? (
                <div className="flex items-center gap-2">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: [12, 60, 12],
                        backgroundColor: ["#fafaf9", "#a8a29e", "#fafaf9"]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.6, 
                        delay: i * 0.1 
                      }}
                      className="w-1.5 lg:w-2 bg-stone-50 rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-stone-800 rounded-full mx-auto flex items-center justify-center">
                    <Zap size={32} className="text-stone-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {aiTranscription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-8 max-w-md bg-stone-900/80 backdrop-blur border border-white/10 p-5 rounded-2xl text-center shadow-2xl z-10 space-y-4"
              >
                <p className="text-stone-200 text-sm leading-relaxed italic">"{aiTranscription}"</p>
                <div className="flex gap-2">
                   <input 
                     placeholder="Respond to Kin..."
                     className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-white transition-all font-bold"
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         handleLessonMessage((e.target as HTMLInputElement).value);
                         (e.target as HTMLInputElement).value = '';
                       }
                     }}
                   />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Student View & Whiteboard (Right Side Column) */}
        <div className="lg:w-[450px] bg-stone-950 flex flex-col relative border-l border-white/5">
          {/* User Camera Section */}
          <div className="relative h-64 bg-black overflow-hidden group border-b border-white/5">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={cn(
                "w-full h-full object-cover transition-all duration-700",
                isVideoMuted || !isCalling ? "grayscale blur-xl opacity-20" : "grayscale-0 blur-0 opacity-100"
              )}
            />

            {/* Educational HUD Overlays */}
            {isCalling && !isVideoMuted && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-green-500/20 rounded-lg">
                  <div className="absolute -top-5 left-0 bg-green-500 text-white text-[8px] px-1 font-bold rounded">AI ANALYSIS: {subject.toUpperCase()}</div>
                </div>
                <motion.div 
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute bottom-10 right-10 flex flex-col items-end gap-1"
                >
                  <div className="w-16 h-1 bg-green-500/30 rounded-full" />
                  <div className="w-24 h-1 bg-green-500/30 rounded-full" />
                  <div className="w-20 h-1 bg-green-500/30 rounded-full" />
                </motion.div>
                <div className="absolute inset-0 border border-green-500/5 m-4" />
              </div>
            )}
            
            {(!isCalling || isVideoMuted) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-600 gap-3">
                <div className="w-14 h-14 bg-stone-900 rounded-full flex items-center justify-center shadow-inner">
                  <Camera size={24} />
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Student View</p>
              </div>
            )}

            <div className="absolute top-4 left-4 flex items-center gap-2">
               <span className="px-2 py-1 bg-stone-900/80 backdrop-blur text-[10px] font-bold text-white rounded border border-white/10 uppercase tracking-widest">
                  Live Feed
               </span>
            </div>

            <canvas ref={canvasRef} className="hidden" width="320" height="240" />
          </div>

          {/* Virtual Whiteboard / Lecture Notes */}
          <div className="flex-1 overflow-hidden flex flex-col bg-stone-900 shadow-inner">
             <div className="p-4 border-b border-white/5 flex items-center gap-2 text-stone-400">
               <BookOpen size={14} />
               <h4 className="text-[10px] font-bold uppercase tracking-widest">Digital Whiteboard</h4>
             </div>
             
             <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
               {lectureNotes.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-stone-600 space-y-2 opacity-50">
                    <BookOpen size={32} strokeWidth={1} />
                    <p className="text-[10px] uppercase font-bold tracking-widest">Notes will appear here...</p>
                 </div>
               ) : (
                 <AnimatePresence mode="popLayout">
                   {lectureNotes.map((note, i) => (
                     <motion.div
                       key={i}
                       layout
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       className="p-4 bg-stone-800/50 border-l-2 border-green-500/30 rounded-r-xl"
                     >
                        <p className="text-xs text-stone-300 leading-relaxed">{note}</p>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               )}
             </div>
          </div>

          {/* Call Controls */}
          <div className="p-8 bg-stone-900 border-t border-white/5 space-y-6">
            {!isCalling && (
                <div className="space-y-4 mb-2">
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest text-center">Ready to begin lesson?</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                disabled={!isCalling}
                className={cn(
                  "flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all border",
                  isMuted ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-stone-800 border-white/5 text-stone-300 hover:bg-stone-700 disabled:opacity-50"
                )}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                <span className="text-[10px] font-bold uppercase tracking-widest">Mute</span>
              </button>

              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                disabled={!isCalling}
                className={cn(
                  "flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all border",
                  isVideoMuted ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-stone-800 border-white/5 text-stone-300 hover:bg-stone-700 disabled:opacity-50"
                )}
              >
                {isVideoMuted ? <VideoOff size={18} /> : <Video size={18} />}
                <span className="text-[10px] font-bold uppercase tracking-widest">Camera</span>
              </button>
            </div>

            {isCalling ? (
              <button
                onClick={stopCall}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 text-stone-50 rounded-xl font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all"
              >
                <PhoneOff size={20} /> End Session
              </button>
            ) : (
              <button
                onClick={startCall}
                className="w-full flex items-center justify-center gap-3 py-5 bg-stone-50 text-stone-900 rounded-xl font-bold shadow-xl hover:bg-white active:scale-95 transition-all text-lg"
              >
                <Play size={24} fill="currentColor" /> Start Lesson
              </button>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button
                  onClick={() => setIsAiMuted(!isAiMuted)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isAiMuted ? "text-red-500" : "text-stone-500 hover:text-white"
                  )}
                >
                  {isAiMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <span className="text-[9px] text-stone-600 font-bold uppercase tracking-[0.2em]">
                   AkinAI Educational Engine
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
