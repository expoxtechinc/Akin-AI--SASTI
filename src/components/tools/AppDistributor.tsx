/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Smartphone, 
  Globe, 
  Shield, 
  Share2, 
  QrCode, 
  BarChart3, 
  Package, 
  ChevronRight, 
  Zap, 
  HardDrive,
  Copy,
  Check,
  Smartphone as PhoneIcon,
  Apple,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface UploadedApp {
  id: string;
  name: string;
  version: string;
  platform: 'ios' | 'android';
  size: string;
  date: string;
  installLink: string;
}

export const AppDistributor: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedApp, setUploadedApp] = useState<UploadedApp | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedApp({
            id: Math.random().toString(36).substr(2, 9),
            name: "MyBusinessApp_v1.0.apk",
            version: "1.0.0 (Build 42)",
            platform: 'android',
            size: "24.5 MB",
            date: new Date().toLocaleDateString(),
            installLink: `https://diawi.akinai.io/i/${Math.random().toString(36).substr(2, 6)}`
          });
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-12 pb-32">
      {/* Header */}
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-3 px-4 py-2 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-stone-200"
        >
          <Zap size={14} className="text-emerald-400 fill-emerald-400" /> 
          Wireless Deployment Engine
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter uppercase italic text-stone-900 leading-none">
            Scale Your <br />
            <span className="text-emerald-600">Distribution</span>
          </h1>
          <p className="text-stone-500 font-medium max-w-xl mx-auto text-lg italic">
            Deploy in-house iOS and Android builds directly to physical devices. No cables, no friction, just high-speed iteration.
          </p>
        </div>
      </div>

      {/* Main Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleUpload();
            }}
            className={cn(
              "relative h-[480px] rounded-[64px] border-4 border-dashed transition-all flex flex-col items-center justify-center text-center p-12 overflow-hidden",
              isDragging ? "border-emerald-500 bg-emerald-50/50 scale-[0.98]" : "border-stone-100 bg-white",
              isUploading ? "pointer-events-none" : "cursor-pointer"
            )}
            onClick={() => !isUploading && handleUpload()}
          >
            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div 
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="space-y-8 w-full max-w-md"
                >
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-stone-100"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={377}
                        strokeDashoffset={377 - (377 * uploadProgress) / 100}
                        className="text-emerald-500 transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-2xl italic tracking-tighter">
                      {uploadProgress}%
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase italic">Processing Binary...</h3>
                    <p className="text-stone-400 text-sm font-medium">Encrypting and provisioning wireless certificates</p>
                  </div>
                </motion.div>
              ) : uploadedApp ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 w-full"
                >
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-100">
                    <Package size={48} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">{uploadedApp.name}</h3>
                    <div className="flex items-center justify-center gap-4 text-xs font-black uppercase text-stone-400 tracking-widest">
                      <span className="flex items-center gap-1"><HardDrive size={12} /> {uploadedApp.size}</span>
                      <span className="flex items-center gap-1 capitalize"><Smartphone size={12} /> {uploadedApp.platform}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                    <div className="flex-1 w-full max-w-sm relative group">
                      <input 
                        readOnly 
                        value={uploadedApp.installLink}
                        className="w-full pl-6 pr-32 py-5 bg-stone-50 border border-stone-100 rounded-3xl text-sm font-bold text-stone-900 outline-none"
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(uploadedApp.installLink);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                      >
                        {hasCopied ? <Check size={14} /> : "Copy Link"}
                      </button>
                    </div>
                    <button className="p-5 bg-white border border-stone-100 rounded-3xl hover:border-emerald-600 transition-colors">
                      <QrCode size={24} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedApp(null);
                    }}
                    className="text-xs font-black uppercase text-stone-400 border-b border-transparent hover:border-stone-400 transition-all tracking-widest"
                  >
                    Upload Another Build
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full" />
                    <div className="relative w-32 h-32 bg-stone-900 text-white rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-stone-300">
                      <Upload size={48} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">
                      Drag & Drop Your <span className="text-emerald-600">Package</span>
                    </h3>
                    <div className="flex items-center justify-center gap-6">
                       <span className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" /> .APK (Android)
                       </span>
                       <span className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                         <div className="w-2 h-2 rounded-full bg-blue-500" /> .IPA (iOS)
                       </span>
                       <span className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                         <div className="w-2 h-2 rounded-full bg-indigo-500" /> .ZIP (Web)
                       </span>
                    </div>
                  </div>

                  <button className="px-12 py-5 bg-stone-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-200">
                    Select Build Files
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-stone-50 rounded-[48px] p-8 space-y-6 border border-stone-100">
              <div className="flex items-center gap-2 uppercase font-black text-[10px] tracking-widest text-emerald-600">
                <BarChart3 size={16} /> Global Stats
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Builds Deployed', value: '31,401,958' },
                  { label: 'Active Devices', value: '75,280,514' },
                  { label: 'Average Uptime', value: '99.98%' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-stone-200 last:border-0">
                    <span className="text-xs font-bold text-stone-500 italic">{stat.label}</span>
                    <span className="text-lg font-black text-stone-900 tracking-tighter">{stat.value}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 bg-white border border-stone-200 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-stone-100 transition-colors">
                 View Installation Logs
              </button>
           </div>

           <div className="bg-emerald-600 rounded-[48px] p-8 text-white space-y-6 shadow-2xl shadow-emerald-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
              <LayoutGrid size={32} />
              <h4 className="text-xl font-black uppercase tracking-tighter italic">Wall of Apps</h4>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed italic">Explore public test builds and beta apps shared by the AkinAI developer community.</p>
              <button className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                Access Repository <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-stone-100">
         {[
           { icon: Shield, title: 'Encrypted Links', desc: 'All distribution URLs are private, non-indexed, and can be password protected.' },
           { icon: Globe, title: 'Global Delivery', desc: 'Content delivery network ensures low-latency downloads in any region.' },
           { icon: BarChart3, title: 'Deep Analytics', desc: 'Track device types, OS versions, and installation success rates per build.' }
         ].map((feature, i) => (
           <div key={i} className="space-y-4">
              <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-900">
                 <feature.icon size={24} />
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight italic">{feature.title}</h4>
              <p className="text-sm text-stone-500 font-medium italic leading-relaxed">{feature.desc}</p>
           </div>
         ))}
      </div>

      {/* OS Compatibility */}
      <div className="bg-stone-900 rounded-[48px] p-12 text-white overflow-hidden relative">
         <div className="absolute inset-0 bg-emerald-500/5 -z-10" />
         <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="flex-1 space-y-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">Cross-Platform <span className="text-emerald-400">Superiority</span></h3>
               <p className="text-stone-400 text-sm font-medium italic leading-relaxed max-w-lg">
                 Whether it's an iOS Ad-Hoc provisioning profile or a signed Android release, our engine handles the wireless logic so you focus on the code.
               </p>
               <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                  <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest italic">
                     <Apple size={16} /> iOS 4.0+
                  </div>
                  <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest italic">
                     <PhoneIcon size={16} /> Android 2.0+
                  </div>
               </div>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-4">
               <button className="px-10 py-5 bg-emerald-500 text-stone-900 rounded-[32px] font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all">
                 Read Integration Guide
               </button>
               <button className="px-10 py-5 border border-white/20 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs hover:bg-white/5 transition-all">
                 API Keys Request
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
