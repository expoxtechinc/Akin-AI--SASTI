/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, MapPin, Navigation } from 'lucide-react';
import { cn } from '../../lib/utils';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const MapTool: React.FC = () => {
  const [center, setCenter] = useState({ lat: 6.3006, lng: -10.7969 }); // Default to Liberia (Monrovia area)
  const [zoom, setZoom] = useState(12);

  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
          <MapPin size={40} />
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">Google Maps Key Required</h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            To view AkinAI's location and use mapping features, please add your Google Maps Platform API key in the app settings.
          </p>
          <div className="text-left bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-3">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">How to set up:</p>
            <ol className="text-xs text-stone-600 space-y-2 list-decimal ml-4">
              <li>Get a key from <a href="https://console.cloud.google.com/google/maps-apis/start" className="text-stone-900 underline">Google Cloud Console</a></li>
              <li>Open <strong>Settings</strong> (⚙️ icon) → <strong>Secrets</strong></li>
              <li>Add <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the name</li>
              <li>Paste your key as the value and press Enter</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900">Global Presence</h2>
        <p className="text-sm text-stone-500">Explore AkinAI's roots in Liberia and beyond.</p>
      </div>
      
      <div className="flex-1 relative">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={center}
            defaultZoom={zoom}
            mapId="AKINAI_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={false}
          >
            <AdvancedMarker position={center} title="AkinAI Headquaters (Concept)">
              <Pin background="#1c1917" glyphColor="#fafaf9" borderColor="#1c1917" />
            </AdvancedMarker>
          </Map>
        </APIProvider>

        <div className="absolute top-4 left-4 right-4 lg:left-8 lg:right-auto lg:w-80">
          <div className="bg-white/90 backdrop-blur shadow-xl border border-stone-200 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center shrink-0">
                <Navigation size={20} className="text-stone-50" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Mount Barclay</h3>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Montserrado, Liberia</p>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              AkinAI was born in the heart of Montserrado County. Our vision is to bring advanced problem-solving technology to every corner of the globe.
            </p>
            <button 
              onClick={() => {
                setCenter({ lat: 6.3006, lng: -10.7969 });
                setZoom(14);
              }}
              className="w-full py-2 bg-stone-900 text-stone-50 text-xs font-bold rounded-lg hover:bg-stone-800 transition-colors"
            >
              Focus on HQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
