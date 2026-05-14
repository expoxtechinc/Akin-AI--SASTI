/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Plus, 
  MoreVertical, 
  Bot,
  User,
  Image as ImageIcon,
  Mic,
  Smile,
  Sparkles,
  Zap,
  Globe,
  Cpu,
  BrainCircuit,
  MessageSquare,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export const WhatsAppMessenger: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "👋 Hi! I'm AkinAI, your helpful intelligence partner. I'm here to assist you with anything you need. How can I help you today?", 
      sender: 'ai', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personality, setPersonality] = useState('concise');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await geminiService.generateResponse(input, history as any);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || "Something went wrong. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please check your connection or try again in a moment.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white relative bg-mesh overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between glass z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <BrainCircuit size={24} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#050505] shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
          <div>
             <h2 className="text-lg font-black uppercase tracking-tight italic font-display">AkinAI Assistant</h2>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-green-500 animate-pulse">Online & Ready</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-stone-400 hover:text-white transition-colors">
              <Zap size={18} />
           </button>
           <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-stone-400 hover:text-white transition-colors">
              <MoreVertical size={18} />
           </button>
        </div>
      </div>

      {/* Personality Chips */}
      <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar z-10">
         {[
           { id: 'concise', icon: Cpu, label: 'Balanced' },
           { id: 'creative', icon: Sparkles, label: 'Creative' },
           { id: 'global', icon: Globe, label: 'Search' }
         ].map((p) => (
           <button
             key={p.id}
             onClick={() => setPersonality(p.id)}
             className={cn(
               "px-4 py-2 rounded-full border text-[8px] font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-all shrink-0",
               personality === p.id 
                 ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20" 
                 : "bg-white/5 border-white/10 text-stone-500"
             )}
           >
             <p.icon size={12} />
             {p.label}
           </button>
         ))}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 customized-scrollbar relative z-10"
      >
        {messages.map((m, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={m.id}
            className={cn(
              "flex flex-col max-w-[85%]",
              m.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-5 rounded-[28px] text-sm font-medium leading-relaxed shadow-2xl transition-all",
              m.sender === 'user' 
                ? "bg-indigo-600 text-white rounded-tr-none border border-white/10 font-display" 
                : "bg-white/5 border border-white/5 rounded-tl-none text-stone-200 backdrop-blur-md"
            )}>
              {m.text}
            </div>
            <div className="flex items-center gap-2 mt-2 px-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-stone-600">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {m.sender === 'user' && (
                <CheckCircle2 size={10} className="text-indigo-500" />
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-3 mr-auto bg-white/5 border border-white/5 p-4 rounded-[24px] rounded-tl-none">
             <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1 h-1 bg-indigo-500 rounded-full"
                  />
                ))}
             </div>
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-500">Neural Synthesis...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 pb-12 z-10">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-2 pr-4 flex items-center gap-3 backdrop-blur-2xl group focus-within:border-indigo-500/50 transition-all shadow-2xl">
           <button className="p-4 bg-white/5 rounded-2xl text-stone-500 hover:text-white transition-colors">
              <Plus size={20} />
           </button>
           <input 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Synchronize command..."
             className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-stone-800 font-display italic tracking-tight"
           />
           <div className="flex items-center gap-2">
              <button className="p-3 text-stone-600 hover:text-stone-400 transition-colors hidden sm:block">
                 <Mic size={20} />
              </button>
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className={cn(
                  "p-4 rounded-2xl transition-all duration-500 flex items-center justify-center",
                  input.trim() ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105" : "bg-white/5 text-stone-800"
                )}
              >
                {isTyping ? <Loader2 size={20} className="animate-spin text-white" /> : <Send size={20} strokeWidth={3} />}
              </button>
           </div>
        </div>
      </div>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[30%] -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};

