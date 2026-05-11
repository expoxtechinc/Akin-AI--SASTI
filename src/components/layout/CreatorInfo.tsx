/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Github, Twitter, MapPin } from 'lucide-react';

export const CreatorInfo: React.FC = () => {
  return (
    <div className="mt-auto p-4 bg-stone-900 text-stone-50 rounded-2xl mx-4 mb-4 space-y-4">
      <div className="flex items-center gap-3">
        <img 
          src="https://www.image2url.com/r2/default/images/1778502896002-25e72563-a347-4ad9-8c4d-d6bef658d3dd.png" 
          alt="Akin S. Sokpah" 
          className="w-12 h-12 rounded-full border-2 border-stone-700 object-cover"
        />
        <div>
          <h4 className="text-sm font-bold leading-none">Akin S. Sokpah</h4>
          <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest">Lead Architect</p>
        </div>
      </div>
      
      <p className="text-[11px] text-stone-300 leading-relaxed italic">
        "Built with vision from Mount Barclay, Liberia, to empower the world through AI. Created by Akin S. Sokpah, Powered by Google."
      </p>

      <div className="flex items-center gap-3 pt-2 border-t border-stone-800">
        <div className="flex items-center gap-1 text-[10px] text-stone-400">
          <MapPin size={10} />
          <span>Montserrado, LR</span>
        </div>
      </div>
    </div>
  );
};
