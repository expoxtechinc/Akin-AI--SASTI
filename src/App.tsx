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
      
      <main className="flex-1 flex flex-col min-h-0 bg-white">
        {/* Header - Desktop & Mobile */}
        <header className="h-16 flex-none bg-white border-b border-stone-100 px-6 flex items-center justify-between z-30 sticky top-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-stone-500 hover:text-stone-900"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex w-8 h-8 bg-stone-900 rounded-lg items-center justify-center">
                <span className="text-stone-50 font-bold text-xs">A</span>
             </div>
             <h2 className="text-sm font-bold text-stone-900 tracking-tight uppercase">{activeTool.name}</h2>
          </div>

          <div className="hidden md:flex items-center gap-4">
             <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200">
                AkinAI OS v4.2
             </span>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-white scroll-smooth relative">
          <div className="w-full min-h-full flex flex-col">
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
            ) : (
              <ToolInterface key={activeTool.id} tool={activeTool} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

