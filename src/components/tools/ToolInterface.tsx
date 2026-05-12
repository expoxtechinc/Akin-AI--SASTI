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
      "flex flex-col h-full bg-white transition-all overflow-hidden relative",
      isFullscreen ? "fixed inset-0 z-[100]" : "w-full"
    )}>
      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 md:px-0 scroll-smooth customized-scrollbar"
      >
        <div className="max-w-3xl mx-auto w-full space-y-12">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-6">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
                <Zap size={24} className="text-stone-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-stone-900 tracking-tight">{tool.name}</h3>
                <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {['Explain like I\'m 5', 'Write a plan', 'Debug my code', 'Creative brainstorming'].map((hint) => (
                  <button 
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="p-4 border border-stone-100 rounded-2xl text-left text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors uppercase tracking-wider"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className={cn(
                  "flex gap-4 md:gap-6 group",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "flex-none w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border",
                  message.role === 'user' 
                    ? "bg-stone-100 border-stone-200 text-stone-600" 
                    : "bg-stone-900 border-stone-900 text-white"
                )}>
                  {message.role === 'user' ? 'U' : 'AI'}
                </div>
                
                <div className={cn(
                  "flex-1 min-w-0 space-y-2",
                  message.role === 'user' ? "text-right" : "text-left"
                )}>
                  <div className={cn(
                    "text-[15px] leading-relaxed",
                    message.role === 'user' 
                      ? "text-stone-800 font-medium" 
                      : "text-stone-800 prose prose-stone max-w-none prose-p:leading-relaxed prose-pre:bg-stone-900"
                  )}>
                    {message.role === 'user' ? (
                      message.content
                    ) : (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    )}
                  </div>
                  
                  {message.role === 'model' && (
                    <div className="flex items-center gap-4 pt-2 border-t border-stone-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(message.content, index)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors"
                      >
                        {copiedIndex === index ? (
                          <><Check size={12} /> Copied</>
                        ) : (
                          <><Copy size={12} /> Copy</>
                        )}
                      </button>
                      <button className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors">
                         Like
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-4 md:gap-6 animate-pulse">
               <div className="w-8 h-8 rounded-full bg-stone-900 border border-stone-900 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-200 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-stone-200 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-stone-200 animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 md:p-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative bg-stone-100 rounded-[28px] border border-stone-200 focus-within:ring-2 focus-within:ring-stone-200 transition-all shadow-sm">
            <AnimatePresence>
              {attachedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-3 p-2 bg-white border border-stone-200 rounded-xl flex items-center gap-3 shadow-lg z-10"
                >
                  <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center text-stone-500">
                    {attachedFile.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileIcon size={16} />}
                  </div>
                  <span className="text-[10px] font-bold text-stone-900 truncate max-w-[120px]">{attachedFile.name}</span>
                  <button type="button" onClick={() => setAttachedFile(null)} className="p-1 text-stone-400 hover:text-stone-900"><CloseIcon size={12} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf,text/*" />

            <div className="flex items-end gap-2 px-4 py-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mb-1 p-2 text-stone-500 hover:text-stone-900 transition-colors"
                title="Attach"
              >
                <Paperclip size={20} />
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
                placeholder="Message AkinAI..."
                className="flex-1 py-3 bg-transparent outline-none resize-none max-h-48 text-[15px] text-stone-900 placeholder:text-stone-500 leading-relaxed"
              />

              <button
                type="submit"
                disabled={(!input.trim() && !attachedFile) || isLoading}
                className={cn(
                  "mb-1 p-2 rounded-xl transition-all",
                  (input.trim() || attachedFile) && !isLoading 
                    ? "bg-stone-900 text-white shadow-md active:scale-95" 
                    : "text-stone-300 pointer-events-none"
                )}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          
          <p className="mt-3 text-center text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-relaxed">
            AkinAI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};
