/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from './services/firebase';
import { MobileAppLayout } from './components/layout/MobileAppLayout';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/landing/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ToolInterface } from './components/tools/ToolInterface';
import { TOOLS } from './constants';
import { AITool } from './types';

// Dynamic Tool Imports - Named Exports
import { WhatsAppMessenger } from './components/tools/WhatsAppMessenger';
import { SonicStudio } from './components/tools/SonicStudio';
import { CinemaAI } from './components/tools/CinemaAI';
import { BananaDesign } from './components/tools/BananaDesign';
import { LiveCall } from './components/tools/LiveCall';
import { LiveVideoCall } from './components/tools/LiveVideoCall';
import { BossLive } from './components/tools/BossLive';
import { MedicalPro } from './components/tools/MedicalPro';
import { CloudArchitect } from './components/tools/CloudArchitect';
import { ScholarCam } from './components/tools/ScholarCam';
import { SocialSpace } from './components/tools/SocialSpace';
import { NewsHub } from './components/tools/NewsHub';
import { Heart2Heart } from './components/tools/Heart2Heart';
import { AIParty } from './components/tools/AIParty';
import { GlobalCall } from './components/tools/GlobalCall';
import { VideoDownloader } from './components/tools/VideoDownloader';
import { AppDistributor } from './components/tools/AppDistributor';
import { IllustrationAI } from './components/tools/IllustrationAI';
import { MapTool } from './components/tools/MapTool';
import { AkinAIChatWorkspace } from './components/chat/AkinAIChatWorkspace';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<AITool | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminView, setShowAdminView] = useState(false);
  const [loading, setLoading] = useState(true);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Is user the founder or registered admin
        const adminEmails = ['aki.sokpah.link@gmail.com', 'luckyglobalnews@gmail.com'];
        const isUserAdmin = currentUser.email ? adminEmails.includes(currentUser.email) : false;
        setIsAdmin(isUserAdmin);
        if (isUserAdmin) {
          setShowAdminView(true);
        }
      } else {
        setIsAdmin(false);
        setShowAdminView(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setShowAdminView(false);
      setActiveTool(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const renderActiveTool = (tool: AITool | null) => {
    if (!tool) {
      // Default to general chat when no tool is selected
      return <ToolInterface tool={TOOLS[0]} />;
    }

    switch (tool.id) {
      case 'whatsapp-messenger':
        return <WhatsAppMessenger />;
      case 'sonic-studio':
        return <SonicStudio />;
      case 'cinema-ai':
        return <CinemaAI />;
      case 'banana-design':
        return <BananaDesign />;
      case 'live-call':
        return <LiveCall />;
      case 'live-video':
        return <LiveVideoCall />;
      case 'boss-live':
        return <BossLive />;
      case 'medical-pro':
        return <MedicalPro />;
      case 'cloud-architect':
        return <CloudArchitect tool={tool} />;
      case 'scholar-cam':
        return <ScholarCam />;
      case 'social-space':
        return <SocialSpace />;
      case 'news-hub':
        return <NewsHub />;
      case 'heart-2-heart':
        return <Heart2Heart />;
      case 'ai-party':
        return <AIParty />;
      case 'global-call':
        return <GlobalCall />;
      case 'video-downloader':
        return <VideoDownloader />;
      case 'app-distributor':
        return <AppDistributor />;
      case 'illustrator':
        return <IllustrationAI />;
      case 'maps':
        return <MapTool />;
      default:
        return <ToolInterface tool={tool} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-t-2 border-indigo-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">
            Synchronizing Neural Matrix...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <LandingPage onStart={() => setIsAuthOpen(true)} />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={(adminStatus) => {
            setIsAuthOpen(false);
            if (adminStatus) setIsAdmin(true);
          }} 
        />
      </div>
    );
  }

  // Admin View (Founder dashboard)
  if (isAdmin && showAdminView) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Toggle to switch between admin view and general platform view */}
        <div className="relative w-full max-w-md h-screen flex flex-col">
          <AdminDashboard onLogout={handleLogout} />
          <button 
            onClick={() => setShowAdminView(false)}
            className="absolute top-28 left-6 px-4 py-2 bg-indigo-600/90 hover:bg-indigo-600 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-md z-[110]"
          >
            Launch Platform
          </button>
        </div>
      </div>
    );
  }

  // Logged-in User Conversational AI Workspace Screen
  return (
    <AkinAIChatWorkspace 
      userEmail={user.email || 'Guest Engine'} 
      onLogout={handleLogout}
      isAdmin={isAdmin}
      onBackToAdmin={isAdmin ? () => setShowAdminView(true) : undefined}
    />
  );
}
