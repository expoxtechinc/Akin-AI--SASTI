/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  Trash2, 
  Paperclip, 
  X as CloseIcon, 
  Image as ImageIcon, 
  FileText as FileIcon, 
  Cpu, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2, 
  Share2, 
  Menu, 
  Plus, 
  Mic, 
  AudioLines,
  MessageSquare,
  Sparkles,
  LogOut,
  ChevronDown,
  User,
  ExternalLink,
  Zap,
  LayoutDashboard,
  BrainCircuit,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { db, auth } from '../../services/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  updateDoc, 
  serverTimestamp,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { AITool } from '../../types';
import { TOOLS } from '../../constants';

interface AkinAIChatWorkspaceProps {
  userEmail: string;
  onLogout: () => void;
  isAdmin: boolean;
  onBackToAdmin?: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  personality: string;
  createdAt: any;
  messages: { role: 'user' | 'model'; content: string; timestamp: number }[];
}

interface AttachedFile {
  name: string;
  type: string;
  base64: string;
}

export const AkinAIChatWorkspace: React.FC<AkinAIChatWorkspaceProps> = ({
  userEmail,
  onLogout,
  isAdmin,
  onBackToAdmin
}) => {
  // Navigation & Sizing States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activePersonality, setActivePersonality] = useState<string>('chat');
  const [activeModel, setActiveModel] = useState<string>('AkinAI v4 Core (Ultrafast)');
  
  // Chat States
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string; timestamp: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Profile modal / info state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const currentUserId = auth.currentUser?.uid;

  // Retrieve current active personality prompt
  const getCurrentPersonalityPrompt = () => {
    const currentTool = TOOLS.find(t => t.id === activePersonality) || TOOLS[0];
    return currentTool.prompt;
  };

  const getCurrentPersonalityName = () => {
    const currentTool = TOOLS.find(t => t.id === activePersonality) || TOOLS[0];
    return currentTool.name;
  };

  // Sync session list from Firestore
  useEffect(() => {
    if (!currentUserId) return;

    setSessionsLoading(true);
    const chatsRef = collection(db, 'users', currentUserId, 'chats');
    const q = query(chatsRef, orderBy('createdAt', 'desc'), limit(40));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSessions: ChatSession[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedSessions.push({
          id: doc.id,
          title: data.title || 'Conversation Starter',
          personality: data.personality || 'chat',
          createdAt: data.createdAt,
          messages: data.messages || []
        });
      });
      setSessions(fetchedSessions);
      setSessionsLoading(false);

      // If there's no active session, but sessions exist, select the first one
      if (fetchedSessions.length > 0 && !activeSessionId) {
        // Do not auto-select if user wants empty, but we can do it to restore history
      }
    }, (error) => {
      console.error("Error loading sessions from Firestore", error);
      setSessionsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Sync messages from activeSessionId
  useEffect(() => {
    if (!activeSessionId || !currentUserId) {
      setMessages([]);
      return;
    }

    const session = sessions.find(s => s.id === activeSessionId);
    if (session) {
      setMessages(session.messages);
      setActivePersonality(session.personality);
    }
  }, [activeSessionId, sessions]);

  // Scroll to bottom on response update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Create a new chat session in Firestore & active it
  const handleCreateNewChat = async (presetId: string = 'chat') => {
    if (!currentUserId) return;
    
    try {
      const chatsRef = collection(db, 'users', currentUserId, 'chats');
      const tool = TOOLS.find(t => t.id === presetId) || TOOLS[0];
      
      const newSessionData = {
        title: `AI Assistant (${tool.name})`,
        personality: presetId,
        createdAt: serverTimestamp(),
        messages: []
      };

      const docRef = await addDoc(chatsRef, newSessionData);
      setActiveSessionId(docRef.id);
      setActivePersonality(presetId);
      setMessages([]);
      setInput('');
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    } catch (err) {
      console.error("Error creating new chat session in Firestore:", err);
    }
  };

  // Delete a session from Firestore
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!currentUserId) return;

    try {
      const chatDocRef = doc(db, 'users', currentUserId, 'chats', sessionId);
      await deleteDoc(chatDocRef);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  // Handle File Upload Selection
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

  // Handle Message Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedFile) || isLoading || !currentUserId) return;

    const userMsgContent = input.trim();
    const currentAttachment = attachedFile;
    setInput('');
    setAttachedFile(null);

    // 1. Prepare message payload
    const formattedUserMessage = currentAttachment 
      ? `${userMsgContent}\n\n[Attached File: ${currentAttachment.name}]` 
      : userMsgContent;

    const newMessagesList = [
      ...messages,
      { role: 'user' as const, content: formattedUserMessage, timestamp: Date.now() }
    ];

    // If there is no active session, create one first under current user
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const chatsRef = collection(db, 'users', currentUserId, 'chats');
        const defaultTitle = userMsgContent.substring(0, 30) || 'New AI Discussion';
        
        const newSessionData = {
          title: defaultTitle,
          personality: activePersonality,
          createdAt: serverTimestamp(),
          messages: []
        };
        const docRef = await addDoc(chatsRef, newSessionData);
        sessionId = docRef.id;
        setActiveSessionId(sessionId);
      } catch (err) {
        console.error("Failed to lazy initialize chat session in Firestore", err);
        return;
      }
    }

    // 2. Add placeholder message for rendering model stream reply
    const newMessagesWithModelPlaceholder = [
      ...newMessagesList,
      { role: 'model' as const, content: '', timestamp: Date.now() }
    ];
    setMessages(newMessagesWithModelPlaceholder);
    setIsLoading(true);

    const historyPayload = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const attachmentsPayload = currentAttachment ? [{
      data: `data:${currentAttachment.type};base64,${currentAttachment.base64}`,
      mimeType: currentAttachment.type
    }] : [];

    try {
      // 3. Initiate post streaming request to server
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgContent,
          history: historyPayload,
          personality: getCurrentPersonalityPrompt(),
          attachments: attachmentsPayload
        })
      });

      if (!response.body) throw new Error('Streaming response received empty body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullModelResult = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const dataObj = JSON.parse(dataStr);
              if (dataObj.text) {
                fullModelResult += dataObj.text;
                // Dynamically update the messages in UI
                setMessages(prev => {
                  const items = [...prev];
                  const last = items[items.length - 1];
                  if (last && last.role === 'model') {
                    last.content = fullModelResult;
                  }
                  return items;
                });
              } else if (dataObj.error) {
                throw new Error(dataObj.error);
              }
            } catch (err) {
              console.error('Error parsing SSE line', err);
            }
          }
        }
      }

      // 4. Save entire conversation back to Firestore document to persist history
      const updatedMessagesWithFidelity = [
        ...newMessagesList,
        { role: 'model' as const, content: fullModelResult, timestamp: Date.now() }
      ];

      const chatDocRef = doc(db, 'users', currentUserId, 'chats', sessionId);
      await updateDoc(chatDocRef, {
        messages: updatedMessagesWithFidelity,
        title: messages.length === 0 ? (userMsgContent.substring(0, 30) || 'New AI Discussion') : undefined
      });

    } catch (err: any) {
      console.error("Inference pipeline error:", err);
      // Fallback response inside the chat pane
      setMessages(prev => {
        const listWithoutEmpty = prev.filter((_, i) => i !== prev.length - 1);
        return [
          ...listWithoutEmpty,
          { 
            role: 'model', 
            content: `**AkinAI Connection Check**: ${err.message || 'I experienced a momentary signal interruption. Please try clicking resubmit.'}`,
            timestamp: Date.now()
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Utilities
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeakerPlayback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove markdown tags before voicing
      const cleanString = text.replace(/[*#`_\[\]()\-+=>|{}]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanString);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS Speech synthesis not supported on this browser context.");
    }
  };

  // Prepackaged presets mimicking ChatGPT/Gemini UI suggestions
  const SUGGESTION_PROMPTS = [
    {
      label: "Code Architect",
      icon: Cpu,
      text: "Write a React hook for debouncing input with optimal dependency checks.",
      presetId: "code-arch"
    },
    {
      label: "Creative Writer",
      icon: Sparkles,
      text: "Write an inspiring Afrobeats song lyric about Liberia's digital renaissance.",
      presetId: "storyteller"
    },
    {
      label: "Clinical Educator",
      icon: BrainCircuit,
      text: "Explain the classic nursing care plan for a patient under acute heart failure.",
      presetId: "medical-pro"
    },
    {
      label: "Business Strategist",
      icon: Zap,
      text: "Give me active marketing strategies to grow a tech group in Mount Barclay.",
      presetId: "marketing"
    }
  ];

  return (
    <div className="flex w-full h-screen bg-[#070708] text-white overflow-hidden relative font-sans">
      
      {/* LEFT SIDEBAR PANEL: Sleek Slate Obsidian */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-none bg-[#0D0D0E] h-full flex flex-col border-r border-white/5 relative z-40 overflow-hidden"
          >
            {/* Sidebar Branding */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleCreateNewChat('chat')}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
                  <AudioLines size={18} className="text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-widest leading-none bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                    AkinAI
                  </h1>
                  <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block mt-0.5">By Akin S. Sokpah</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-stone-400 hover:text-white transition-colors"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Quick Action: New Conversation */}
            <div className="p-4 flex-none">
              <button 
                onClick={() => handleCreateNewChat('chat')}
                className="w-full py-3 bg-white hover:bg-stone-100 text-black text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/20"
              >
                <Plus size={14} className="stroke-[3]" />
                New Chat
              </button>
            </div>

            {/* Mindset Presets Navigation */}
            <div className="px-4 py-2 flex-none">
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block mb-2 px-2">Ecosystem Presets</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'chat', label: 'General', icon: MessageSquare },
                  { id: 'deep-thinker', label: 'Reasoning', icon: BrainCircuit },
                  { id: 'code-arch', label: 'Technical', icon: Cpu },
                  { id: 'storyteller', label: 'Creative', icon: Sparkles },
                  { id: 'marketing', label: 'Business', icon: Zap },
                  { id: 'medical-pro', label: 'Nurse Pro', icon: MessageCircle }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePersonality(preset.id);
                      handleCreateNewChat(preset.id);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all active:scale-95",
                      activePersonality === preset.id 
                        ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-200" 
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 text-stone-400 hover:text-stone-200"
                    )}
                  >
                    <preset.icon size={13} className={activePersonality === preset.id ? "text-indigo-400" : "text-stone-500"} />
                    <span className="text-[10px] font-bold tracking-tight truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Historic Thread Sessions Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 customized-scrollbar-dark select-none">
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block mb-3 px-2">Stored Sessions</span>
              
              {sessionsLoading ? (
                <div className="flex items-center gap-2 px-2 text-stone-500 py-4">
                  <Loader2 className="animate-spin text-indigo-500" size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Retrieving logs...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-[10px] uppercase font-bold tracking-widest text-stone-600 px-2 py-4 italic">
                  No previous records.
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((sess) => {
                    const isSelected = activeSessionId === sess.id;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => {
                          setActiveSessionId(sess.id);
                          setActivePersonality(sess.personality);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all text-xs border",
                          isSelected 
                            ? "bg-white/10 border-white/10 text-white" 
                            : "bg-transparent border-transparent text-stone-400 hover:bg-white/[0.03] hover:text-stone-200"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <MessageSquare size={13} className={isSelected ? "text-indigo-400" : "text-stone-600"} />
                          <span className="font-medium truncate pr-1 text-[11px] leading-tight block">
                            {sess.title}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-stone-500 hover:text-red-400 transition-all"
                          title="Delete conversation"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Profile Panel Footer */}
            <div className="p-4 border-t border-white/5 flex-none bg-[#09090A] space-y-3">
              {isAdmin && onBackToAdmin && (
                <button 
                  onClick={onBackToAdmin}
                  className="w-full py-2 bg-indigo-600/25 hover:bg-indigo-600 border border-indigo-500/20 text-white font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all"
                >
                  Admin Panel
                </button>
              )}

              <div 
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => setIsProfileOpen(true)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white outline outline-2 outline-indigo-500/20 flex-shrink-0">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <span className="text-[10px] font-bold text-stone-300 block truncate">{userEmail}</span>
                    <span className="text-[8px] font-black tracking-widest text-[#22C55E] uppercase block mt-0.5">Online Node</span>
                  </div>
                </div>
                <ChevronDown size={14} className="text-stone-500" />
              </div>

              <button 
                onClick={onLogout}
                className="w-full py-2.5 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-400/80 hover:text-red-400 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 transition-colors hover:bg-red-500/[0.02]"
              >
                <LogOut size={11} />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* CORE CHAT SCREEN STAGE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B0B0C] relative">
        
        {/* Main Sticky Header */}
        <header className="h-16 flex-none border-b border-white/5 flex justify-between items-center px-6 bg-[#09090A] z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-white/5 border border-white/5 rounded-xl text-stone-400 hover:text-white transition-all hover:scale-105"
              >
                <Menu size={18} />
              </button>
            )}
            
            {/* Model Engine Selector (Gemini style dropdown) */}
            <div className="relative">
              <button 
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-stone-300 transition-all active:scale-95"
              >
                <Sparkles size={14} className="text-purple-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">{activeModel}</span>
                <ChevronDown size={12} className="text-stone-500 mt-0.5" />
              </button>

              <AnimatePresence>
                {isModelDropdownOpen && (
                  <>
                    <div 
                      onClick={() => setIsModelDropdownOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#141416] border border-white/10 shadow-2xl p-2 z-50 space-y-1 block"
                    >
                      {[
                        { name: 'AkinAI v4 Core (Ultrafast)', desc: 'High speed pipeline for everyday responses.' },
                        { name: 'AkinAI v4 Thought (Deep Reasoning)', desc: 'Multistep logical reasoning for complex codes.' },
                        { name: 'AkinAI Scholar Engine', desc: 'Curriculum-expert system for medical & clinical aids.' }
                      ].map((m) => (
                        <button
                          key={m.name}
                          onClick={() => {
                            setActiveModel(m.name);
                            setIsModelDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full p-2.5 text-left rounded-xl transition-colors block",
                            activeModel === m.name ? "bg-white/5 text-white" : "text-stone-400 hover:bg-white/[0.03]"
                          )}
                        >
                          <span className="text-[11px] font-black uppercase tracking-wider block">{m.name}</span>
                          <span className="text-[9px] text-stone-500 font-medium block mt-0.5">{m.desc}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Founder Hub Badge */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
              <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">Node Core active</span>
            </div>

            {/* Support Community Link */}
            <a 
              href="https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-md shadow-indigo-600/10"
            >
              <MessageCircle size={12} fill="currentColor" />
              Join Core
            </a>
          </div>
        </header>

        {/* Messaging Box Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-12 scroll-smooth customized-scrollbar relative z-15">
          <div className="max-w-3xl mx-auto w-full">
            
            {messages.length === 0 ? (
              /* EMPTY CHAT PRESENTS SCREEN */
              <div className="h-full flex flex-col items-center justify-center py-16 md:py-24 space-y-12">
                <div className="text-center space-y-5">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="relative inline-block mb-3"
                  >
                    <div className="absolute inset-0 bg-indigo-600 blur-[50px] opacity-15" />
                    <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-indigo-500 to-indigo-700 p-0.5 relative z-10 flex items-center justify-center shadow-lg">
                      <div className="w-full h-full bg-[#0D0D10] rounded-[30px] flex items-center justify-center">
                        <AudioLines size={40} className="text-indigo-400" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase whitespace-nowrap bg-gradient-to-r from-white via-indigo-200 to-stone-400 bg-clip-text text-transparent">
                      I am AkinAI.
                    </h2>
                    <p className="text-stone-400 text-sm md:text-base font-serif italic max-w-md mx-auto">
                      "Built by Akin S. Sokpah. Integrating clinical pharmacology, software development, creative writing, and high-stakes strategy."
                    </p>
                  </div>
                </div>

                {/* Grid suggestions prompts */}
                <div className="w-full space-y-4">
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.34em] text-center block">
                    Curated Prompt Blueprints
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {SUGGESTION_PROMPTS.map((item, index) => (
                      <motion.button 
                        key={index}
                        whileHover={{ y: -4, scale: 1.01 }}
                        onClick={() => {
                          setInput(item.text);
                          setActivePersonality(item.presetId);
                        }}
                        className="p-5 rounded-2xl bg-[#141416] hover:bg-[#1C1C1F] border border-white/5 hover:border-white/10 text-left transition-all group flex gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 text-indigo-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-300 transition-colors">
                          <item.icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-300 mb-1 leading-none">
                            {item.label}
                          </h4>
                          <p className="text-xs text-stone-500 group-hover:text-stone-300 transition-colors line-clamp-2 leading-relaxed">
                            "{item.text}"
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* CHAT SESSION MESSAGES TIMELINE */
              <div className="space-y-10 pb-44">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-600/[0.03] border border-indigo-500/10">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xs">
                    <Sparkles size={12} />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                    Synchronized with AkinAI Mindset: {getCurrentPersonalityName()}
                  </span>
                </div>

                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  return (
                    <div key={index} className="space-y-4">
                      <div className={cn(
                        "flex items-start gap-4 md:gap-6",
                        isUser ? "flex-row-reverse" : "flex-row"
                      )}>
                        {/* Avatar */}
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border flex-shrink-0",
                          isUser 
                            ? "bg-indigo-600 border-indigo-500 text-white" 
                            : "bg-[#141416] border-white/5 text-purple-400"
                        )}>
                          {isUser ? userEmail.charAt(0).toUpperCase() : <AudioLines size={14} />}
                        </div>

                        {/* Speech Bubble / Content */}
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 leading-none",
                            isUser ? "text-right" : "text-left"
                          )}>
                            {isUser ? 'User Core' : 'AkinAI Sync'}
                          </div>

                          <div className={cn(
                            "rounded-2xl text-stone-100 max-w-full leading-relaxed text-[15px]",
                            isUser 
                              ? "bg-white/[0.04] p-4 font-medium border border-white/5 ml-auto inline-block text-right" 
                              : "py-1 text-left"
                          )}>
                            {isUser ? (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            ) : (
                              <div className="markdown-body">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            )}
                          </div>

                          {/* Quick Toolbar for model messages */}
                          {!isUser && message.content && (
                            <div className="flex items-center gap-1.5 mt-3 text-stone-500">
                              <button 
                                onClick={() => copyToClipboard(message.content, index)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors hover:text-white"
                                title="Copy response text"
                              >
                                {copiedIndex === index ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
                              </button>
                              <button 
                                onClick={() => handleSpeakerPlayback(message.content)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors hover:text-white"
                                title="Read response aloud (Speech synthesis)"
                              >
                                <Volume2 size={14} />
                              </button>
                              <button className="p-2 hover:bg-white/5 rounded-xl transition-colors hover:text-white" title="Thumbs up">
                                <ThumbsUp size={14} />
                              </button>
                              <button className="p-2 hover:bg-white/5 rounded-xl transition-colors hover:text-white" title="Thumbs down">
                                <ThumbsDown size={14} />
                              </button>
                              <button className="p-2 hover:bg-white/5 rounded-xl transition-colors hover:text-white" title="Share discussion">
                                <Share2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-9 h-9 rounded-xl bg-[#141416] border border-white/5 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="animate-spin text-indigo-500" size={16} />
                    </div>
                    <div className="flex-1 space-y-3 pt-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-600 animate-pulse block">
                        AkinAI thought processor active...
                      </span>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 absolute inset-y-0 w-1/3 rounded-full animate-marquee" />
                      </div>
                      <div className="h-2 w-5/6 bg-white/5 rounded-full" />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT FORM CONTROLS: Absolute sticky positioned */}
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/90 to-transparent z-20">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* Direct prompt formulation form representation */}
            <form onSubmit={handleSubmit} className="relative flex items-end bg-[#141416] rounded-3xl p-2 border border-white/5 focus-within:border-white/10 shadow-2xl transition-all">
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 flex items-center justify-center text-stone-500 hover:text-white rounded-2xl transition-colors flex-shrink-0 hover:bg-white/5"
                title="Attach file payload"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,application/pdf,text/*" 
              />

              <div className="flex-1 relative flex flex-col justify-end min-w-0 px-2 py-2">
                <textarea
                  ref={textInputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={
                    activePersonality 
                      ? `Interact with AkinAI ${getCurrentPersonalityName()}...` 
                      : "Reply to AkinAI..."
                  }
                  className="w-full bg-transparent outline-none text-[15px] leading-relaxed font-medium text-white placeholder:text-stone-500 resize-none max-h-36 py-1 pr-12 min-h-[36px]"
                />
                
                {/* Visual Attachment preview */}
                <AnimatePresence>
                  {attachedFile && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full left-0 mb-3 p-2 bg-[#1C1C1F] border border-white/10 rounded-2xl flex items-center gap-3 shadow-2xl z-30"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                        {attachedFile.type.startsWith('image/') ? <ImageIcon size={14} /> : <FileIcon size={14} />}
                      </div>
                      <span className="text-[10px] font-bold text-stone-300 truncate max-w-[120px]">
                        {attachedFile.name}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setAttachedFile(null)} 
                        className="p-1 text-white/50 hover:text-white bg-white/5 rounded-full"
                      >
                        <CloseIcon size={10} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons: Voice Input indicator or Submit */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setInput("Listen to voice sync...")}
                  className="w-12 h-12 flex items-center justify-center text-stone-400 hover:text-white rounded-2xl transition-colors hover:bg-white/5"
                  title="Voice dictation input"
                >
                  <Mic size={18} />
                </button>
                
                {(input.trim() || attachedFile) ? (
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-12 h-12 rounded-2xl bg-white text-black hover:bg-stone-200 flex items-center justify-center transition-all active:scale-95 shadow-md flex-shrink-0"
                  >
                    <Send size={16} fill="currentColor" />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setInput("Simulated neural voice telemetry activated")}
                    className="w-12 h-12 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 flex items-center justify-center transition-all flex-shrink-0"
                    title="Audio stream wave"
                  >
                    <AudioLines size={18} className="animate-pulse" />
                  </button>
                )}
              </div>
            </form>

            <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest text-center block">
              AkinAI can make mistakes. Always verify medical dosages, coding patterns, and legal blueprints.
            </span>
          </div>
        </div>
      </main>

      {/* POPUP FULL DIALOG: Profile, Founder & Mobile Money donation details */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
              onClick={() => setIsProfileOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0F0F10] border border-white/10 rounded-3xl p-8 z-50 shadow-2xl relative select-none"
            >
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              >
                <CloseIcon size={16} />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                {/* Profile Avatar Card */}
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-30" />
                  <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] relative z-10 overflow-hidden">
                    <div className="w-full h-full bg-[#070708] rounded-[38px] overflow-hidden">
                      <img 
                        src="https://www.image2url.com/r2/default/images/1778929771651-e009e7f8-04ee-4936-b20d-662457f923fc.png" 
                        alt="Akin S. Sokpah" 
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Akin S. Sokpah</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.34em]">Founder & Systems Architect</p>
                </div>

                <p className="text-xs text-stone-400 font-medium leading-relaxed max-w-sm italic">
                  "Advancing high-performance machine learning ecosystems from Montserrado, Liberia to inspire the global digital frontier."
                </p>

                {/* Secure donation support card config */}
                <div className="w-full p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-left space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">Supporting the Initiative</h4>
                  <p className="text-[10px] font-bold text-stone-400 leading-normal">
                    This AI platform model represents the climax of Liberian computational craftsmanship. Direct donations support training clusters in Mount Barclay.
                  </p>
                  <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-1">Mobile Money Support PIN</span>
                    <span className="text-base font-black text-white tracking-widest block">+231 889 792 996</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                  <a 
                    href="https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo" 
                    target="_blank" rel="noreferrer"
                    className="p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/15"
                  >
                    Join Creator Core
                    <ExternalLink size={11} />
                  </a>
                  <button 
                    onClick={() => setIsProfileOpen(false)}
                    className="p-3.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-stone-300 text-center text-[10px] font-black uppercase tracking-widest"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
