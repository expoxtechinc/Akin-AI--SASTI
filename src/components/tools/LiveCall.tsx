/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2, Play, Square } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { cn } from '../../lib/utils';
import { AKIN_TOOLS, handleLiveToolCall } from '../../services/liveTools';

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export const LiveCall: React.FC = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAiMuted, setIsAiMuted] = useState(false);
  const [status, setStatus] = useState<string>('Ready to call');
  const [transcription, setTranscription] = useState<string>('');
  const [aiTranscription, setAiTranscription] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);

  const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
  
  const voices = [
    { id: 'Zephyr', name: 'Zephyr', description: 'Calm & Professional' },
    { id: 'Aoede', name: 'Aoede', description: 'Warm & Melodic' },
    { id: 'Charon', name: 'Charon', description: 'Strong & Steady' },
    { id: 'Puck', name: 'Puck', description: 'Energetic & Bright' },
  ];

  const startCall = async () => {
    setIsCalling(true);
    setStatus('Connected');
    setAiTranscription(`Hello, I'm Kin, your AkinAI assistant. How can I help you today?`);
  };

  const handleUserMessage = async (message: string) => {
    try {
      setStatus('Kin is thinking...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: [
            { role: 'user', parts: [{ text: "Hello" }] },
            { role: 'model', parts: [{ text: "Hello, I'm Kin, your AkinAI assistant. How can I help you today?" }] }
          ],
          personality: 'concise'
        })
      });
      const data = await response.json();
      if (data.reply) {
        setAiTranscription(data.reply);
      }
      setStatus('Connected');
    } catch (error) {
      console.error("Call Error:", error);
      setStatus('Transmission Error');
    }
  };

  const stopCall = () => {
    setIsCalling(false);
    setStatus('Ready to call');
    setAiTranscription('');
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-12 h-full">
      <div className="relative">
        <motion.div
          animate={isCalling ? { scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-stone-900 rounded-full blur-3xl -z-10"
        />
        <div className="w-48 h-48 bg-stone-900 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
          {isCalling ? (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [10, 40, 10] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1.5 bg-stone-50 rounded-full"
                />
              ))}
            </div>
          ) : (
            <Mic size={64} className="text-stone-50" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isCalling && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 max-w-lg"
          >
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                  selectedVoice === voice.id 
                    ? "bg-stone-900 text-white border-stone-900 shadow-lg" 
                    : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                )}
              >
                {voice.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900">AkinAI Live</h2>
        <p className={cn(
          "text-sm font-medium uppercase tracking-widest",
          isCalling ? "text-green-500 animate-pulse" : "text-stone-400"
        )}>
          {status}
        </p>
      </div>

      <AnimatePresence>
        {aiTranscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-md bg-stone-50 border border-stone-200 p-6 rounded-3xl text-center shadow-lg space-y-4"
          >
            <p className="text-stone-700 italic font-medium">"{aiTranscription}"</p>
            <div className="flex gap-2">
               <input 
                 placeholder="Message Kin..."
                 className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-stone-900 transition-all font-bold"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     handleUserMessage((e.target as HTMLInputElement).value);
                     (e.target as HTMLInputElement).value = '';
                   }
                 }}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6">
        {isCalling ? (
          <>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-5 rounded-full transition-all shadow-lg",
                isMuted ? "bg-red-50 text-red-500" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
            </button>
            
            <button
              onClick={stopCall}
              className="p-6 bg-red-500 text-stone-50 rounded-full transition-all shadow-xl hover:scale-110 active:scale-95"
            >
              <PhoneOff size={32} />
            </button>

            <button
              onClick={() => setIsAiMuted(!isAiMuted)}
              className={cn(
                "p-5 rounded-full transition-all shadow-lg",
                isAiMuted ? "bg-red-50 text-red-500" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              {isAiMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
            </button>
          </>
        ) : (
          <button
            onClick={startCall}
            className="flex items-center gap-3 px-10 py-5 bg-stone-900 text-stone-50 rounded-full font-bold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <Play size={24} /> Start Conversation
          </button>
        )}
      </div>

      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em]">
        Low Latency Voice Engine • Kin v3.1
      </div>
    </div>
  );
};
