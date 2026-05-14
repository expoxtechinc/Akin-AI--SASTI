/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Copy, Check, Trash2, Maximize2, Minimize2, Zap, Paperclip, X as CloseIcon, Image as ImageIcon, FileText as FileIcon } from 'lucide-react';
import { AITool, ChatMessage } from '../../types';
import { geminiService } from '../../services/geminiService';
import { cn } from '../../lib/utils';

interface AttachedFile {
  name: string;
  type: string;
  base64: string;
}

interface ToolInterfaceProps {
  tool: AITool;
}

export const ToolInterface: React.FC<ToolInterfaceProps> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setAttachedFile(null);
  }, [tool.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setAttachedFile({
          name: file.name,
          type: file.type,
          base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const userMessage = input.trim();
    const currentFile = attachedFile;
    setInput('');
    setAttachedFile(null);

    // Add to history
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: currentFile ? `${userMessage}\n\n[Attached: ${currentFile.name}]` : userMessage 
    }]);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const promptParts: any[] = [];
      if (userMessage) promptParts.push({ text: userMessage });
      if (currentFile) {
        promptParts.push({
          inlineData: {
            data: currentFile.base64,
            mimeType: currentFile.type
          }
        });
      }

      const response = await geminiService.generateResponse(promptParts, tool.prompt, history as any);
      setMessages(prev => [...prev, { role: 'model', content: response || 'No response generated.' }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: error.message || 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-[#050505] text-white transition-all overflow-hidden relative bg-mesh",
      isFullscreen ? "fixed inset-0 z-[100]" : "w-full"
    )}>
      {/* Tool Header */}
      <div className="px-8 py-6 flex items-center justify-between glass z-20 border-b border-white/5">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
               <Cpu size={24} className="text-white" />
            </div>
            <div>
               <h2 className="text-xl font-black tracking-tighter italic font-display uppercase text-glow">{tool.name}</h2>
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500">Neural_Compute_Active</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 bg-white/5 rounded-xl border border-white/10 text-stone-500 hover:text-white transition-all"
            >
               {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <div className="w-px h-6 bg-white/5" />
            <button className="p-3 text-stone-500 hover:text-white transition-colors">
               <Zap size={20} className="text-indigo-500 animate-pulse" />
            </button>
         </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-12 md:px-12 scroll-smooth customized-scrollbar relative z-10"
      >
        <div className="max-w-[1200px] mx-auto w-full space-y-16">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-12">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                 className="relative"
               >
                 <div className="absolute inset-0 bg-indigo-600 blur-[40px] opacity-20" />
                 <div className="w-24 h-24 rounded-[32px] bg-black border border-white/10 flex items-center justify-center text-indigo-500 relative z-10">
                    <BrainCircuit size={48} />
                 </div>
               </motion.div>
              
               <div className="space-y-4">
                 <h3 className="text-3xl font-black tracking-tighter uppercase italic font-display text-glow">{tool.name} Readiness</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-600 max-w-sm mx-auto italic">
                   Node Operational. Select sub-protocol or input unique vector command to begin synchronization.
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                 {['Explain complex logic', 'Initialize code plan', 'Creative vectoring', 'Technical debug'].map((hint) => (
                   <button 
                     key={hint}
                     onClick={() => setInput(hint)}
                     className="group relative p-6 bg-white/5 border border-white/5 rounded-[32px] overflow-hidden text-left transition-all hover:bg-white/10 hover:border-indigo-500/30"
                   >
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Zap size={40} />
                     </div>
                     <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] text-stone-500 group-hover:text-white transition-colors">{hint}</span>
                   </button>
                 ))}
               </div>
            </div>
          ) : (
            <div className="space-y-12 pb-32">
              {messages.map((message, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className={cn(
                    "flex gap-6 group relative",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "flex-none w-14 h-14 rounded-2xl flex items-center justify-center text-[10px] font-bold border relative overflow-hidden",
                    message.role === 'user' 
                      ? "bg-white/5 border-white/10 text-stone-400 font-black italic" 
                      : "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                    <span className="relative z-10 uppercase tracking-tighter">{message.role === 'user' ? 'USER' : 'CORE'}</span>
                  </div>
                  
                  <div className={cn(
                    "flex-1 min-w-0 space-y-4",
                    message.role === 'user' ? "text-right" : "text-left"
                  )}>
                    <div className={cn(
                      "p-8 rounded-[48px] shadow-2xl transition-all relative overflow-hidden",
                      message.role === 'user' 
                        ? "bg-white/5 border border-white/5 text-stone-200 font-display italic tracking-tight text-xl" 
                        : "glass border border-white/10 text-stone-200 prose prose-invert max-w-none prose-p:leading-relaxed md:prose-p:text-lg"
                    )}>
                      {message.role === 'user' ? (
                        message.content
                      ) : (
                        <ReactMarkdown className="markdown-body">{message.content}</ReactMarkdown>
                      )}
                    </div>
                    
                    <div className={cn(
                      "flex items-center gap-6 px-4 opacity-50 group-hover:opacity-100 transition-opacity",
                      message.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      {message.role === 'model' && (
                        <>
                          <button
                            onClick={() => copyToClipboard(message.content, index)}
                            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 hover:text-white transition-colors"
                          >
                            <Copy size={14} /> {copiedIndex === index ? 'S_Sync' : 'Clone'}
                          </button>
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600">Integrity Check v8.4.2 Passed</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex gap-6 animate-pulse">
               <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <Loader2 className="animate-spin text-indigo-500" />
               </div>
               <div className="flex-1 space-y-3 pt-4">
                  <div className="h-2 w-full bg-white/5 rounded-full" />
                  <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                  <div className="h-2 w-1/2 bg-white/5 rounded-full" />
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-8 md:p-12 z-20">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative glass rounded-[48px] border border-white/10 focus-within:border-indigo-500/50 transition-all shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <AnimatePresence>
              {attachedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full left-8 mb-6 p-4 glass border border-white/10 rounded-3xl flex items-center gap-4 shadow-2xl z-20"
                >
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-500">
                    {attachedFile.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileIcon size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 truncate max-w-[150px]">{attachedFile.name}</span>
                    <span className="text-[8px] font-bold text-stone-500 uppercase">Input_Ready</span>
                  </div>
                  <button type="button" onClick={() => setAttachedFile(null)} className="p-2 text-stone-600 hover:text-white transition-colors bg-white/5 rounded-full"><CloseIcon size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf,text/*" />

            <div className="flex items-center gap-4 px-8 py-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-white/5 rounded-2xl text-stone-500 hover:text-white transition-all transform hover:rotate-12"
                title="Attach Vector"
              >
                <Paperclip size={24} />
              </button>
              
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Synchronize command sequence..."
                className="flex-1 py-4 bg-transparent outline-none resize-none max-h-48 text-lg font-bold font-display italic tracking-tight text-white placeholder:text-stone-700 leading-relaxed"
              />

              <button
                type="submit"
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className={cn(
                  "p-5 rounded-[28px] transition-all duration-700 flex items-center justify-center",
                  (input.trim() || attachedFile) && !isLoading 
                    ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 translate-x-1" 
                    : "bg-white/5 text-stone-800"
                )}
              >
                <Send size={24} strokeWidth={3} />
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex justify-center items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-stone-600 italic">
            <span>Core v4.0.1</span>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
            <span>Secure_Protocol: AES-512</span>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
            <span>Node_742_Online</span>
          </div>
        </div>
      </div>
      
      {/* Absolute Decorative Orbs */}
      <div className="absolute top-[30%] -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] -right-40 w-96 h-96 bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
};
