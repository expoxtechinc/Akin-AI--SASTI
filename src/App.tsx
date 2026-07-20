import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  RefreshCw,
  Sparkles,
  Plus,
  Mic,
  AudioLines,
  ArrowLeft,
  Trash2,
  Folder,
  Grid,
  Keyboard,
  Briefcase,
  ShieldCheck,
  Lock,
  Database,
  Bug,
  Info,
  LogOut,
  Globe,
  Image as ImageIcon,
  Search,
  Send,
  User,
  Check,
  BookOpen,
  Mail,
  Sun,
  Moon,
  Laptop,
  CheckSquare,
  AlertTriangle,
  Download,
  Terminal,
  Languages,
  MenuSquare
} from 'lucide-react';

import { auth, googleAuthProvider } from './lib/firebase.ts';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  syncUserProfile,
  UserProfile,
  getConversations,
  createConversation,
  deleteConversation,
  getMessages,
  addMessage,
  getNews,
  publishNews,
  deleteNewsItem,
  Conversation,
  Message,
  NewsItem
} from './lib/db.ts';

// Logo URL constant
const LOGO_URL = 'https://www.image2url.com/r2/default/images/1784568577839-5564067f-ad5c-45bd-8c79-138bee8a4185.jpg';

// Main Application Component
export default function App() {
  // Authentication states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Advanced actual features states
  const [activePlugins, setActivePlugins] = useState({
    searchGrounding: false,
    codeSpecialist: false,
    translator: 'None', // 'Spanish', 'French', 'German', 'Chinese', 'None'
    summarizer: false,
    creativeWriter: false
  });
  const [isPlusActive, setIsPlusActive] = useState(false);
  const [personalInstructions, setPersonalInstructions] = useState('');
  const [memoryActive, setMemoryActive] = useState(true);
  const [remoteControlStandard, setRemoteControlStandard] = useState(true);
  const [trustedContactEmail, setTrustedContactEmail] = useState('');

  // App core view states
  const [currentView, setCurrentView] = useState<'chat' | 'settings' | 'settings-advanced' | 'admin-dashboard' | 'plugins'>('chat');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appearance, setAppearance] = useState<'system' | 'light' | 'dark'>('light');
  const [accentColor, setAccentColor] = useState<'default' | 'purple' | 'blue' | 'green'>('default');

  // Chat conversation states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  // News states (admin published)
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [publishingLoading, setPublishingLoading] = useState(false);

  // PWA & Installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // UI state feedback
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('AkinAI PWA prompt ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already in standalone mode, don't show the install prompt
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle browser installation prompt
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        setFeedbackMsg('Thank you for installing AkinAI!');
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error triggering PWA installation:', err);
    }
  };

  // Helper to sync local guest conversations to Firestore on login
  const syncGuestConversationsToCloud = async (userId: string) => {
    const localConvsStr = localStorage.getItem('akinai_guest_conversations');
    if (!localConvsStr) return;

    try {
      const localConvs = JSON.parse(localConvsStr);
      if (!Array.isArray(localConvs) || localConvs.length === 0) return;

      setFeedbackMsg('Syncing local guest chats to your cloud account...');

      for (const conv of localConvs) {
        const newCloudConv = await createConversation(userId, conv.title);
        const localMsgsStr = localStorage.getItem(`akinai_guest_messages_${conv.id}`);
        if (localMsgsStr) {
          const localMsgs = JSON.parse(localMsgsStr);
          if (Array.isArray(localMsgs)) {
            for (const msg of localMsgs) {
              await addMessage(userId, newCloudConv.id, msg.role, msg.content, msg.imageUrl);
            }
          }
          localStorage.removeItem(`akinai_guest_messages_${conv.id}`);
        }
      }

      localStorage.removeItem('akinai_guest_conversations');
      setFeedbackMsg('All guest conversations synced successfully!');
      setTimeout(() => setFeedbackMsg(''), 4000);

      const updatedConvs = await getConversations(userId);
      setConversations(updatedConvs);
      if (updatedConvs.length > 0) {
        setCurrentConversation(updatedConvs[0]);
      }
    } catch (err) {
      console.error('Error syncing guest chats to cloud:', err);
    }
  };

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await syncUserProfile(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.displayName || '',
            firebaseUser.photoURL || ''
          );
          setUserProfile(profile);
          await syncGuestConversationsToCloud(firebaseUser.uid);
        } catch (err) {
          console.error('Error syncing profile:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  // Fetch Conversations and News once authenticated
  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          const convs = await getConversations(user.uid);
          setConversations(convs);
          if (convs.length > 0 && !currentConversation) {
            setCurrentConversation(convs[0]);
          }
        } catch (e) {
          console.error('Error loading conversations:', e);
        }
      }

      // Load global news announcements
      try {
        const broadcasts = await getNews();
        setNews(broadcasts);
      } catch (e) {
        console.error('Error loading news:', e);
      }
    }
    loadData();
  }, [user]);

  // Fetch Messages when currentConversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!currentConversation) {
        setMessages([]);
        return;
      }
      if (user) {
        try {
          const msgs = await getMessages(user.uid, currentConversation.id);
          setMessages(msgs);
        } catch (e) {
          console.error('Error loading messages:', e);
        }
      }
    }
    loadMessages();
  }, [currentConversation, user]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Error logging in with Google. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Custom Email/Password Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out Flow
  const handleSignOut = async () => {
    if (user) {
      await signOut(auth);
    }
    setUser(null);
    setUserProfile(null);
    setCurrentConversation(null);
    setConversations([]);
    setMessages([]);
    setCurrentView('chat');
  };

  // Create a new Conversation
  const handleCreateNewChat = async (initialTitle = 'New Chat') => {
    setIsDrawerOpen(false);
    setCurrentView('chat');
    const title = initialTitle;
    
    if (user) {
      try {
        const newConv = await createConversation(user.uid, title);
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversation(newConv);
      } catch (e) {
        console.error('Error creating conversation:', e);
      }
    }
  };

  // Delete Conversation
  const handleDeleteChat = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      try {
        await deleteConversation(user.uid, convId);
        const filtered = conversations.filter(c => c.id !== convId);
        setConversations(filtered);
        if (currentConversation?.id === convId) {
          setCurrentConversation(filtered[0] || null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Send Message Flow (Calls Express Secure API Proxy)
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue;
    if (!textToSend.trim()) return;
    if (!user) return;

    let activeConv = currentConversation;
    
    // If no active chat, create one instantly
    if (!activeConv) {
      const chatTitle = textToSend.length > 25 ? textToSend.substring(0, 25) + '...' : textToSend;
      try {
        activeConv = await createConversation(user.uid, chatTitle);
        setConversations(prev => [activeConv!, ...prev]);
        setCurrentConversation(activeConv);
      } catch (e) {
        console.error(e);
        return;
      }
    }

    if (!activeConv) return;

    // Add user message to state and DB
    const userMsgContent = textToSend;
    setInputValue('');
    
    let tempUserMsg: Message;
    try {
      tempUserMsg = await addMessage(user.uid, activeConv.id, 'user', userMsgContent);
      setMessages(prev => [...prev, tempUserMsg]);
    } catch (e) {
      console.error(e);
      return;
    }

    // Fire off request to backend Express securely
    setIsGenerating(true);
    try {
      // Gather existing messages for context
      const contextMessages = [...messages, tempUserMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Check if this is an image generation request
      const isImageRequest = userMsgContent.toLowerCase().includes('create an image') || 
                            userMsgContent.toLowerCase().includes('generate an image') ||
                            userMsgContent.toLowerCase().includes('draw a');

      let responseText = '';
      let responseImageUrl = '';

      if (isImageRequest) {
        // Query /api/generate-image
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMsgContent })
        });
        const data = await res.json();
        if (res.ok) {
          responseImageUrl = data.imageUrl;
          responseText = `Here is your generated image for: "${userMsgContent}"`;
        } else {
          throw new Error(data.error || 'Failed to generate image');
        }
      } else {
        // Query /api/chat with our active plugins config and personal instructions if provided
        const combinedInstruction = personalInstructions.trim() 
          ? `User personal customization preference:\n"${personalInstructions}"\n\nYou are AkinAI, a highly intelligent and beautiful AI mobile assistant app developed by SASTECH INC. Respond in a friendly, conversational mobile-first layout. Use markdown and formatting gracefully.`
          : undefined;

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: contextMessages,
            systemInstruction: combinedInstruction,
            plugins: activePlugins
          })
        });
        const data = await res.json();
        if (res.ok) {
          responseText = data.text;
        } else {
          throw new Error(data.error || 'Failed to communicate with AI');
        }
      }

      // Save assistant response
      const assistantMsg = await addMessage(user.uid, activeConv.id, 'model', responseText, responseImageUrl);
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      console.error(err);
      const errMsg = `Error: ${err.message || 'Something went wrong. Please check your internet connection or API Key configuration.'}`;
      const errModelMsg = await addMessage(user.uid, activeConv.id, 'model', errMsg);
      setMessages(prev => [...prev, errModelMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Publish News announcement as Admin
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) {
      setFeedbackMsg('Title and Content are required!');
      return;
    }
    setPublishingLoading(true);
    setFeedbackMsg('');
    try {
      const email = userProfile?.email || 'Admin';
      const newItem = await publishNews(newsTitle, newsContent, email);
      setNews(prev => [newItem, ...prev]);
      setNewsTitle('');
      setNewsContent('');
      setFeedbackMsg('Successfully published announcement!');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setFeedbackMsg(`Publish failed: ${err.message}`);
    } finally {
      setPublishingLoading(false);
    }
  };

  // Delete News Item
  const handleDeleteNews = async (id: string) => {
    try {
      await deleteNewsItem(id);
      setNews(prev => prev.filter(item => item.id !== id));
      setFeedbackMsg('Deleted successfully.');
      setTimeout(() => setFeedbackMsg(''), 2000);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Get active color theme classes
  const getAccentColorClass = () => {
    switch (accentColor) {
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600';
      case 'blue': return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'green': return 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600';
      default: return 'bg-[#10a37f] hover:bg-[#0e8a6c] text-white border-[#10a37f]'; // ChatGPT Default Emerald
    }
  };

  const getAccentTextClass = () => {
    switch (accentColor) {
      case 'purple': return 'text-purple-600';
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-emerald-600';
      default: return 'text-[#10a37f]';
    }
  };

  // Save profile updates to state & db
  const handleSaveProfile = async (newDisplayName: string) => {
    if (!user) return;
    try {
      // Update local profile state
      setUserProfile(prev => prev ? { ...prev, displayName: newDisplayName } : null);
      // Persist to database
      await syncUserProfile(user.uid, user.email || '', newDisplayName, user.photoURL || '');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  // Initials for Avatar Icon
  const getUserInitials = () => {
    if (userProfile?.displayName) {
      const parts = userProfile.displayName.split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return userProfile.displayName.substring(0, 2).toUpperCase();
    }
    if (userProfile?.email) {
      return userProfile.email.substring(0, 2).toUpperCase();
    }
    return 'AS';
  };

  const isDarkMode = appearance === 'dark';

  // Render Gate: If not authenticated, render Auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-teal-500 selection:text-slate-950 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col justify-between" id="auth-container" style={{ minHeight: '620px' }}>
          
          {/* Logo / Header */}
          <div className="px-8 pt-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg border border-slate-100 transform hover:rotate-6 transition-transform">
              <img src={LOGO_URL} alt="AkinAI Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">AkinAI</h1>
            <p className="text-sm text-slate-500 mt-1">Next-Gen Intelligent AI Mobile Companion</p>
            <div className="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-widest bg-slate-100 py-1 px-3 rounded-full inline-block">
              SASTECH INC SYSTEM
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-slate-950 transition-all"
                  id="auth-email-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-slate-950 transition-all"
                  id="auth-password-input"
                />
              </div>

              {authError && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-start gap-2" id="auth-error-banner">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                id="auth-submit-btn"
              >
                {authLoading ? 'Loading...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="flex justify-between items-center mt-3 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-purple-600 hover:underline font-semibold"
                id="toggle-auth-mode-btn"
              >
                {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or connect via</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Google Login & Guest Sandbox */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 bg-white shadow-sm"
                id="auth-google-btn"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <p className="text-[11px] text-center text-slate-400 max-w-[320px] mx-auto leading-normal pt-2 font-medium">
                🔒 Authenticating saves your history in the cloud forever, protecting your conversations from cache clear-outs.
              </p>
            </div>
          </div>

          {/* Footer branding */}
          <div className="bg-slate-50 px-8 py-4 text-center border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              POWERED BY AKINAI • SASTECH INC
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Active Application Frame - Styled as a fluid full-viewport responsive mobile app
  return (
    <div className="min-h-screen bg-slate-950 flex justify-center selection:bg-emerald-500 selection:text-slate-950 font-sans text-neutral-900 dark:text-neutral-100">
      <div
        className={`w-full max-w-4xl min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-white'} flex flex-col justify-between relative transition-all duration-300 shadow-2xl`}
        id="app-viewport"
      >
        
        {/* LEFT SIDEBAR / DRAWER MENU */}
        {isDrawerOpen && (
          <div className="absolute inset-0 z-50 flex" id="drawer-wrapper">
            {/* Overlay backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
              id="drawer-backdrop"
            />
            
            {/* Drawer body */}
            <div
              className={`w-[290px] h-full ${isDarkMode ? 'bg-[#171717] text-white' : 'bg-white text-slate-900'} relative z-10 p-5 flex flex-col justify-between shadow-2xl transition-transform transform translate-x-0 border-r ${isDarkMode ? 'border-neutral-800' : 'border-slate-100'}`}
              id="drawer-body"
            >
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[85%]">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                    <img src={LOGO_URL} alt="AkinAI Logo" className="w-6 h-6 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    AkinAI
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCreateNewChat('AkinAI Conversation')}
                      className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-slate-100 text-slate-500'} transition-all`}
                      title="New chat"
                      id="drawer-new-chat-shortcut"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-slate-100 text-slate-500'} transition-all`}
                      id="drawer-refresh"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Navigation links */}
                <nav className="flex flex-col gap-1 mt-2">
                  <button
                    onClick={() => { setCurrentView('chat'); setIsDrawerOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${currentView === 'chat' ? (isDarkMode ? 'bg-neutral-800 text-white' : 'bg-slate-100 text-slate-950') : 'text-neutral-500 hover:bg-neutral-800/10'}`}
                    id="nav-library"
                  >
                    <Folder className="w-4 h-4" />
                    Library
                  </button>
                  <button
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-400 hover:bg-neutral-800/10 transition-all cursor-not-allowed"
                    id="nav-projects"
                    disabled
                  >
                    <Briefcase className="w-4 h-4 text-neutral-400" />
                    Projects <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold ml-auto">PRO</span>
                  </button>
                  <button
                    onClick={() => { setCurrentView('plugins'); setIsDrawerOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${currentView === 'plugins' ? (isDarkMode ? 'bg-neutral-800 text-white' : 'bg-slate-100 text-slate-950') : 'text-neutral-500 hover:bg-neutral-800/10'}`}
                    id="nav-plugins"
                  >
                    <Grid className="w-4 h-4" />
                    Plugins
                    {Object.values(activePlugins).filter(v => v && v !== 'None').length > 0 && (
                      <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">
                        {Object.values(activePlugins).filter(v => v && v !== 'None').length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => { setCurrentView('settings-advanced'); setIsDrawerOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-500 hover:bg-neutral-800/10 transition-all text-left"
                    id="nav-more"
                  >
                    <Keyboard className="w-4 h-4" />
                    Accent & Styling
                  </button>
                </nav>

                {/* Recents Search bar */}
                <div className="relative mt-2">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={sidebarSearchQuery}
                    onChange={(e) => setSidebarSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none border ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500' : 'bg-slate-50 border-slate-100 text-slate-950 placeholder-slate-400'}`}
                    id="drawer-search-input"
                  />
                </div>

                {/* Recents List */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 px-3">
                    Recents
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto pr-1">
                    {conversations
                      .filter(c => c.title.toLowerCase().includes(sidebarSearchQuery.toLowerCase()))
                      .map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setCurrentConversation(conv);
                            setIsDrawerOpen(false);
                            setCurrentView('chat');
                          }}
                          className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${currentConversation?.id === conv.id ? (isDarkMode ? 'bg-neutral-800 text-white' : 'bg-slate-100 text-slate-950') : 'text-neutral-500 hover:bg-neutral-800/5'}`}
                        >
                          <span className="truncate max-w-[170px]">{conv.title}</span>
                          <button
                            onClick={(e) => handleDeleteChat(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    {conversations.length === 0 && (
                      <div className="text-xs text-neutral-400 italic px-3 py-2">
                        No conversations yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800" id="drawer-footer">
                <button
                  onClick={() => handleCreateNewChat('AkinAI Conversation')}
                  className={`flex-1 py-2.5 mr-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${getAccentColorClass()}`}
                  id="drawer-action-chat-btn"
                >
                  <Plus className="w-4 h-4" />
                  Chat
                </button>
                <div
                  onClick={() => {
                    setCurrentView('settings');
                    setIsDrawerOpen(false);
                  }}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs cursor-pointer select-none ring-2 ring-indigo-500 shadow-md relative"
                  id="drawer-avatar-bubble"
                >
                  {getUserInitials()}
                  {userProfile?.isAdmin && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* MAIN MODULE ROUTING AND INTERFACE */}

        {/* VIEW 1: MAIN CONVERSATION SCREEN */}
        {currentView === 'chat' && (
          <div className="h-full flex flex-col justify-between relative" id="chat-module-wrapper">
            
            {/* Header */}
            <header className={`px-4 py-3 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#1e1e1e] border-slate-800' : 'bg-white border-slate-100'} sticky top-0 z-40`} id="chat-header">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-neutral-800 text-white' : 'hover:bg-slate-100 text-slate-900'} transition-all`}
                id="header-drawer-trigger"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Get Plus Badge */}
              <button
                onClick={() => setCurrentView('settings')}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-bold tracking-wide shadow-md flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all"
                id="header-premium-trigger"
              >
                <Sparkles className="w-3 h-3 animate-pulse text-yellow-300" />
                Get Plus
              </button>

              <button
                onClick={() => handleCreateNewChat('AkinAI Conversation')}
                className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-neutral-800 text-white' : 'hover:bg-slate-100 text-slate-900'} transition-all`}
                title="New chat"
                id="header-new-chat-trigger"
              >
                <Plus className="w-5 h-5" />
              </button>
            </header>

            {/* Chat Space / Messages Stream */}
            <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${isDarkMode ? 'bg-[#151515]' : 'bg-slate-50'}`} id="messages-container">
              
              {/* Broadcast / News alerts published by Admin */}
              {news.length > 0 && (
                <div className="bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4 shadow-sm space-y-2 relative overflow-hidden" id="broadcasts-widget">
                  <div className="absolute right-2 top-2 bg-purple-600 text-white font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                    AkinAI broadcast
                  </div>
                  <h3 className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Latest System Bulletin
                  </h3>
                  <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                    {news.map((item) => (
                      <div key={item.id} className="border-b border-purple-100/60 pb-2 last:border-0 last:pb-0">
                        <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5">
                          <span>By {item.publishedBy}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty Chat Suggestions State */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-8 space-y-10" id="empty-chat-suggestions">
                  <div className="text-center space-y-2 px-6">
                    <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden shadow-md border border-slate-100">
                      <img src={LOGO_URL} alt="AkinAI Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Ask AkinAI anything</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      A beautifully crafted companion by SASTECH INC. Enjoy secure chat, intelligent image synthesis, and system bulletins.
                    </p>
                  </div>

                  {/* Suggestion list */}
                  <div className="w-full space-y-3 px-2">
                    <button
                      onClick={() => handleSendMessage('Suggest top three places to follow and read about the World Cup events.')}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all shadow-sm active:scale-95 ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800 hover:bg-neutral-800/60' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                      id="suggestion-worldcup"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Follow the World Cup</p>
                        <p className="text-[10px] text-slate-400 truncate">Ask for schedule updates and historical news</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSendMessage('Create an image of a futuristic floating library filled with crystals')}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all shadow-sm active:scale-95 ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800 hover:bg-neutral-800/60' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                      id="suggestion-image"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create an image</p>
                        <p className="text-[10px] text-slate-400 truncate">Generates realistic images with AkinAI image model</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSendMessage('What are the top highlights in modern tech system optimization?')}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all shadow-sm active:scale-95 ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800 hover:bg-neutral-800/60' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                      id="suggestion-lookups"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Look something up</p>
                        <p className="text-[10px] text-slate-400 truncate">Queries Google Search grounding for latest topics</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Active messages list */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : (isDarkMode ? 'bg-neutral-800 text-neutral-100 border border-neutral-700' : 'bg-white text-slate-900 border border-slate-100')}`}
                  >
                    {/* Role header */}
                    <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400/80 mb-1">
                      {m.role === 'user' ? 'You' : 'AkinAI'}
                    </div>

                    {/* Image presentation if exists */}
                    {m.imageUrl && (
                      <div className="mb-2.5 rounded-xl overflow-hidden shadow-md max-w-full">
                        <img src={m.imageUrl} alt="AI Art Synthesis" className="w-full object-cover max-h-[220px]" />
                      </div>
                    )}

                    {/* Content text */}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}

              {/* Generating placeholder */}
              {isGenerating && (
                <div className="flex justify-start w-full animate-pulse">
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs ${isDarkMode ? 'bg-neutral-800' : 'bg-white'} border border-neutral-800/10 shadow-sm flex items-center gap-2`}>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-slate-400 text-[10px] font-semibold">AkinAI is composing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar / Voice Waveform footer */}
            <footer className={`px-4 py-4 border-t ${isDarkMode ? 'bg-[#1e1e1e] border-slate-800' : 'bg-white border-slate-100'}`} id="chat-footer">
              <div className="flex items-center gap-2">
                
                {/* Plus Option Menu Button */}
                <button
                  onClick={() => handleCreateNewChat('AkinAI Conversation')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all active:scale-90 ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-800'}`}
                  title="New conversation"
                  id="chat-option-plus-btn"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>

                {/* Input Textbox */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    placeholder="Ask ChatGPT..." // Matches user image exactly
                    className={`w-full pl-4 pr-10 py-3 rounded-full text-xs outline-none border transition-all ${isDarkMode ? 'bg-[#151515] border-neutral-800 text-white placeholder-neutral-500 focus:border-purple-500' : 'bg-slate-50 border-slate-100 text-slate-900 placeholder-slate-400 focus:border-purple-600'}`}
                    id="chat-input-field"
                  />
                  
                  {inputValue.trim() && (
                    <button
                      onClick={() => handleSendMessage()}
                      className="absolute right-3 top-2.5 p-1 text-purple-600 hover:text-purple-700 transition-all"
                      id="chat-send-arrow-btn"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Voice sound Wave / Mic simulation buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleSendMessage('Perform speech evaluation on the current query topic.')}
                    className={`p-2.5 rounded-full flex items-center justify-center transition-all hover:bg-purple-50 hover:text-purple-600 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}
                    id="chat-mic-btn"
                    title="Voice search"
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleSendMessage('Simulate voice greeting')}
                    className={`p-2.5 rounded-full flex items-center justify-center transition-all hover:bg-purple-50 hover:text-purple-600 ${isDarkMode ? 'text-neutral-400 animate-pulse' : 'text-slate-500'}`}
                    id="chat-waveform-btn"
                    title="Audio output"
                  >
                    <AudioLines className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Company signature note */}
              <div className="text-[8px] text-slate-400 text-center mt-2.5 uppercase tracking-widest font-semibold">
                SYSTEM DESIGN BY SASTECH INC
              </div>
            </footer>
          </div>
        )}


        {/* VIEW 2: SETTINGS SCREEN */}
        {currentView === 'settings' && (
          <div className={`h-full flex flex-col justify-between ${isDarkMode ? 'bg-[#151515] text-white' : 'bg-slate-50 text-slate-900'}`} id="settings-module-wrapper">
            
            {/* Header */}
            <header className={`px-4 py-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#1e1e1e] border-slate-800' : 'bg-white border-slate-100'} sticky top-0 z-40`}>
              <button
                onClick={() => setCurrentView('chat')}
                className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'} transition-all`}
                id="settings-back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black uppercase tracking-wider">AkinAI Account</h2>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-full hover:text-red-500 transition-all"
                title="Sign Out"
                id="settings-logout-btn"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </header>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              
              {/* Profile card */}
              <div className="text-center space-y-3 pb-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    {getUserInitials()}
                  </div>
                  {userProfile?.isAdmin && (
                    <span className="absolute bottom-0 right-0 bg-red-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border-2 border-white shadow">
                      Admin
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-black tracking-tight" id="profile-name">
                    {userProfile?.displayName || 'Akin Sokpah'}
                  </h3>
                  <p className="text-xs text-slate-400" id="profile-email">
                    {userProfile?.email || 'nassboss231@gmail.com'}
                  </p>
                </div>
              </div>

              {/* Admin Panel Gateway */}
              {userProfile?.isAdmin && (
                <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-2xl p-4 shadow-md text-white space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    Authorized Administrator
                  </h4>
                  <p className="text-[10px] leading-relaxed opacity-90">
                    Welcome back! You have active system publisher credentials. Use the button below to update system news bulletins.
                  </p>
                  <button
                    onClick={() => setCurrentView('admin-dashboard')}
                    className="w-full py-2 bg-white text-slate-900 font-extrabold text-[11px] rounded-xl tracking-wider uppercase hover:bg-slate-50 active:scale-95 transition-all shadow"
                    id="admin-dashboard-trigger"
                  >
                    Launch Admin Dashboard
                  </button>
                </div>
              )}

              {/* Interactive Personalization Sub-form */}
              <div className={`rounded-2xl p-4 border ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-slate-50 border-slate-100'} space-y-3`}>
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Personalization
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={userProfile?.displayName || ''}
                      onChange={(e) => handleSaveProfile(e.target.value)}
                      placeholder="Your Name"
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-purple-500 ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Personal AI Instructions (Custom Bio/Directives)</label>
                    <textarea
                      value={personalInstructions}
                      onChange={(e) => setPersonalInstructions(e.target.value)}
                      placeholder="Tell AkinAI how to respond... (e.g., Speak warmly, call me Boss)"
                      rows={2}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-purple-500 resize-none ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                  </div>
                </div>
              </div>

              {/* My ChatGPT/AkinAI List */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 px-1">
                  My ChatGPT
                </div>
                <div className={`rounded-2xl divide-y ${isDarkMode ? 'bg-[#1e1e1e] divide-neutral-800' : 'bg-white divide-slate-100'} overflow-hidden shadow-sm border ${isDarkMode ? 'border-neutral-800' : 'border-slate-100'}`}>
                  <div className="px-4 py-3 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> Memory Engine
                    </span>
                    <button
                      onClick={() => {
                        setMemoryActive(!memoryActive);
                        setFeedbackMsg(`Memory ${!memoryActive ? 'Activated' : 'Paused'}`);
                        setTimeout(() => setFeedbackMsg(''), 2000);
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${memoryActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${memoryActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <button
                    onClick={() => { setCurrentView('plugins'); }}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-xs hover:bg-neutral-500/5 transition-all"
                  >
                    <span className="font-bold flex items-center gap-3">
                      <Grid className="w-4 h-4 text-indigo-500" /> Chat Plugins
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px]">
                      {Object.values(activePlugins).filter(v => v && v !== 'None').length > 0
                        ? `${Object.values(activePlugins).filter(v => v && v !== 'None').length} Enabled`
                        : 'Enabled'}
                    </span>
                  </button>
                  <div className="px-4 py-3 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-3">
                      <Keyboard className="w-4 h-4 text-purple-500" /> Remote Control
                    </span>
                    <button
                      onClick={() => {
                        setRemoteControlStandard(!remoteControlStandard);
                        setFeedbackMsg(`Remote control set to ${!remoteControlStandard ? 'Standard' : 'Enterprise'}`);
                        setTimeout(() => setFeedbackMsg(''), 2000);
                      }}
                      className="text-slate-500 font-black hover:underline text-[10px] uppercase tracking-wider"
                    >
                      {remoteControlStandard ? 'Standard' : 'Enterprise'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Section */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 px-1">
                  Account Workspace
                </div>
                <div className={`rounded-2xl divide-y ${isDarkMode ? 'bg-[#1e1e1e] divide-neutral-800' : 'bg-white divide-slate-100'} overflow-hidden shadow-sm border ${isDarkMode ? 'border-neutral-800' : 'border-slate-100'}`}>
                  <div className="px-4 py-3 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-emerald-600" /> Workspace
                    </span>
                    <span className="text-slate-400 text-[10px]">Personal</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsPlusActive(!isPlusActive);
                      setAccentColor(!isPlusActive ? 'purple' : 'default');
                      setFeedbackMsg(!isPlusActive ? 'Upgraded to AkinAI Plus!' : 'Switched to standard profile');
                      setTimeout(() => setFeedbackMsg(''), 3000);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-xs hover:bg-neutral-500/5 transition-all"
                  >
                    <span className="font-bold flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Upgrade to Plus
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isPlusActive ? 'bg-amber-500 text-slate-950 animate-pulse' : 'text-slate-400'}`}>
                      {isPlusActive ? 'Active' : 'Get access'}
                    </span>
                  </button>
                  <div className="px-4 py-3 flex items-center justify-between text-xs gap-4">
                    <span className="font-bold flex items-center gap-3 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-blue-500" /> Trusted Contact
                    </span>
                    <input
                      type="email"
                      value={trustedContactEmail}
                      onChange={(e) => setTrustedContactEmail(e.target.value)}
                      placeholder="verified-contact@akinai.io"
                      className="text-right text-[11px] text-slate-500 dark:text-neutral-400 bg-transparent outline-none focus:border-b focus:border-slate-300 w-full"
                    />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-3">
                      <Mail className="w-4 h-4 text-red-500" /> Email Address
                    </span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[150px]" id="settings-real-email">{userProfile?.email}</span>
                  </div>
                </div>
              </div>

              {/* Cloud Persistence Guarantee Card */}
              <div className={`rounded-2xl p-4 border ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-emerald-50/40 border-emerald-100'} space-y-2`}>
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Active Cloud Synchronization
                </h4>
                <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Your conversations and account details are safely persisted in real-time within <strong className="font-bold text-slate-700 dark:text-slate-200">Cloud Firestore</strong>. Wiping browser cache or cookies will never delete your data.
                </p>
              </div>

              {/* PWA Download / Installation section */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 px-1">
                  Device Application
                </div>
                <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'} border ${isDarkMode ? 'border-neutral-800' : 'border-slate-100'} shadow-sm space-y-3`}>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
                      <Download className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black">Install AkinAI App</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        Add AkinAI to your Mobile home screen or Desktop taskbar for a fast, standalone application experience.
                      </p>
                    </div>
                  </div>
                  
                  {isInstallable ? (
                    <button
                      onClick={handleInstallApp}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[10px] rounded-xl tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all shadow"
                      id="pwa-install-btn"
                    >
                      Download & Install App
                    </button>
                  ) : (
                    <div className="text-center py-2 bg-slate-100/50 dark:bg-neutral-800/40 border border-dashed border-slate-200/50 dark:border-neutral-800 rounded-xl text-[9px] text-emerald-500 font-bold uppercase tracking-wider">
                      ✓ Running in App Mode / Installed
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary lists matching picture 4 */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 px-1">
                  System Preferences
                </div>
                <div className={`rounded-2xl divide-y ${isDarkMode ? 'bg-[#1e1e1e] divide-neutral-800' : 'bg-white divide-slate-100'} overflow-hidden shadow-sm border ${isDarkMode ? 'border-neutral-800' : 'border-slate-100'}`}>
                  
                  {/* Appearance Selector */}
                  <div className="px-4 py-3 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-3">
                      <Sun className="w-4 h-4 text-amber-500" /> Appearance
                    </span>
                    <select
                      value={appearance}
                      onChange={(e) => setAppearance(e.target.value as any)}
                      className="bg-transparent border-0 outline-none text-[11px] font-semibold text-slate-400 cursor-pointer"
                    >
                      <option value="light" className="text-slate-900 bg-white">Light</option>
                      <option value="dark" className="text-slate-900 bg-white">Dark</option>
                    </select>
                  </div>

                  {/* Accent Color */}
                  <div className="px-4 py-3 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-3">
                      <Grid className="w-4 h-4 text-blue-600" /> Accent color
                    </span>
                    <select
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value as any)}
                      className="bg-transparent border-0 outline-none text-[11px] font-semibold text-slate-400 cursor-pointer"
                    >
                      <option value="default" className="text-slate-900 bg-white">Default Emerald</option>
                      <option value="purple" className="text-slate-900 bg-white">Plus Purple</option>
                      <option value="blue" className="text-slate-900 bg-white">Cobalt Blue</option>
                      <option value="green" className="text-slate-900 bg-white">Ocean Green</option>
                    </select>
                  </div>

                  {/* Security */}
                  <div className="px-4 py-3 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-3">
                      <Lock className="w-4 h-4 text-red-500" /> Security and login
                    </span>
                    <span className="text-emerald-500 font-bold text-[10px]">Protected</span>
                  </div>

                  {/* Storage */}
                  <div className="px-4 py-3 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-3">
                      <Database className="w-4 h-4 text-indigo-500" /> Storage
                    </span>
                    <span className="text-slate-400 text-[10px]">Cloud Firestore</span>
                  </div>

                  {/* About */}
                  <div className="px-4 py-3 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold flex items-center gap-3">
                        <Info className="w-4 h-4 text-slate-500" /> About
                      </span>
                      <span className="text-slate-400 text-[10px]">Version 1.1.0</span>
                    </div>
                    <div className="text-[10px] text-slate-400 leading-relaxed pt-1 pl-7 border-t border-slate-100/10">
                      AkinAI App is built by <strong className="font-black text-slate-600 dark:text-slate-200">SASTECH INC</strong>. 
                      All communication is encrypted and securely routed via secure, private server API proxies.
                    </div>
                  </div>
                </div>
              </div>

              {feedbackMsg && (
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs p-3 rounded-xl text-center font-semibold">
                  {feedbackMsg}
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 3: ACCENT & ADVANCED STYLING PANEL */}
        {currentView === 'settings-advanced' && (
          <div className={`h-full flex flex-col justify-between ${isDarkMode ? 'bg-[#151515] text-white' : 'bg-slate-50 text-slate-900'}`} id="advanced-settings-wrapper">
            <header className={`px-4 py-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#1e1e1e] border-slate-800' : 'bg-white border-slate-100'} sticky top-0 z-40`}>
              <button
                onClick={() => setCurrentView('chat')}
                className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'} transition-all`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black uppercase tracking-wider">Styling & Accents</h2>
              <div className="w-8" />
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Accent Theme Selection</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toggle between color profiles. The selected option instantly sets custom color schemes on chat buttons, user badges, drawer assets, and header outlines.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => { setAccentColor('default'); }}
                    className={`p-3 rounded-2xl border text-center transition-all ${accentColor === 'default' ? 'border-[#10a37f] bg-[#10a37f]/10 text-[#10a37f]' : 'border-slate-200 text-slate-400'}`}
                  >
                    <span className="block text-xs font-black">Emerald</span>
                    <span className="text-[9px] opacity-80">Default Chat</span>
                  </button>

                  <button
                    onClick={() => { setAccentColor('purple'); }}
                    className={`p-3 rounded-2xl border text-center transition-all ${accentColor === 'purple' ? 'border-purple-600 bg-purple-600/10 text-purple-600' : 'border-slate-200 text-slate-400'}`}
                  >
                    <span className="block text-xs font-black">Purple</span>
                    <span className="text-[9px] opacity-80">Plus Badge</span>
                  </button>

                  <button
                    onClick={() => { setAccentColor('blue'); }}
                    className={`p-3 rounded-2xl border text-center transition-all ${accentColor === 'blue' ? 'border-blue-600 bg-blue-600/10 text-blue-600' : 'border-slate-200 text-slate-400'}`}
                  >
                    <span className="block text-xs font-black">Cobalt</span>
                    <span className="text-[9px] opacity-80">Aesthetic Blue</span>
                  </button>

                  <button
                    onClick={() => { setAccentColor('green'); }}
                    className={`p-3 rounded-2xl border text-center transition-all ${accentColor === 'green' ? 'border-emerald-600 bg-emerald-600/10 text-emerald-600' : 'border-slate-200 text-slate-400'}`}
                  >
                    <span className="block text-xs font-black">Forest</span>
                    <span className="text-[9px] opacity-80">Deep Green</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Device Interface Settings</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Configure whether your application layout fits in a floating viewport container, or expands natively inside your platform.
                </p>
                <div className="space-y-2 pt-2">
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-neutral-800/40 border-neutral-800' : 'bg-white border-slate-100'} shadow-sm`}>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Compact Mobile Frame</h4>
                      <p className="text-[10px] text-slate-400">Centers app inside mobile simulator on desktop viewport sizes.</p>
                    </div>
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: PLUGINS CONFIGURATION */}
        {currentView === 'plugins' && (
          <div className={`h-full flex flex-col justify-between ${isDarkMode ? 'bg-[#151515] text-white' : 'bg-slate-50 text-slate-900'}`} id="plugins-view-wrapper">
            {/* Header */}
            <header className={`px-4 py-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#1e1e1e] border-slate-800' : 'bg-white border-slate-100'} sticky top-0 z-40`}>
              <button
                onClick={() => setCurrentView('settings')}
                className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'} transition-all`}
                id="plugins-back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black uppercase tracking-wider">AkinAI Plugins</h2>
              <div className="w-8" />
            </header>

            {/* Plugins Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold tracking-tight">Active Plugin Suite</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toggle premium plugins to extend AkinAI's capabilities. Activated plugins automatically inject semantic actions and external tools directly into the AkinAI generation runtime.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {/* Plugin 1: Google Search Grounding */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-white border-slate-100'} shadow-sm space-y-3`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 rounded-xl text-blue-600">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">Google Search Grounding</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          Enables AkinAI to query Google Search live to fetch real-time facts, news, and current world affairs.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePlugins(prev => ({ ...prev, searchGrounding: !prev.searchGrounding }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${activePlugins.searchGrounding ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${activePlugins.searchGrounding ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Plugin 2: Code Specialist */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-white border-slate-100'} shadow-sm space-y-3`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-purple-100 dark:bg-purple-950/40 rounded-xl text-purple-600">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">Code Specialist</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          Instructs AkinAI to output precise, robust, production-ready code with complete syntax highlighting, file structure, and step-by-step documentation.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePlugins(prev => ({ ...prev, codeSpecialist: !prev.codeSpecialist }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${activePlugins.codeSpecialist ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${activePlugins.codeSpecialist ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Plugin 3: Auto Translator */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-white border-slate-100'} shadow-sm space-y-3`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/40 rounded-xl text-indigo-600">
                        <Languages className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">Auto Translator</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          Automatically translates all incoming responses instantly to your selected primary language.
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {['None', 'Spanish', 'French', 'German', 'Chinese'].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setActivePlugins(prev => ({ ...prev, translator: lang }))}
                              className={`px-2 py-1 rounded text-[9px] font-black tracking-wide uppercase border transition-all ${activePlugins.translator === lang ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-slate-200 dark:border-neutral-800 text-slate-400'}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plugin 4: Executive Summarizer */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-white border-slate-100'} shadow-sm space-y-3`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-amber-100 dark:bg-amber-950/40 rounded-xl text-amber-600">
                        <MenuSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">Executive Summarizer</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          Condenses all AkinAI answers into exactly 2 to 3 high-impact, direct bullet points for efficient reading.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePlugins(prev => ({ ...prev, summarizer: !prev.summarizer }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${activePlugins.summarizer ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${activePlugins.summarizer ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Plugin 5: Creative Writer */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-white border-slate-100'} shadow-sm space-y-3`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-rose-100 dark:bg-rose-950/40 rounded-xl text-rose-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">Creative Writer</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          Infuses narrative flavor, rich storytelling style, analogies, and dynamic hooks into all AI outputs.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePlugins(prev => ({ ...prev, creativeWriter: !prev.creativeWriter }))}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${activePlugins.creativeWriter ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${activePlugins.creativeWriter ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: ADMIN NEWS BULLETIN PUBLISHER DASHBOARD */}
        {currentView === 'admin-dashboard' && (
          <div className={`h-full flex flex-col justify-between ${isDarkMode ? 'bg-[#151515] text-white' : 'bg-slate-50 text-slate-900'}`} id="admin-dashboard-wrapper">
            
            {/* Header */}
            <header className={`px-4 py-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#1e1e1e] border-slate-800' : 'bg-white border-slate-100'} sticky top-0 z-40`}>
              <button
                onClick={() => setCurrentView('settings')}
                className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-100'} transition-all`}
                id="admin-back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black uppercase tracking-wider text-red-500">System News Publisher</h2>
              <div className="w-8" />
            </header>

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              
              {/* Form card */}
              <div className={`p-5 rounded-3xl shadow-sm border ${isDarkMode ? 'bg-[#1e1e1e] border-neutral-800' : 'bg-white border-slate-100'} space-y-4`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
                  Publish New Bulletin
                </h3>
                
                <form onSubmit={handlePublishNews} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="e.g. System Upgrades Underway"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-950 focus:ring-2 focus:ring-red-500 outline-none"
                      id="news-title-input"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Content Body</label>
                    <textarea
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      placeholder="Enter broadcast instructions, news, or system reports..."
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-950 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                      id="news-content-input"
                    />
                  </div>

                  {feedbackMsg && (
                    <div className="bg-indigo-50 text-indigo-700 text-xs p-3 rounded-xl text-center font-bold">
                      {feedbackMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={publishingLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow disabled:opacity-50"
                    id="news-submit-btn"
                  >
                    {publishingLoading ? 'Publishing...' : 'Publish to News Feed'}
                  </button>
                </form>
              </div>

              {/* List of current broadcasts */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
                  Active Bulletins ({news.length})
                </h3>
                <div className="space-y-2.5">
                  {news.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-neutral-800/40 border-neutral-800' : 'bg-white border-slate-100'} shadow-sm flex items-start justify-between gap-3`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-950 dark:text-white truncate">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{item.content}</p>
                        <div className="flex items-center gap-3 text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                          <span>By {item.publishedBy.split('@')[0]}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-all shrink-0"
                        title="Delete Broadcast"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {news.length === 0 && (
                    <div className="text-xs text-slate-400 italic text-center py-4">
                      No system news published yet.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
