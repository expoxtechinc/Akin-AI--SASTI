/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { ToolInterface } from './components/tools/ToolInterface';
import { LiveCall } from './components/tools/LiveCall';
import { LiveVideoCall } from './components/tools/LiveVideoCall';
import { BananaDesign } from './components/tools/BananaDesign';
import { SonicStudio } from './components/tools/SonicStudio';
import { CinemaAI } from './components/tools/CinemaAI';
import { NewsHub } from './components/tools/NewsHub';
import { MapTool } from './components/tools/MapTool';
import { BossLive } from './components/tools/BossLive';
import { MedicalPro } from './components/tools/MedicalPro';
import { IllustrationAI } from './components/tools/IllustrationAI';
import { ScholarCam } from './components/tools/ScholarCam';
import { CloudArchitect } from './components/tools/CloudArchitect';
import { Heart2Heart } from './components/tools/Heart2Heart';
import { AIParty } from './components/tools/AIParty';
import { GlobalCall } from './components/tools/GlobalCall';
import { VideoDownloader } from './components/tools/VideoDownloader';
import { AppDistributor } from './components/tools/AppDistributor';
import { WhatsAppMessenger } from './components/tools/WhatsAppMessenger';
import { Pricing } from './components/pages/Pricing';
import { HelpSupport } from './components/pages/Support';
import { DeveloperHub } from './components/pages/DeveloperHub';
import { LiveFeed } from './components/tools/LiveFeed';
import { AdOverlay } from './components/tools/AdOverlay';
import { SocialSpace } from './components/tools/SocialSpace';
import { LandingPage } from './components/landing/LandingPage';
import { LandingHeader } from './components/landing/LandingHeader';
import { AuthModal } from './components/landing/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AITool } from './types';
import { TOOLS } from './constants';
import { cn } from './lib/utils';
import { Cloud } from 'lucide-react';

import { MobileAppLayout } from './components/layout/MobileAppLayout';

export default function App() {
  const [activeTool, setActiveTool] = useState<AITool | null>(
    TOOLS.find(t => t.id === 'whatsapp-messenger') || null
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // If user clicks "Get Started" or signs in, move to dashboard
  const enterDashboard = () => setView('dashboard');

  if (view === 'admin') {
    return <AdminDashboard onLogout={() => setView('landing')} />;
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#050505] selection:bg-indigo-500/30 selection:text-indigo-200">
        <LandingHeader onStart={enterDashboard} onLogin={() => setIsAuthOpen(true)} />
        <LandingPage onStart={enterDashboard} />
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={(isAdmin) => {
            setIsAuthOpen(false);
            if (isAdmin) {
              setView('admin');
            } else {
              enterDashboard();
            }
          }}
        />
      </div>
    );
  }

  return (
    <MobileAppLayout 
      activeTool={activeTool}
      onSelectTool={(tool) => setActiveTool(tool)}
      onLogout={() => setView('landing')}
    >
      <section className="h-full customized-scrollbar overflow-y-auto">
        {!activeTool ? (
          <LiveFeed />
        ) : activeTool.id === 'live-call' ? (
          <LiveCall />
        ) : activeTool.id === 'live-video' ? (
          <LiveVideoCall />
        ) : activeTool.id === 'banana-design' ? (
          <BananaDesign />
        ) : activeTool.id === 'sonic-studio' ? (
          <SonicStudio />
        ) : activeTool.id === 'cinema-ai' ? (
          <CinemaAI />
        ) : activeTool.id === 'news-hub' ? (
          <NewsHub />
        ) : activeTool.id === 'maps' ? (
          <MapTool />
        ) : activeTool.id === 'boss-live' ? (
          <BossLive />
        ) : activeTool.id === 'medical-pro' ? (
          <MedicalPro />
        ) : activeTool.id === 'illustrator' ? (
          <IllustrationAI />
        ) : activeTool.id === 'scholar-cam' ? (
          <ScholarCam />
        ) : activeTool.id === 'cloud-architect' ? (
          <CloudArchitect tool={activeTool} />
        ) : activeTool.id === 'heart-2-heart' ? (
          <Heart2Heart />
        ) : activeTool.id === 'ai-party' ? (
          <AIParty />
        ) : activeTool.id === 'global-call' ? (
          <GlobalCall />
        ) : activeTool.id === 'video-downloader' ? (
          <VideoDownloader />
        ) : activeTool.id === 'app-distributor' ? (
          <AppDistributor />
        ) : activeTool.id === 'whatsapp-messenger' ? (
          <WhatsAppMessenger />
        ) : activeTool.id === 'social-space' ? (
          <SocialSpace />
        ) : activeTool.id === 'pricing' ? (
          <Pricing />
        ) : activeTool.id === 'support' ? (
          <HelpSupport />
        ) : activeTool.id === 'dev-hub' ? (
          <DeveloperHub />
        ) : (
          <ToolInterface key={activeTool.id} tool={activeTool} />
        )}
      </section>
    </MobileAppLayout>
  );
}


