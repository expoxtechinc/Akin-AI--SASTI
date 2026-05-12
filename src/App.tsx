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
import { AITool } from './types';
import { TOOLS } from './constants';
import { cn } from './lib/utils';

export default function App() {
  const [activeTool, setActiveTool] = useState<AITool>(TOOLS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-stone-100 text-stone-900 font-sans selection:bg-stone-200">
      <Sidebar 
        activeToolId={activeTool.id}
        onSelectTool={setActiveTool}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="flex-1 flex flex-col min-h-0 bg-white relative">
        {/* Header */}
        <header className="h-14 flex-none bg-white/80 backdrop-blur-md px-4 flex items-center justify-between z-30 sticky top-0 md:border-b md:border-stone-100">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors group">
              <span className="text-xs font-bold text-stone-900 tracking-tight uppercase">{activeTool.name}</span>
              <span className="text-[10px] text-stone-400 font-bold bg-stone-100 px-1.5 py-0.5 rounded uppercase">v4.2</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors uppercase tracking-widest">
                Upgrade
             </button>
             <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600">
                AS
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-white scroll-smooth relative customized-scrollbar">
          <div className="w-full h-full max-w-6xl mx-auto flex flex-col items-center">
            <div className="w-full flex-1">
              {activeTool.id === 'live-call' ? (
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
              ) : (
                <ToolInterface key={activeTool.id} tool={activeTool} />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

