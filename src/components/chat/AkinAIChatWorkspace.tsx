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
  MessageCircle,
  Smartphone,
  Laptop
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activePersonality, setActivePersonality] = useState<string>('chat');
  const [activeModel, setActiveModel] = useState<string>('AkinAI v4 Core (Ultrafast)');
  
  // Custom Phone Simulation / APK Frame States
  const [osType, setOsType] = useState<'ios' | 'android'>('ios');
  const [viewMode, setViewMode] = useState<'device' | 'fullscreen'>('device');
  const [batteryPercent, setBatteryPercent] = useState(97);
  const [signalStrength, setSignalStrength] = useState<'strong' | 'medium' | 'weak'>('strong');
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [isBooting, setIsBooting] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isVolumeHudOpen, setIsVolumeHudOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Auto-clock updates for phone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: false 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Soft auto-draining battery representation
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryPercent(prev => {
        if (prev <= 5) return 100; // soft reset
        return prev - 1;
      });
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const handlePowerCycle = () => {
    if (isPowerOn) {
      setIsPowerOn(false);
    } else {
      setIsBooting(true);
      setTimeout(() => {
        setIsBooting(false);
        setIsPowerOn(true);
      }, 1500);
    }
  };

  const handleAdjustVolume = (delta: number) => {
    setVolume(prev => {
      const next = Math.min(100, Math.max(0, prev + delta));
      return next;
    });
    setIsVolumeHudOpen(true);
  };

  useEffect(() => {
    if (isVolumeHudOpen) {
      const timer = setTimeout(() => setIsVolumeHudOpen(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isVolumeHudOpen, volume]);

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

  // Render the inner application (sidebar handles, messages thread timeline, form inputs)
  const renderPhoneViewportInner = () => {
    if (!isPowerOn) {
      return (
        <div id="device-poweroff-screen" className="w-full h-full bg-[#030304] flex flex-col items-center justify-center p-8 text-center select-none relative">
          <div className="absolute inset-0 bg-stone-950/20" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-16 h-16 rounded-full border border-stone-800 flex items-center justify-center mb-6 relative z-10"
          >
            <Cpu size={24} className="text-stone-700 animate-pulse" />
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 z-10">AKINAI OS OFFLINE</p>
          <span className="text-[11px] text-stone-500 font-medium z-10 max-w-xs leading-relaxed">
            The neural core has entered cold-shutdown mode. Hold/Press the power bezel button on the right-side or click below to reboot the system.
          </span>
          <button 
            id="boot-btn"
            type="button"
            onClick={handlePowerCycle}
            className="mt-6 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 border border-indigo-400/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 shadow-lg shadow-indigo-600/15"
          >
            Launch System Core
          </button>
        </div>
      );
    }

    if (isBooting) {
      return (
        <div id="device-boot-screen" className="w-full h-full bg-black flex flex-col items-center justify-center p-8 select-none relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="space-y-6 text-center z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 border-t-2 border-indigo-500 border-r-2 border-r-purple-500 rounded-full mx-auto"
            />
            <div className="space-y-1.5">
              <h4 className="text-xs font-black italic uppercase tracking-wider text-white">AkinAI v4 Core</h4>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.25em] animate-pulse">Synchronizing OS Kernels...</p>
            </div>
            
            <div className="max-w-[220px] text-left text-[8px] font-mono text-stone-600 space-y-0.5 border-t border-white/5 pt-4 inline-block">
              <div className="truncate">&gt; LOADING COGNITIVE ARRAYS... SUCCESS</div>
              <div className="truncate">&gt; INGESTING CLINICAL PARADIGMS... SECURE</div>
              <div className="truncate">&gt; BINDING VERIFY DEPLOYMENTS... OK</div>
              <div className="truncate">&gt; SECURING SERVERLESS API HOOK... READY</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex relative overflow-hidden bg-[#070708]">
        {/* LEFT SIDEBAR PANEL: Sleek Slate Obsidian */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <>
              {/* Sidebar backdrop overlay on mobile frame layout */}
              <div 
                id="sidebar-overlay"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden cursor-pointer w-full h-full"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.aside 
                id="sidebar-panel"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                className="absolute left-0 top-0 bottom-0 z-40 w-[240px] bg-[#0D0D0E] h-full flex flex-col border-r border-white/5 overflow-hidden"
              >
                {/* Sidebar Branding */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div 
                    id="sidebar-brand-trigger"
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => handleCreateNewChat('chat')}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
                      <AudioLines size={14} className="text-white animate-pulse" />
                    </div>
                    <div>
                      <h1 className="text-xs font-black uppercase tracking-widest leading-none bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
                        AkinAI
                      </h1>
                      <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-widest block mt-0.5">By Akin S. Sokpah</span>
                    </div>
                  </div>
                  
                  <button 
                    id="close-sidebar-btn"
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/5 text-stone-400 hover:text-white transition-colors"
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>

                {/* Quick Action: New Conversation */}
                <div className="p-3 flex-none">
                  <button 
                    id="new-chat-btn"
                    onClick={() => handleCreateNewChat('chat')}
                    className="w-full py-2.5 bg-white hover:bg-stone-100 text-black text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/20"
                  >
                    <Plus size={12} className="stroke-[3]" />
                    New Chat
                  </button>
                </div>

                {/* Mindset Presets Navigation */}
                <div className="px-3 py-1 flex-none">
                  <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-1 px-1">Presets</span>
                  <div className="grid grid-cols-2 gap-1">
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
                        id={`preset-btn-${preset.id}`}
                        onClick={() => {
                          setActivePersonality(preset.id);
                          handleCreateNewChat(preset.id);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all active:scale-95",
                          activePersonality === preset.id 
                            ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-200" 
                            : "bg-white/[0.02] border-white/5 hover:bg-white/5 text-stone-400 hover:text-stone-200"
                        )}
                      >
                        <preset.icon size={11} className={activePersonality === preset.id ? "text-indigo-400" : "text-stone-500"} />
                        <span className="text-[9px] font-bold tracking-tight truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Historic Thread Sessions Container */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 customized-scrollbar-dark select-none">
                  <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-2 px-1">Sessions</span>
                  
                  {sessionsLoading ? (
                    <div className="flex items-center gap-1.5 px-1 text-stone-500 py-2">
                      <Loader2 className="animate-spin text-indigo-500" size={12} />
                      <span className="text-[9px] uppercase font-bold tracking-widest">Loading logs...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-[9px] uppercase font-bold tracking-widest text-stone-600 px-1 py-2 italic">
                      No logs.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {sessions.map((sess) => {
                        const isSelected = activeSessionId === sess.id;
                        return (
                          <div
                            key={sess.id}
                            id={`session-item-${sess.id}`}
                            onClick={() => {
                              setActiveSessionId(sess.id);
                              setActivePersonality(sess.personality);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-all text-xs border",
                              isSelected 
                                ? "bg-white/10 border-white/10 text-white" 
                                : "bg-transparent border-transparent text-stone-400 hover:bg-white/[0.03] hover:text-stone-200"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-1">
                              <MessageSquare size={11} className={isSelected ? "text-indigo-400" : "text-stone-600"} />
                              <span className="font-medium truncate text-[10px] leading-tight block">
                                {sess.title}
                              </span>
                            </div>
                            <button
                              id={`delete-session-btn-${sess.id}`}
                              onClick={(e) => handleDeleteSession(e, sess.id)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/10 text-stone-500 hover:text-red-400 transition-all"
                              title="Delete conversation"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* User Profile Panel Footer */}
                <div className="p-3 border-t border-white/5 flex-none bg-[#09090A] space-y-2">
                  <div 
                    id="user-profile-trigger"
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white outline outline-2 outline-indigo-500/20 flex-shrink-0">
                        {userEmail.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <span className="text-[10px] font-bold text-stone-300 block truncate">{userEmail}</span>
                        <span className="text-[7.5px] font-black tracking-widest text-[#22C55E] uppercase block mt-0.5">Online Node</span>
                      </div>
                    </div>
                    <ChevronDown size={12} className="text-stone-500" />
                  </div>

                  <button 
                    id="signout-btn"
                    onClick={onLogout}
                    className="w-full py-2 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-400/80 hover:text-red-400 font-bold uppercase tracking-widest text-[8px] flex items-center justify-center gap-1 transition-colors hover:bg-red-500/[0.02]"
                  >
                    <LogOut size={10} />
                    Sign Out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* CORE CHAT SCREEN STAGE */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B0B0C] relative">
          
          {/* Main Sticky Header */}
          <header className="h-14 flex-none border-b border-white/5 flex justify-between items-center px-4 bg-[#09090A] z-30">
            <div className="flex items-center gap-2.5">
              {!isSidebarOpen && (
                <button 
                  id="open-sidebar-btn"
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-stone-400 hover:text-white transition-all hover:scale-105"
                >
                  <Menu size={16} />
                </button>
              )}
              
              {/* Model Engine Selector */}
              <div className="relative">
                <button 
                  id="header-engine-selector"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-stone-300 transition-all active:scale-95"
                >
                  <Sparkles size={11} className="text-purple-400 animate-pulse" />
                  <span className="text-[9.5px] font-black uppercase tracking-wider">{activeModel.split(' ')[0]} v4</span>
                  <ChevronDown size={10} className="text-stone-500 mt-0.5" />
                </button>

                <AnimatePresence>
                  {isModelDropdownOpen && (
                    <>
                      <div 
                        id="model-dropdown-backdrop"
                        onClick={() => setIsModelDropdownOpen(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div 
                        id="model-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 mt-2 w-52 rounded-xl bg-[#141416] border border-white/10 shadow-2xl p-1.5 z-50 space-y-0.5 block"
                      >
                        {[
                          { name: 'AkinAI v4 Core (Ultrafast)', desc: 'Speedy response pipeline.' },
                          { name: 'AkinAI v4 Thought (Deep Reasoning)', desc: 'Multistep debug & logic.' },
                          { name: 'AkinAI Scholar Engine', desc: 'Expert medical aid.' }
                        ].map((m) => (
                          <button
                            key={m.name}
                            id={`model-option-${m.name}`}
                            onClick={() => {
                              setActiveModel(m.name);
                              setIsModelDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full p-2 text-left rounded-lg transition-colors block",
                              activeModel === m.name ? "bg-white/5 text-white" : "text-stone-400 hover:bg-white/[0.03]"
                            )}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider block">{m.name}</span>
                            <span className="text-[8px] text-stone-500 font-medium block mt-0.5">{m.desc}</span>
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a 
                id="header-core-link"
                href="https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo"
                target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md shadow-indigo-600/10"
              >
                <MessageCircle size={10} fill="currentColor" />
                Join
              </a>
            </div>
          </header>

          {/* Messaging Box Area - Handled specifically on mobile to let scrolls survive inputs */}
          <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth customized-scrollbar relative z-15 pb-24">
            <div className="max-w-3xl mx-auto w-full">
              
              {messages.length === 0 ? (
                /* EMPTY CHAT PRESENTS SCREEN */
                <div className="h-full flex flex-col items-center justify-center py-8 space-y-6">
                  <div className="text-center space-y-3">
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="relative inline-block"
                    >
                      <div className="absolute inset-0 bg-indigo-600/15 blur-[25px] rounded-full" />
                      <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-indigo-500 to-indigo-700 p-0.5 relative z-10 flex items-center justify-center shadow-lg">
                        <div className="w-full h-full bg-[#0D0D10] rounded-[20px] flex items-center justify-center animate-pulse">
                          <AudioLines size={24} className="text-indigo-400" />
                        </div>
                      </div>
                    </motion.div>
                    
                    <div className="space-y-1">
                      <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap bg-gradient-to-r from-white via-indigo-200 to-stone-400 bg-clip-text text-transparent">
                        I am AkinAI.
                      </h2>
                      <p className="text-stone-400 text-[11px] font-serif italic max-w-xs mx-auto leading-normal">
                        "Built by Akin S. Sokpah. Integrating Clinical pharmacology, high-stakes medical layouts, coding architectures."
                      </p>
                    </div>
                  </div>

                  {/* Grid suggestions prompts */}
                  <div className="w-full space-y-2 max-w-sm mx-auto">
                    <span className="text-[8px] font-black text-stone-500 uppercase tracking-[0.3em] text-center block">
                      Curated Blueprints
                    </span>
                    
                    <div className="grid grid-cols-1 gap-2 w-full">
                      {SUGGESTION_PROMPTS.slice(0, 3).map((item, index) => (
                        <motion.button 
                          key={index}
                          id={`suggestion-btn-${index}`}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => {
                            setInput(item.text);
                            setActivePersonality(item.presetId);
                          }}
                          className="p-3 rounded-lg bg-[#141416] hover:bg-[#1C1C1F] border border-white/5 hover:border-white/10 text-left transition-all group flex gap-2.5 items-center"
                        >
                          <div className="w-6.5 h-6.5 rounded bg-white/[0.04] flex items-center justify-center flex-shrink-0 text-indigo-400 group-hover:bg-indigo-600/10 transition-colors">
                            <item.icon size={12} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[8.5px] font-black uppercase tracking-wider text-stone-400 leading-none mb-0.5">
                              {item.label}
                            </h4>
                            <p className="text-[10.5px] text-stone-500 group-hover:text-stone-300 transition-colors line-clamp-1 leading-normal">
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
                <div className="space-y-4 pb-24">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-600/[0.03] border border-indigo-500/10">
                    <div className="w-4.5 h-4.5 rounded bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                      <Sparkles size={10} />
                    </div>
                    <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest block">
                      Ecosystem: {getCurrentPersonalityName()}
                    </span>
                  </div>

                  {messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                      <div key={index} className="space-y-1">
                        <div className={cn(
                          "flex items-start gap-2.5",
                          isUser ? "flex-row-reverse" : "flex-row"
                        )}>
                          {/* Avatar */}
                          <div className={cn(
                            "w-7 h-7 rounded bg-[#141416] flex items-center justify-center text-[10px] font-black border flex-shrink-0",
                            isUser 
                              ? "border-indigo-505/40 text-indigo-400 bg-indigo-950/20" 
                              : "border-white/5 text-purple-400"
                          )}>
                            {isUser ? userEmail.charAt(0).toUpperCase() : <AudioLines size={11} />}
                          </div>

                          {/* Speech Bubble / Content */}
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "text-[8px] font-black uppercase tracking-widest text-stone-500 mb-0.5 block leading-none",
                              isUser ? "text-right" : "text-left"
                            )}>
                              {isUser ? 'User' : 'AkinAI Sync'}
                            </div>

                            <div className={cn(
                              "rounded-lg text-stone-200 max-w-full leading-relaxed text-[12.5px] break-words",
                              isUser 
                                ? "bg-white/[0.04] p-2.5 font-medium border border-white/5 ml-auto block text-right w-fit max-w-[85%]" 
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
                              <div className="flex items-center gap-0.5 mt-1 text-stone-500 justify-start">
                                <button 
                                  onClick={() => copyToClipboard(message.content, index)}
                                  className="p-1 hover:bg-white/5 rounded transition-colors hover:text-white"
                                  title="Copy text"
                                >
                                  {copiedIndex === index ? <Check size={11} className="text-[#22C55E]" /> : <Copy size={11} />}
                                </button>
                                <button 
                                  onClick={() => handleSpeakerPlayback(message.content)}
                                  className="p-1 hover:bg-white/5 rounded transition-colors hover:text-white"
                                  title="Voice Out"
                                >
                                  <Volume2 size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-start gap-2.5 pr-4">
                      <div className="w-7 h-7 rounded bg-[#141416] border border-white/5 flex items-center justify-center flex-shrink-0">
                        <Loader2 className="animate-spin text-indigo-500" size={11} />
                      </div>
                      <div className="flex-1 space-y-1.5 pt-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-stone-600 animate-pulse block">
                          Thinking...
                        </span>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                          <div className="h-full bg-indigo-500 absolute inset-y-0 w-1/3 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* INPUT FORM CONTROLS: Sticky positioned relative to the viewport container */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/90 to-transparent z-20">
            <div className="max-w-3xl mx-auto space-y-2">
              
              <form onSubmit={handleSubmit} className="relative flex items-end bg-[#141416] rounded-xl p-1 border border-white/5 focus-within:border-white/10 shadow-lg transition-all">
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-white rounded-lg transition-colors flex-shrink-0 hover:bg-white/5"
                  title="Attach file"
                >
                  <Paperclip size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="image/*,application/pdf,text/*" 
                />

                <div className="flex-1 relative flex flex-col justify-end min-w-0 px-1 py-1">
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
                        ? `${getCurrentPersonalityName().split(' ')[0]}...` 
                        : "Reply..."
                    }
                    className="w-full bg-transparent outline-none text-[12px] leading-normal font-medium text-white placeholder:text-stone-600 resize-none max-h-16 py-0.5 pr-6 min-h-[20px] focus:ring-0 border-0"
                  />
                  
                  {/* Visual Attachment preview */}
                  <AnimatePresence>
                    {attachedFile && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full left-0 mb-1.5 p-1 bg-[#1C1C1F] border border-white/10 rounded-lg flex items-center gap-1.5 shadow-xl z-30"
                      >
                        <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white">
                          {attachedFile.type.startsWith('image/') ? <ImageIcon size={10} /> : <FileIcon size={10} />}
                        </div>
                        <span className="text-[7.5px] font-bold text-stone-300 truncate max-w-[80px]">
                          {attachedFile.name}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setAttachedFile(null)} 
                          className="p-0.5 text-white/50 hover:text-white bg-white/5 rounded-full"
                        >
                          <CloseIcon size={6} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submittal buttons */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setInput("Listen to voice sync...")}
                    className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-white rounded-lg transition-colors hover:bg-white/5"
                    title="Voice dictation"
                  >
                    <Mic size={14} />
                  </button>
                  
                  {(input.trim() || attachedFile) ? (
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-8 h-8 rounded-lg bg-white text-black hover:bg-stone-200 flex items-center justify-center transition-all active:scale-95 shadow flex-shrink-0"
                    >
                      <Send size={11} fill="currentColor" />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setInput("Simulated neural voice telemetry activated")}
                      className="w-8 h-8 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 flex items-center justify-center transition-all flex-shrink-0"
                      title="Waves"
                    >
                      <AudioLines size={14} className="animate-pulse" />
                    </button>
                  )}
                </div>
              </form>

              <span className="text-[7.5px] font-black text-stone-600 uppercase tracking-widest text-center block leading-none">
                AkinAI can make decisions error, confirm dosages.
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // View mode simulation wrapper
  return (
    <div className="min-h-screen w-full bg-[#050506] text-stone-200 flex flex-col md:flex-row font-sans overflow-x-hidden md:overflow-hidden select-none">
      
      {/* SIDE CONTROL DECK PANEL - SLEEK CYBERPUNK LAB CONTROLLER */}
      {viewMode === 'device' && (
        <div className="w-full md:w-80 lg:w-96 bg-[#0B0B0C] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 space-y-6 md:h-screen md:overflow-y-auto customized-scrollbar-dark flex-shrink-0 relative z-30">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Cpu size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.34em] text-neutral-400">Simulator Hub</span>
            </div>
            <h2 className="text-xl font-black italic bg-gradient-to-r from-white via-indigo-300 to-stone-400 bg-clip-text text-transparent uppercase tracking-tighter">
              AkinAI Mobile Lab
            </h2>
            <p className="text-xs text-stone-500 font-medium leading-relaxed mt-1">Configure and preview real-time iOS/Android client responses, frame simulation, battery telemetry, and volume HUD states.</p>
          </div>

          <div className="space-y-4">
            <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest block border-b border-white/5 pb-1">Core Emulator Settings</span>
            
            {/* View Mode Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Render Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setViewMode('device')}
                  className={cn(
                    "py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5",
                    viewMode === 'device' 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : "bg-[#141416] border-white/5 text-stone-400 hover:text-white"
                  )}
                >
                  <Smartphone size={12} />
                  Simulated APK
                </button>
                <button
                  onClick={() => setViewMode('fullscreen')}
                  className={cn(
                    "py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5",
                    viewMode === 'fullscreen' 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : "bg-[#141416] border-white/5 text-stone-400 hover:text-white"
                  )}
                >
                  <Laptop size={12} />
                  Fullscreen SPA
                </button>
              </div>
            </div>

            {/* Operating System Switcher */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Simulated Frame Spec</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOsType('ios')}
                  className={cn(
                    "py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                    osType === 'ios' 
                      ? "bg-white text-black border-transparent font-black" 
                      : "bg-[#141416] border-white/5 text-stone-400 hover:text-white"
                  )}
                >
                  Apple iOS (iPhone)
                </button>
                <button
                  onClick={() => setOsType('android')}
                  className={cn(
                    "py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                    osType === 'android' 
                      ? "bg-indigo-950/50 border-indigo-500/30 text-indigo-200" 
                      : "bg-[#141416] border-white/5 text-stone-400 hover:text-white"
                  )}
                >
                  Android APK
                </button>
              </div>
            </div>

            {/* Battery percentage adjustments */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-stone-400 pb-1">
                <span>Charge Telemetry</span>
                <span className="text-white">{batteryPercent}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={batteryPercent} 
                onChange={(e) => setBatteryPercent(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Signal Strength Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 block">Network Speed Signal</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['strong', 'medium', 'weak'] as const).map(strength => (
                  <button
                    key={strength}
                    onClick={() => setSignalStrength(strength)}
                    className={cn(
                      "py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                      signalStrength === strength 
                        ? "bg-stone-800 border-white/20 text-white" 
                        : "bg-transparent border-transparent text-stone-500 hover:text-stone-300"
                    )}
                  >
                    {strength}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume adjustments */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-stone-400 pb-1">
                <span>Ringer Volume</span>
                <span className="text-white">{volume}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume} 
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsVolumeHudOpen(true);
                }}
                className="w-full accent-indigo-500 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Power Cycle Button */}
            <div className="pt-2">
              <button
                onClick={handlePowerCycle}
                className={cn(
                  "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-[0.98]",
                  isPowerOn 
                    ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" 
                    : "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20 animate-pulse"
                )}
              >
                {isPowerOn ? "Shut Down Device" : "Boot Device"}
              </button>
            </div>
          </div>

          {/* Credits section in Side Deck */}
          <div className="pt-4 border-t border-white/5 space-y-3 mt-auto">
             <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl leading-relaxed text-[10px] font-medium text-stone-500">
               <span className="font-bold text-stone-400 block mb-1">PRO-GRADE DESIGN ACCORD</span>
               Fully responsive view framework. In full screen deployment (for actual physical phones), the app expands perfectly. In simulation view (for desktops), it showcases a true-to-life APK skin.
             </div>
          </div>
        </div>
      )}

      {/* VIEWPORT AREA CONTAINING DEVICE OR FULLSCREEN RENDER */}
      <div className={cn(
        "flex-1 flex items-center justify-center relative bg-[#070708] overflow-hidden",
        viewMode === 'device' ? "p-4 md:p-8 md:h-screen" : "w-full h-screen"
      )}>
        
        {/* Toggle back to simulated view if user is in fullscreen mode (floating icon top-right) */}
        {viewMode === 'fullscreen' && (
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <button
              onClick={() => setViewMode('device')}
              className="px-4 py-2 bg-black/80 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#a855f7] flex items-center gap-1.5 transition-all shadow-2xl"
              title="Show mobile simulator device skin"
            >
              <Smartphone size={12} />
              Simulated APK Frame
            </button>
          </div>
        )}

        {viewMode === 'device' ? (
          /* EMBEDDED SMARTPHONE MOBILE REZ CONTAINER */
          <div className="relative flex items-center justify-center">
            
            {/* PHYSICAL HARDWARE BUTTONS SIMULATION */}
            {/* Left Hand Volume Keys */}
            <div className="absolute left-[-4px] top-32 w-[4px] h-10 bg-stone-700/80 rounded-l-[1px] hover:bg-stone-500 transition-colors cursor-pointer z-10" onClick={() => handleAdjustVolume(10)} title="Volume Up" />
            <div className="absolute left-[-4px] top-44 w-[4px] h-10 bg-stone-700/80 rounded-l-[1px] hover:bg-stone-500 transition-colors cursor-pointer z-10" onClick={() => handleAdjustVolume(-10)} title="Volume Down" />
            
            {/* Right Hand Power Button */}
            <div className="absolute right-[-4px] top-36 w-[4px] h-12 bg-stone-700/80 rounded-r-[1px] hover:bg-stone-500 transition-colors cursor-pointer z-10" onClick={handlePowerCycle} title="Power Switch Bezel" />

            {/* MAIN PHYSICAL BEZEL CASE */}
            <div className="w-[340px] h-[720px] bg-black rounded-[52px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-stone-800/90 relative flex flex-col overflow-hidden">
               
               {/* INTERNAL SMARTPHONE VIEWSCREEN BODY */}
               <div className="w-full h-full rounded-[44px] overflow-hidden bg-black relative flex flex-col border border-stone-900">
                  
                  {/* REAL-TIME OS HEADER STATUS BAR */}
                  {isPowerOn && !isBooting && (
                    <div className="h-10 flex-none bg-[#09090A] flex justify-between items-center px-6 relative z-50 select-none">
                      
                      {/* Left: Time or notifications depending on OS Type */}
                      <span className="text-[10px] font-black text-stone-300 leading-none">
                        {currentTime}
                      </span>

                      {/* Center Element: Dynamic Island for Apple vs Small Punch Camera for Android */}
                      {osType === 'ios' ? (
                        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-5.5 bg-black rounded-full flex items-center justify-center border border-white/5 transition-all group overflow-hidden">
                          {isLoading ? (
                            <div className="flex gap-1 items-center animate-pulse">
                              <span className="w-1 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <span className="w-1 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0F0F10] border border-stone-800/50 block" />
                          )}
                        </div>
                      ) : (
                        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3 h-3 bg-black rounded-full border border-stone-800 flex items-center justify-center">
                          <span className="w-0.5 h-0.5 bg-[#1A1A1E] rounded-full" />
                        </div>
                      )}

                      {/* Right: Signals, Battery, Wifi */}
                      <div className="flex items-center gap-1.5">
                        {/* Wireless Wifi symbol check */}
                        <div className="flex gap-0.5 items-end opacity-70">
                          <span className="w-[1.5px] h-1 bg-white rounded-[1x]" />
                          <span className={cn("w-[1.5px] h-1.5 bg-white rounded-[1x]", signalStrength === 'weak' ? 'opacity-20' : 'opacity-100')} />
                          <span className={cn("w-[1.5px] h-2 bg-white rounded-[1x]", signalStrength === 'weak' || signalStrength === 'medium' ? 'opacity-20' : 'opacity-100')} />
                        </div>
                        
                        {/* Battery representation */}
                        <div className="flex items-center gap-0.5">
                          <span className="text-[8px] font-black text-stone-400">{batteryPercent}%</span>
                          <div className="w-5 h-2 rounded-[3px] border border-white/30 p-[0.5px] relative flex">
                            <div 
                              className={cn(
                                "h-full rounded-[0.5px] transition-all",
                                batteryPercent <= 15 ? "bg-red-500 animate-pulse" : "bg-[#22C55E]"
                              )} 
                              style={{ width: `${batteryPercent}%` }} 
                            />
                            <span className="absolute right-[-2px] top-[1.5px] w-0.5 h-1 bg-white/50 rounded-r-[1px]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OS VOLUME HUD LEVEL POPUP INDICATOR OVERLAY */}
                  <AnimatePresence>
                    {isVolumeHudOpen && isPowerOn && !isBooting && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={cn(
                          "absolute top-36 w-2 h-20 bg-stone-900/90 border border-white/5 rounded-full z-50 flex flex-col justify-end p-[1px] overflow-hidden backdrop-blur-md shadow-2xl",
                          osType === 'android' ? "right-3 left-auto" : "left-3"
                        )}
                      >
                        <div 
                          className="w-full bg-indigo-500 rounded-full transition-all" 
                          style={{ height: `${volume}%` }} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* EMULATOR VIEWPORT RENDER CONTAINER */}
                  <div className="flex-1 overflow-hidden relative">
                    {renderPhoneViewportInner()}
                  </div>

                  {/* REAL-TIME HOME BAR INDICATOR SHELL */}
                  {isPowerOn && !isBooting && (
                    <div className="h-6 flex-none bg-[#070708] flex items-center justify-center relative z-50">
                      {osType === 'ios' ? (
                        /* Apple bottom notch indicator */
                        <div className="w-24 h-0.5 bg-white/40 rounded-full cursor-pointer hover:bg-white transition-colors" onClick={() => handleCreateNewChat('chat')} />
                      ) : (
                        /* Android standard 3-button bottom bar simulation */
                        <div className="w-full flex justify-between items-center px-12 text-stone-500">
                          {/* Back: Left chevron triangle */}
                          <div className="cursor-pointer hover:text-white p-1" onClick={() => isSidebarOpen ? setIsSidebarOpen(false) : undefined}>
                            <ChevronDown size={11} className="rotate-90 stroke-[3]" />
                          </div>
                          {/* Home: Circle */}
                          <div className="cursor-pointer hover:text-white p-1" onClick={() => handleCreateNewChat('chat')}>
                            <span className="w-2.5 h-2.5 rounded-full border-2 border-current block" />
                          </div>
                          {/* Recents: Square */}
                          <div className="cursor-pointer hover:text-white p-1" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <span className="w-2 h-2 border-2 border-current rounded-[1px] block" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

               </div>
            </div>
            
            {/* Visual reflection on device border for extra depth premium styling */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[344px] h-[724px] rounded-[54px] border border-white/5 pointer-events-none z-0" />
          </div>
        ) : (
          /* FULL SCREEN CLEAN RENDER IF viewMode IS DIRECT CANVAS DEPLOY */
          <div className="w-full h-full relative">
            {renderPhoneViewportInner()}
          </div>
        )}

      </div>

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
                  <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-35" />
                  <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] relative z-10 overflow-hidden">
                    <div className="w-full h-full bg-[#070708] rounded-[34px] overflow-hidden">
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
                  <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Akin S. Sokpah</h3>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.34em]">Founder & Systems Architect</p>
                </div>

                <p className="text-xs text-stone-400 font-medium leading-relaxed max-w-sm italic">
                  "Advancing high-performance machine learning ecosystems from Montserrado, Liberia to inspire the global digital frontier."
                </p>

                {/* Secure donation support card config */}
                <div className="w-full p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-left space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block">Supporting the Initiative</h4>
                  <p className="text-[10px] font-bold text-stone-400 leading-normal">
                    This AI platform model represents the climax of Liberian computational craftsmanship. Direct donations support training clusters in Mount Barclay.
                  </p>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[8px] font-black text-stone-500 uppercase tracking-widest block mb-1">Mobile Money Support PIN</span>
                    <span className="text-sm font-black text-white tracking-widest block">+231 889 792 996</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                  <a 
                    href="https://chat.whatsapp.com/GYEGrtGA4lmD2PpFKDvRuo" 
                    target="_blank" rel="noreferrer"
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/15"
                  >
                    Join Creator Core
                    <ExternalLink size={11} />
                  </a>
                  <button 
                    onClick={() => setIsProfileOpen(false)}
                    className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-stone-300 text-center text-[10px] font-black uppercase tracking-widest"
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
