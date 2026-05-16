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
  Copy,
  X,
  Paperclip,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  attachments?: { data: string, mimeType: string, name: string }[];
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
  const [attachments, setAttachments] = useState<{ data: string, mimeType: string, name: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const creatorAvatar = "/file_00000000b690720abf4d5357155283f7.png";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        setAttachments(prev => [...prev, {
          data,
          mimeType: file.type,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here for feedback
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isTyping) return;

    const currentAttachments = [...attachments];
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      attachments: currentAttachments
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsTyping(true);

    // Add placeholder for the upcoming AI message
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      text: "",
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(true);

    try {
      const history = messages.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input, 
          history: history as any, 
          personality, 
          attachments: currentAttachments.map(a => ({ data: a.data, mimeType: a.mimeType }))
        })
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      setIsTyping(false); // Stop showing the typing indicator once we start receiving chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullText += data.text;
                // Update the specifically created AI message
                setMessages(prev => {
                  return prev.map(m => m.id === aiMessageId ? { ...m, text: fullText } : m);
                });
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("AI Communication Error:", error);
      setMessages(prev => {
        return prev.map(m => m.id === aiMessageId 
          ? { ...m, text: "I'm having trouble connecting right now. Please check your connection or try again in a moment." } 
          : m);
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white relative bg-mesh overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between glass z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 overflow-hidden shadow-lg shadow-indigo-600/30 transition-transform group-hover:scale-105">
              <img 
                src={creatorAvatar} 
                alt="Akin S. Sokpah" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#050505] shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
          <div>
             <h2 className="text-lg font-black uppercase tracking-tight italic font-display">AkinAI Advisor</h2>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-green-500 animate-pulse">Sync_Active</span>
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
              "flex gap-4 max-w-[90%] md:max-w-[80%]",
              m.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
            )}
          >
            {m.sender === 'ai' && (
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 hidden sm:block">
                <img src={creatorAvatar} alt="AI" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            
            <div className={cn(
              "flex flex-col",
              m.sender === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "p-5 rounded-[24px] text-sm font-medium leading-relaxed shadow-xl group relative transition-all",
                m.sender === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none border border-white/10" 
                  : "bg-white/5 border border-white/5 rounded-tl-none text-stone-200 backdrop-blur-md"
              )}>
                {/* Message Content */}
                <div className="markdown-body">
                   <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>

                {/* Attachments Display */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.attachments.map((file, idx) => (
                      <div key={idx} className="relative group/file">
                        {file.mimeType.startsWith('image/') ? (
                          <img 
                            src={file.data} 
                            alt={file.name} 
                            className="w-32 h-32 object-cover rounded-xl border border-white/10"
                          />
                        ) : (
                          <div className="p-3 bg-white/10 rounded-xl flex items-center gap-2">
                            <Paperclip size={16} />
                            <span className="text-[10px] break-all max-w-[100px] truncate">{file.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons (Copy) */}
                {m.sender === 'ai' && (
                  <button 
                    onClick={() => copyToClipboard(m.text)}
                    className="absolute -right-12 top-0 p-2 text-stone-600 hover:text-indigo-400 transition-colors bg-white/5 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 hidden sm:block shadow-lg"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2 px-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-stone-600">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {m.sender === 'user' && (
                  <CheckCircle2 size={10} className="text-indigo-500" />
                )}
              </div>
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
        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4 flex flex-wrap gap-3 p-4 bg-white/5 border border-white/10 rounded-[28px] max-h-48 overflow-y-auto customized-scrollbar"
            >
              {attachments.map((file, idx) => (
                <div key={idx} className="relative group/thumb">
                  {file.mimeType.startsWith('image/') ? (
                    <img src={file.data} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-white/20" />
                  ) : (
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex flex-col items-center justify-center p-2 text-center">
                      <Paperclip size={14} className="text-indigo-400 mb-1" />
                      <span className="text-[7px] truncate w-full font-bold uppercase">{file.name}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-2 pr-4 flex items-center gap-3 backdrop-blur-2xl group focus-within:border-indigo-500/50 transition-all shadow-2xl">
           <input 
             type="file" 
             multiple 
             className="hidden" 
             ref={fileInputRef} 
             onChange={handleFileSelect}
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="p-4 bg-white/5 rounded-2xl text-stone-500 hover:text-white transition-colors"
           >
              <Paperclip size={20} />
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
                disabled={isTyping || (!input.trim() && attachments.length === 0)}
                className={cn(
                  "p-4 rounded-2xl transition-all duration-500 flex items-center justify-center",
                  (input.trim() || attachments.length > 0) ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105" : "bg-white/5 text-stone-800"
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

