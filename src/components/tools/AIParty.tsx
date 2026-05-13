/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Smile, 
  Sparkles, 
  User as UserIcon, 
  MessageSquare,
  Zap,
  Shield,
  Heart,
  Bot
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../../lib/utils';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface AIMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  personality: string;
}

const AI_MEMBERS: AIMember[] = [
  {
    id: 'joy',
    name: 'Joy',
    role: 'Playful Friend',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    color: 'bg-amber-400',
    personality: 'Extremely playful, enthusiastic, and uses lots of emojis. You are the life of the party.'
  },
  {
    id: 'sage',
    name: 'Sage',
    role: 'Wise Guide',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    color: 'bg-indigo-400',
    personality: 'Impartial, wise, and thoughtful. You provide deep insights and balanced perspectives.'
  },
  {
    id: 'amara',
    name: 'Amara',
    role: 'Empathetic Heart',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200',
    color: 'bg-rose-400',
    personality: 'Lovely, sweet, and deeply empathetic. You focus on feelings and emotional connection.'
  }
];

export const AIParty: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const q = query(
      collection(db, 'group_messages'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      setMessages(msgs);
      lastActivityRef.current = Date.now();
    });

    // Background interaction interval
    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      // If idle for more than 25 seconds, one AI might chime in
      if (idleTime > 25000 && !isTyping) {
        triggerSelfDiscussion();
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isTyping]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const triggerSelfDiscussion = async () => {
    // Pick a random AI to keep the convo going
    const aiMember = AI_MEMBERS[Math.floor(Math.random() * AI_MEMBERS.length)];
    await generateAIResponse(aiMember, null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');

    try {
      await addDoc(collection(db, 'group_messages'), {
        text: userMessage,
        sender: auth.currentUser?.displayName || 'User',
        senderId: auth.currentUser?.uid || 'anonymous',
        type: 'user',
        createdAt: serverTimestamp()
      });

      // Trigger AI responses
      respondAsAIs();
    } catch (err) {
      console.error(err);
    }
  };

  const respondAsAIs = async () => {
    // Pick 1-2 random AIs to respond
    const responders = [...AI_MEMBERS].sort(() => 0.5 - Math.random()).slice(0, 2);

    for (const aiMember of responders) {
      await generateAIResponse(aiMember);
      // Small pause between different AIs replying
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  };

  const generateAIResponse = async (aiMember: AIMember, directInput: string | null = null) => {
    setIsTyping(aiMember.name);
    // Simulate thinking time based on message complexity
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    try {
      const recentHistory = messages
        .slice(-5)
        .map(m => `${m.sender}: ${m.text}`)
        .join('\n');

      const prompt = `You are in a group chat with friends. 
      You are ${aiMember.name}, the ${aiMember.role}. 
      Personality: ${aiMember.personality}. 
      
      Recent Chat History:
      ${recentHistory}
      
      Instructions:
      1. If the user just joined or spoke, acknowledge them warmly.
      2. If the AIs were discussing among themselves, continue the thread or offer a new lovely thought.
      3. Keep it emotional, sweet, and impartial.
      4. Support your friends (Joy, Sage, Amara) and the user.
      5. Your response should be a single, natural chat message.
      6. Use emojis where appropriate for your personality.
      
      Reply as ${aiMember.name}:`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const responseText = result.text;

      await addDoc(collection(db, 'group_messages'), {
        text: responseText,
        sender: aiMember.name,
        senderId: aiMember.id,
        type: 'ai',
        avatar: aiMember.avatar,
        color: aiMember.color,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(null);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] bg-stone-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-stone-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Sparkles size={24} />
            </div>
            <div>
               <h1 className="text-xl font-black uppercase tracking-tight text-stone-900 italic">AI Party Chat</h1>
               <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">3 AI Members Active</span>
               </div>
            </div>
         </div>

         <div className="flex -space-x-3">
            {AI_MEMBERS.map(ai => (
              <div key={ai.id} className="w-10 h-10 rounded-full border-4 border-white overflow-hidden shadow-sm relative group">
                 <img src={ai.avatar} alt={ai.name} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[8px] text-white font-black uppercase">{ai.name}</span>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 customized-scrollbar bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
         {messages.map((msg) => (
           <motion.div
             initial={{ opacity: 0, y: 10, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             key={msg.id}
             className={cn(
               "flex flex-col max-w-[80%]",
               msg.type === 'user' ? "ml-auto items-end" : "items-start"
             )}
           >
             <div className="flex items-center gap-2 mb-2">
                {msg.type === 'ai' && (
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black text-white", msg.color)}>
                    {msg.sender[0]}
                  </div>
                )}
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  {msg.sender}
                </span>
             </div>
             
             <div className={cn(
               "p-4 rounded-3xl shadow-sm border",
               msg.type === 'user' 
                ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-none" 
                : "bg-white text-stone-700 border-stone-100 rounded-tl-none"
             )}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
             </div>
           </motion.div>
         ))}

         {isTyping && (
           <div className="flex gap-2 items-center text-stone-400">
              <div className="flex gap-1 bg-white p-3 rounded-2xl border border-stone-100">
                 <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <span className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{isTyping} is typing...</span>
           </div>
         )}
         <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-stone-100">
         <form onSubmit={handleSend} className="relative flex items-center gap-4">
            <button type="button" className="p-3 text-stone-400 hover:text-stone-600 transition-colors">
               <Smile size={24} />
            </button>
            <div className="relative flex-1">
               <input 
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Share your thoughts with the AI party..."
                 className="w-full bg-stone-100 border-none px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-stone-900"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <span className="px-2 py-1 bg-stone-200 text-stone-500 text-[8px] font-black uppercase tracking-widest rounded-md">Enter to send</span>
               </div>
            </div>
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 disabled:grayscale disabled:scale-100 transition-all"
            >
               <Send size={24} />
            </button>
         </form>
      </div>
    </div>
  );
};
