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
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-stone-500 hover:text-stone-900"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-stone-900 rounded flex items-center justify-center">
              <span className="text-stone-50 font-bold text-xs">A</span>
            </div>
            <span className="font-bold tracking-tight">AkinAI</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <section className="flex-1 overflow-hidden">
          <ToolInterface key={activeTool.id} tool={activeTool} />
        </section>
      </main>
    </div>
  );
}

