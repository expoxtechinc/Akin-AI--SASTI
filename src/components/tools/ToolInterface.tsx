/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Paperclip, 
  X as CloseIcon, 
  Image as ImageIcon, 
  FileText as FileIcon, 
  Cpu, 
  BrainCircuit,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Share,
  MoreHorizontal,
  Plus,
  Mic,
  AudioLines
} from 'lucide-react';
import { AITool, ChatMessage } from '../../types';
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

    const history = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const attachments = currentFile ? [{
      data: `data:${currentFile.type};base64,${currentFile.base64}`,
      mimeType: currentFile.type
    }] : [];

    // Add placeholder for the upcoming model message
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: history as any,
          personality: tool.prompt,
          attachments
        }),
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullText += data.text;
                // Update the last message in state
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'model') {
                    lastMessage.content = fullText;
                  }
                  return newMessages;
                });
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE chunk:', e, dataStr);
            }
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      // Remove the empty placeholder and show error
      setMessages(prev => {
        const filtered = prev.filter((_, i) => i !== prev.length - 1);
        return [...filtered, { role: 'model', content: error.message || 'Sorry, I encountered an error. Please try again.' }];
      });
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
      {/* Tool Header - Minimal, showing app name or tool name */}
      <div className="px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
             <span className="text-lg font-bold text-white/90">{tool.name}</span>
             <div className="w-1.5 h-1.5 rounded-full bg-stone-700" />
             <span className="text-xs font-medium text-stone-500 italic">Core v4.0</span>
          </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 md:px-8 scroll-smooth customized-scrollbar relative z-10"
      >
        <div className="max-w-2xl mx-auto w-full space-y-10">
          {messages.length === 0 ? (
            <div className="h-4/5 flex flex-col items-center justify-center text-center py-20 space-y-8">
               <motion.div 
                 animate={{ scale: [1, 1.05, 1] }}
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="relative"
               >
                 <div className="absolute inset-0 bg-indigo-600 blur-[60px] opacity-10" />
                 <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center text-white relative z-10">
                    <AudioLines size={32} />
                 </div>
               </motion.div>
              
               <div className="space-y-2">
                 <h3 className="text-2xl font-bold tracking-tight text-white">How can I help you today?</h3>
                 <p className="text-sm font-medium text-stone-500 max-w-xs mx-auto">
                   AkinAI is ready to synchronize with your creative and technical objectives.
                 </p>
               </div>
            </div>
          ) : (
            <div className="space-y-8 pb-40">
              {messages.map((message, index) => (
                <div key={index} className="space-y-4">
                  <div className={cn(
                    "flex flex-col group relative",
                    message.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "max-w-[85%] rounded-3xl transition-all",
                      message.role === 'user' 
                        ? "px-5 py-3 bg-stone-800/80 text-white font-medium" 
                        : "py-2 text-stone-100"
                    )}>
                      {message.role === 'user' ? (
                        message.content
                      ) : (
                        <div className="markdown-body text-base leading-relaxed">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'model' && (
                      <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-stone-500 hover:text-white" title="Copy">
                          <Copy size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-stone-500 hover:text-white">
                          <ThumbsUp size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-stone-500 hover:text-white">
                          <ThumbsDown size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-stone-500 hover:text-white">
                          <Volume2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-stone-500 hover:text-white">
                          <Share size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-stone-500 hover:text-white">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="p-2">
                    <Loader2 className="animate-spin text-white/40" size={20} />
                  </div>
                  <div className="flex-1 space-y-3 pt-3">
                    <div className="h-1.5 w-full bg-white/5 rounded-full" />
                    <div className="h-1.5 w-4/5 bg-white/5 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Neural Input Pill - Optimized Layer */}
      <div className="absolute bottom-6 inset-x-0 px-6 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center bg-[#2F2F2F] rounded-[32px] px-2 py-1.5 shadow-2xl transition-all focus-within:ring-1 ring-white/10 relative overflow-visible">
            <button
               type="button"
               onClick={() => fileInputRef.current?.click()}
               className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
               <Plus size={22} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf,text/*" />
            
            <div className="flex-1 relative flex items-center">
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
                placeholder={`Reply to ${tool.name}`}
                className="w-full bg-transparent outline-none py-2 px-2 text-[15px] font-medium text-white placeholder:text-stone-500 resize-none max-h-32"
              />
              
              <AnimatePresence>
                {attachedFile && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full left-0 mb-4 p-2 bg-stone-800 border border-white/5 rounded-2xl flex items-center gap-3 shadow-2xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                      {attachedFile.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileIcon size={16} />}
                    </div>
                    <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{attachedFile.name}</span>
                    <button type="button" onClick={() => setAttachedFile(null)} className="p-1.5 text-white/50 hover:text-white bg-white/5 rounded-full"><CloseIcon size={10} /></button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1">
               <button type="button" className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                  <Mic size={20} />
               </button>
               {input.trim() || attachedFile ? (
                 <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition-all active:scale-95"
                 >
                   <Send size={14} fill="currentColor" />
                 </button>
               ) : null}
            </div>
          </form>

          {!input.trim() && !attachedFile && (
            <button className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
               <AudioLines size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* Absolute Decorative Orbs */}
      <div className="absolute top-[30%] -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] -right-40 w-96 h-96 bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
    </div>
  );
};
