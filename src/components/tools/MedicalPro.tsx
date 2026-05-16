/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Thermometer, Heart, FileText, Plus, Database, ChevronRight, TrendingUp, User, Clipboard, Microscope, Stethoscope, AlertCircle, Video, Mic, MicOff, PhoneOff, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ToolInterface } from './ToolInterface';
import { TOOLS } from '../../constants';
import { cn } from '../../lib/utils';
import { GoogleGenAI, Modality } from "@google/genai";
import { AKIN_TOOLS, handleLiveToolCall } from '../../services/liveTools';

const medicalTool = TOOLS.find(t => t.id === 'medical-pro')!;

const sampleVitalsData = [
  { time: '08:00', bp: 120, hr: 72, temp: 98.6 },
  { time: '10:00', bp: 125, hr: 75, temp: 98.8 },
  { time: '12:00', bp: 118, hr: 70, temp: 99.1 },
  { time: '14:00', bp: 122, hr: 78, temp: 98.9 },
  { time: '16:00', bp: 130, hr: 82, temp: 99.2 },
  { time: '18:00', bp: 124, hr: 74, temp: 98.7 },
];

const apiKey = process.env.GEMINI_API_KEY;

export const MedicalPro: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'careplan' | 'live'>('chat');
  
  // Live Consultation State
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<string>('Ready for Consultation');
  const [aiTranscription, setAiTranscription] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startConsultation = async () => {
    if (!apiKey) {
      setStatus('Access Denied: Key Missing');
      return;
    }

    try {
      setIsCalling(true);
      setStatus('Contacting On-Call AI Specialist...');
      
      const ai = new GoogleGenAI({ apiKey });
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setStatus('Clinical Session: ACTIVE');
            setupStreams();
          },
          onmessage: async (message) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) playPcmData(part.inlineData.data);
                if (part.text) setAiTranscription(part.text);
                
                if (part.functionCall) {
                  const result = await handleLiveToolCall(part.functionCall);
                  session.sendToolResponse({
                    functionResponses: [{
                      name: part.functionCall.name,
                      response: result,
                      id: part.functionCall.id
                    }]
                  });
                }
              }
            }
          },
          onclose: () => stopConsultation(),
          onerror: () => stopConsultation(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
          },
          tools: AKIN_TOOLS,
          systemInstruction: "You are Dr. Kin, a clinical specialist at AkinAI. Analyze the patient's symptoms and visual presentation. Provide evidence-based clinical insights while maintaining a professional medical demeanor. Use search_web to look up latest medical journals if needed.",
        }
      });
      sessionRef.current = session;
    } catch (err) {
      setIsCalling(false);
      setStatus('Telemedicine Sync Failed');
    }
  };

  const setupStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({ audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } });
      };
      source.connect(processor);
      processor.connect(audioContext.destination);

      videoIntervalRef.current = window.setInterval(captureFrame, 1000);
    } catch (err) {
      setStatus('AV Bridge Blocked');
    }
  };

  const captureFrame = () => {
    if (!sessionRef.current || !videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
    sessionRef.current.sendRealtimeInput({ video: { data: base64Data, mimeType: 'image/jpeg' } });
  };

  const playPcmData = (base64: string) => {
    if (!audioContextRef.current) return;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pcm = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) float32[i] = pcm[i] / 0x7FFF;
    const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime;
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  const stopConsultation = () => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    sessionRef.current?.close();
    sessionRef.current = null;
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    setIsCalling(false);
    setStatus('Consultation Ended');
  };
  
  return (
    <div className="flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Clinical Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
             <Stethoscope size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 tracking-tight leading-none">Medical Pro Suite</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-1.5 py-0.5 bg-blue-50 rounded">MD/RN Certified</span>
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">• NANDA v2.4 Enabled</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200">
           {[
             { id: 'chat', label: 'Clinical AI', icon: Activity },
             { id: 'dashboard', label: 'Surveillance', icon: TrendingUp },
             { id: 'careplan', label: 'NANDA Plans', icon: FileText },
             { id: 'live', label: 'Live Consult', icon: Video },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                 activeTab === tab.id 
                   ? "bg-white text-stone-900 shadow-sm border border-stone-200" 
                   : "text-stone-500 hover:text-stone-800"
               )}
             >
               <tab.icon size={14} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar - Quick Actions */}
        <div className="hidden lg:flex w-72 flex-col border-r border-stone-200 bg-white p-6 space-y-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Patient Explorer</label>
              <div className="space-y-2">
                 {[
                   { name: 'Sokpah, Akin', id: 'PT-901', status: 'Stable' },
                   { name: 'Doe, Jane', id: 'PT-442', status: 'Priority' },
                 ].map(patient => (
                   <div key={patient.id} className="p-3 bg-stone-50 border border-stone-100 rounded-xl hover:border-blue-200 cursor-pointer transition-all group">
                      <div className="flex items-center justify-between mb-1">
                         <span className="text-xs font-bold text-stone-800">{patient.name}</span>
                         <span className={cn(
                           "text-[8px] font-bold uppercase tracking-tighter px-1 rounded-full",
                           patient.status === 'Priority' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                         )}>{patient.status}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">ID: {patient.id} • Room 402</span>
                   </div>
                 ))}
                 <button className="w-full py-3 border border-dashed border-stone-200 rounded-xl text-stone-400 text-[10px] font-bold uppercase hover:bg-stone-50 transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Patient
                 </button>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Clinical Resources</label>
              <nav className="space-y-1">
                 {[
                   { label: 'Drug Interaction Matrix', icon: Microscope },
                   { label: 'Lab Values Reference', icon: Database },
                   { label: 'Diagnostic ICD-10 Search', icon: Plus },
                 ].map((item, i) => (
                   <button key={i} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all text-xs font-medium">
                      <item.icon size={16} className="text-stone-400" />
                      {item.label}
                   </button>
                 ))}
              </nav>
           </div>
           
           <div className="mt-auto p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
              <AlertCircle size={18} className="text-orange-500 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Protocol Alert</h4>
                 <p className="text-[10px] text-orange-600 leading-relaxed">Update sepsis protocols for Oncology wing. Check latest directives.</p>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
           <AnimatePresence mode="wait">
              {activeTab === 'chat' ? (
                <motion.div 
                   key="chat"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="h-full"
                >
                   <ToolInterface tool={medicalTool} />
                </motion.div>
              ) : activeTab === 'dashboard' ? (
                <motion.div 
                   key="dashboard"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="flex-1 p-6 lg:p-12 overflow-y-auto space-y-8 customized-scrollbar"
                >
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-white border border-stone-200 rounded-[32px] shadow-sm flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-red-500">
                         <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                            <Heart size={24} />
                         </div>
                         <div className="space-y-0.5">
                            <span className="text-3xl font-black text-stone-900 tracking-tighter">74</span>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Heart Rate (BPM)</p>
                         </div>
                      </div>
                      <div className="p-6 bg-white border border-stone-200 rounded-[32px] shadow-sm flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-blue-500">
                         <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <Activity size={24} />
                         </div>
                         <div className="space-y-0.5">
                            <span className="text-3xl font-black text-stone-900 tracking-tighter">120/80</span>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Blood Pressure (mmHg)</p>
                         </div>
                      </div>
                      <div className="p-6 bg-white border border-stone-200 rounded-[32px] shadow-sm flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-orange-500">
                         <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                            <Thermometer size={24} />
                         </div>
                         <div className="space-y-0.5">
                            <span className="text-3xl font-black text-stone-900 tracking-tighter">98.6°F</span>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Body Temp</p>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-white border border-stone-200 rounded-[40px] shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <h3 className="text-xl font-bold text-stone-900 tracking-tight">Patient Trajectory Analysis</h3>
                            <p className="text-xs text-stone-400">Real-time vitals monitoring & predictive modeling</p>
                         </div>
                         <button className="px-4 py-2 bg-stone-900 text-white text-[10px] font-bold rounded-xl uppercase tracking-widest">Export Clinical Data</button>
                      </div>
                      
                      <div className="h-[350px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sampleVitalsData}>
                               <defs>
                                  <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                               <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                               <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                               />
                               <Area type="monotone" dataKey="bp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBP)" dot={{ r: 4, fill: '#3b82f6' }} />
                               <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 bg-stone-50 border border-stone-100 rounded-[32px] space-y-6">
                         <h4 className="text-[12px] font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Clipboard className="text-blue-600" size={16} /> Diagnostic Summary
                         </h4>
                         <div className="space-y-4">
                            {[
                               { label: 'Condition', value: 'Chronic Obstructive Pulmonary Disease (COPD)' },
                               { label: 'Primary Diagnosis', value: 'Exacerbation related to seasonal allergens' },
                               { label: 'Risk Factor', value: 'Moderate - Smoker (former), Age 65' },
                            ].map((item, i) => (
                               <div key={i} className="flex justify-between border-b border-stone-200 pb-3">
                                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{item.label}</span>
                                  <span className="text-[11px] font-bold text-stone-800">{item.value}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="p-8 bg-stone-50 border border-stone-100 rounded-[32px] space-y-6">
                         <h4 className="text-[12px] font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Plus className="text-green-600" size={16} /> Clinical Recommendations
                         </h4>
                         <ul className="space-y-3">
                            {[
                               'Initiate continuous pulse oximetry monitoring',
                               'Advise postural drainage twice daily',
                               'Assess for increased sputum production or color change',
                               'Consult respiratory therapist for incentive spirometry'
                            ].map((rec, i) => (
                               <li key={i} className="flex gap-3 text-xs text-stone-600 font-medium leading-relaxed">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                  {rec}
                               </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </motion.div>
              ) : activeTab === 'careplan' ? (
                <motion.div 
                   key="careplan"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.05 }}
                   className="flex-1 p-6 lg:p-12 overflow-y-auto space-y-8 customized-scrollbar"
                >
                   <div className="max-w-4xl mx-auto space-y-12">
                      <div className="text-center space-y-2">
                         <h2 className="text-4xl font-black text-stone-900 tracking-tight italic uppercase">Nursing Care Plan Builder</h2>
                         <p className="text-stone-400 font-medium">Generate NANDA-compliant plans instantly with AkinAI Logic</p>
                      </div>

                      <div className="bg-stone-50 rounded-[40px] border border-stone-100 p-8 md:p-12 space-y-10">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Patient Assessment Data</label>
                            <textarea 
                               placeholder="e.g., Patient reports difficulty breathing, SP02 88% on room air, audible wheezing upon auscultation..."
                               className="w-full h-40 p-8 bg-white border border-stone-200 rounded-[32px] outline-none focus:ring-4 focus:ring-blue-100 transition-all text-stone-800 placeholder:text-stone-300 shadow-inner resize-none font-medium text-lg leading-relaxed"
                            />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Medical Diagnosis</label>
                               <input type="text" placeholder="e.g., Acute Respiratory Distress" className="w-full px-6 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 text-stone-700 font-bold" />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Care Plan Depth</label>
                               <div className="flex bg-white border border-stone-200 p-1 rounded-2xl">
                                  {['Comprehensive', 'Focused', 'Emergency'].map(depth => (
                                    <button key={depth} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-stone-50 transition-colors">
                                       {depth}
                                    </button>
                                  ))}
                               </div>
                            </div>
                         </div>

                         <button className="w-full py-6 bg-stone-900 text-white rounded-[32px] font-black italic uppercase tracking-[0.2em] shadow-2xl shadow-stone-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                            <Activity size={24} /> Generate Professional Care Plan
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {[
                           { tag: 'NANDA', title: 'Nursing Diagnosis', desc: 'Prioritized nursing labels for current plan.' },
                           { tag: 'NOC', title: 'Expected Outcomes', desc: 'Measurable goals for patient improvement.' },
                           { tag: 'NIC', title: 'Interventions', desc: 'Specific nursing actions to achieve outcomes.' },
                         ].map((item, i) => (
                           <div key={i} className="p-6 bg-white border border-stone-100 rounded-3xl space-y-3 shadow-sm border-t-2 border-t-blue-600/30">
                              <span className="text-[10px] font-black text-blue-600 tracking-widest bg-blue-50 px-2 py-0.5 rounded">{item.tag}</span>
                              <h5 className="font-bold text-stone-800">{item.title}</h5>
                              <p className="text-[10px] text-stone-400 leading-relaxed">{item.desc}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="live"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="flex-1 flex flex-col bg-stone-950 relative"
                >
                   <div className="absolute inset-0 overflow-hidden">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={cn(
                          "w-full h-full object-cover transition-all duration-700",
                          !isCalling ? "grayscale blur-2xl opacity-20" : "grayscale-0 blur-0 opacity-100"
                        )}
                      />
                      <canvas ref={canvasRef} className="hidden" width="320" height="240" />
                   </div>

                   <div className="relative z-10 flex-1 flex flex-col p-8 justify-between">
                      <div className="flex justify-between items-start">
                         <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                               <span className="text-[10px] font-black text-white uppercase tracking-widest">{status}</span>
                            </div>
                         </div>
                      </div>

                      <AnimatePresence>
                         {aiTranscription && (
                           <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="self-center max-w-2xl bg-black/60 backdrop-blur-xl border-l-4 border-blue-500 p-6 rounded-r-2xl shadow-2xl"
                           >
                              <p className="text-white text-sm font-bold leading-relaxed tracking-tight italic">"{aiTranscription}"</p>
                           </motion.div>
                         )}
                      </AnimatePresence>

                      <div className="flex justify-center gap-6 pb-4">
                         {!isCalling ? (
                           <button 
                             onClick={startConsultation}
                             className="px-12 py-6 bg-blue-600 text-white rounded-full font-black text-xl shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest italic flex items-center gap-4"
                           >
                              <Video size={24} /> Start Consultation
                           </button>
                         ) : (
                           <div className="flex items-center gap-4">
                              <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className={cn(
                                  "w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-xl",
                                  isMuted ? "bg-red-500 text-white" : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                                )}
                              >
                                 {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                              </button>
                              <button 
                                onClick={stopConsultation}
                                className="px-12 py-6 bg-red-600 text-white rounded-full font-black text-xl shadow-2xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest italic flex items-center gap-4"
                              >
                                 <PhoneOff size={24} /> End Session
                              </button>
                           </div>
                         )}
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
