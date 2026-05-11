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
    <div className="flex flex-col lg:flex-row h-full">
      {/* Video Area */}
      <div className="flex-1 bg-stone-900 relative flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isVideoMuted || !isCalling ? "opacity-0" : "opacity-100"
          )}
        />
        
        {(!isCalling || isVideoMuted) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500 space-y-4">
            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center">
              <Camera size={48} />
            </div>
            <p className="text-sm font-medium uppercase tracking-widest">
              Camera {isVideoMuted ? 'is off' : 'is waiting'}
            </p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" width="320" height="240" />

        {/* AI Voice Indicator overlay */}
        {isCalling && (
          <div className="absolute top-6 right-6 px-4 py-2 bg-stone-900/50 backdrop-blur rounded-full flex items-center gap-2 border border-white/20">
            <div className="flex items-center gap-0.5">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                  className="w-1 bg-green-400 rounded-full"
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-stone-50 uppercase tracking-widest">Kin Live Vision</span>
          </div>
        )}
      </div>

      {/* Control Area */}
      <div className="w-full lg:w-96 bg-white border-l border-stone-200 flex flex-col p-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Vision Mode</h2>
          <p className={cn(
            "text-xs font-bold uppercase tracking-widest",
            isCalling ? "text-green-500 animate-pulse" : "text-stone-400"
          )}>
            {status}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {aiTranscription && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-stone-50 border border-stone-200 p-4 rounded-2xl shadow-sm"
              >
                <p className="text-sm text-stone-700 italic">"{aiTranscription}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isCalling}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl transition-all border",
              isMuted ? "bg-red-50 border-red-100 text-red-500" : "bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100"
            )}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            <span className="text-[10px] font-bold uppercase mt-2">Mic</span>
          </button>

          <button
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            disabled={!isCalling}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl transition-all border",
              isVideoMuted ? "bg-red-50 border-red-100 text-red-500" : "bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100"
            )}
          >
            {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
            <span className="text-[10px] font-bold uppercase mt-2">Camera</span>
          </button>
        </div>

        <div className="space-y-4">
          {isCalling ? (
            <button
              onClick={stopCall}
              className="w-full flex items-center justify-center gap-3 py-4 bg-red-500 text-stone-50 rounded-2xl font-bold transition-all shadow-lg hover:bg-red-600 active:scale-95"
            >
              <PhoneOff size={20} /> End Video Call
            </button>
          ) : (
            <button
              onClick={startCall}
              className="w-full flex items-center justify-center gap-3 py-4 bg-stone-900 text-stone-50 rounded-2xl font-bold transition-all shadow-xl hover:bg-stone-800 active:scale-95"
            >
              <Play size={20} /> Start Video Call
            </button>
          )}

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setIsAiMuted(!isAiMuted)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isAiMuted ? "text-red-500" : "text-stone-400 hover:text-stone-900"
              )}
            >
              {isAiMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              Live API v3.1 Multimodal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
