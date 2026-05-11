/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, Copy, Check, Trash2, Maximize2, Minimize2, Zap } from 'lucide-react';
import { AITool, ChatMessage } from '../../types';
import { geminiService } from '../../services/geminiService';
import { cn } from '../../lib/utils';

interface ToolInterfaceProps {
  tool: AITool;
}

export const ToolInterface: React.FC<ToolInterfaceProps> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [tool.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Map history to Gemini format
      const history = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await geminiService.generateResponse(userMessage, tool.prompt, history as any);
      setMessages(prev => [...prev, { role: 'model', content: response || 'No response generated.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
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
      "flex flex-col h-full bg-white transition-all overflow-hidden",
      isFullscreen ? "fixed inset-0 z-[100] p-4 lg:p-8" : "p-4 lg:p-6"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">{tool.name}</h2>
          <p className="text-sm text-stone-500">{tool.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMessages([])} 
            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
            title={isFullscreen ? "Minimize" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 scrollbar-thin"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400">
              {/* Fallback to simple icon since dynamic icon mapping is in Sidebar */}
              <Zap size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Start a conversation</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                {tool.description} Use the input below to get started.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={index}
              className={cn(
                "flex flex-col max-w-[85%]",
                message.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                message.role === 'user' 
                  ? "bg-stone-900 text-stone-50 rounded-tr-none" 
                  : "bg-stone-100 text-stone-800 rounded-tl-none whitespace-pre-wrap prose prose-stone prose-sm max-w-none"
              )}>
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </div>
              
              {message.role === 'model' && (
                <button
                  onClick={() => copyToClipboard(message.content, index)}
                  className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors"
                >
                  {copiedIndex === index ? (
                    <><Check size={12} /> Copied</>
                  ) : (
                    <><Copy size={12} /> Copy Output</>
                  )}
                </button>
              )}
            </motion.div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center gap-3 text-stone-400">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm font-medium animate-pulse">AkinAI is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative">
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
          placeholder={tool.placeholder}
          className={cn(
            "w-full pl-6 pr-16 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all resize-none max-h-48",
            "placeholder:text-stone-400 text-stone-900 text-sm"
          )}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
            input.trim() && !isLoading 
              ? "bg-stone-900 text-stone-50 hover:scale-105 active:scale-95" 
              : "text-stone-300 pointer-events-none"
          )}
        >
          <Send size={20} />
        </button>
      </form>
      <p className="mt-4 text-center text-[10px] text-stone-400 font-medium uppercase tracking-[0.2em]">
        AI-powered by Gemini 3 Flash • AkinAI © 2026
      </p>
    </div>
  );
};
