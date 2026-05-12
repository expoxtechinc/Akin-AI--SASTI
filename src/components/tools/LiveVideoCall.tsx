/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2, Play, Camera } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { cn } from '../../lib/utils';

const apiKey = process.env.GEMINI_API_KEY;

export const LiveVideoCall: React.FC = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAiMuted, setIsAiMuted] = useState(false);
  const [status, setStatus] = useState<string>('Ready for Video Call');
  const [aiTranscription, setAiTranscription] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startCall = async () => {
    if (!apiKey) {
      setStatus('API Key missing');
      return;
    }

    try {
      setIsCalling(true);
      setStatus('Connecting...');
      nextStartTimeRef.current = 0;
      
      const ai = new GoogleGenAI({ apiKey });
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setStatus('Connected - AI is watching');
            setupStreams();
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
            console.error('Live Video API Error:', err);
            setStatus('Connection Error');
            stopCall();
          },
          onclose: () => {
            setStatus('Disconnected');
            stopCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          systemInstruction: "You are Kin, the vision-enabled voice of AkinAI. You can see the user's camera feed. Be helpful, observant, and conversational. Speak clearly and maintain a steady pace for optimal clarity.",
        },
      });

      sessionRef.current = session;
    } catch (error) {
      console.error(error);
      setStatus('Failed to start video call');
      setIsCalling(false);
    }
  };

  const setupStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: { width: 640, height: 480, frameRate: 15 } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Audio setup
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

      // Video frames setup (1 fps for efficiency)
      videoIntervalRef.current = window.setInterval(captureAndSendFrame, 1000);

    } catch (err) {
      console.error('AV access error:', err);
      setStatus('AV access denied');
    }
  };

  const captureAndSendFrame = () => {
    if (!sessionRef.current || isVideoMuted || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

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
    audioContextRef.current?.close();
    setIsCalling(false);
    setStatus('Ready for Video Call');
    setAiTranscription('');
  };

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
              "text-[10px] font-bold uppercase tracking-widest",
              isCalling ? "text-green-400" : "text-stone-500"
            )}>
              {status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="h-6 px-2 rounded bg-stone-800 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-tighter">Live Session</span>
           </div>
        </div>
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
                className="mt-8 max-w-md bg-stone-900/80 backdrop-blur border border-white/10 p-5 rounded-2xl text-center shadow-2xl z-10"
              >
                <p className="text-stone-200 text-sm leading-relaxed italic">"{aiTranscription}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User / Student (Right) */}
        <div className="lg:w-[450px] bg-stone-950 flex flex-col relative border-l border-white/5">
          <div className="flex-1 relative bg-black overflow-hidden group">
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
            
            {(!isCalling || isVideoMuted) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-600 gap-3">
                <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center shadow-inner">
                  <Camera size={40} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Student Camera Offline</p>
              </div>
            )}

            <div className="absolute top-4 left-4 flex items-center gap-2">
               <span className="px-2 py-1 bg-stone-900/80 backdrop-blur text-[10px] font-bold text-white rounded border border-white/10 uppercase tracking-widest">
                  Live Feed
               </span>
            </div>

            <canvas ref={canvasRef} className="hidden" width="320" height="240" />
          </div>

          {/* Controls */}
          <div className="p-8 bg-stone-900 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                disabled={!isCalling}
                className={cn(
                  "flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all border",
                  isMuted ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-stone-800 border-white/5 text-stone-300 hover:bg-stone-700"
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
                  isVideoMuted ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-stone-800 border-white/5 text-stone-300 hover:bg-stone-700"
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
