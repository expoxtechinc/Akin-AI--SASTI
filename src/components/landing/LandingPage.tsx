/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Cpu, 
  Database, 
  Mic, 
  MessageSquare, 
  Terminal, 
  Layers, 
  Box, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Globe,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="bg-[#050505] text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      <Hero onStart={onStart} />
      <LogoCloud />
      <ModelsShowcase />
      <StackSection />
      <UseCases />
      <StatsSection />
      <Testimonials />
      <CTASection onStart={onStart} />
      <Footer />
    </div>
  );
};

const Hero = ({ onStart }: { onStart: () => void }) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 px-6 overflow-hidden bg-mesh">
      {/* Absolute Decorative Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-[25vw] h-[25vw] bg-rose-500/10 rounded-full blur-[100px] animate-float" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center max-w-[1200px] z-10 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-200">AkinAI Enterprise v4.0 Live</span>
        </motion.div>

        <h1 className="text-6xl md:text-[140px] font-black tracking-tighter leading-[0.85] mb-12 font-display uppercase italic select-none">
          Design. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500">Intelligent.</span> <br />
          Evolution.
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 mt-16 group">
          <div className="md:w-px h-12 md:h-20 bg-white/10 hidden md:block" />
          <p className="text-stone-400 text-lg md:text-xl max-w-xl text-center md:text-left leading-relaxed font-serif italic">
            "The future isn't predicted, it's computed. We provide the neural infrastructure for the next era of human creativity."
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-20">
          <button 
            onClick={onStart}
            className="group relative px-12 py-6 overflow-hidden rounded-2xl transition-all duration-500 bg-white hover:scale-105"
          >
            <div className="absolute inset-0 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-500" />
            <span className="relative z-10 text-black group-hover:text-white text-xs font-black uppercase tracking-[0.3em] transition-colors duration-500">
              Enter The Ecosystem
            </span>
          </button>

          <button className="px-12 py-6 rounded-2xl glass hover:bg-white/10 transition-all text-xs font-black uppercase tracking-[0.3em] text-white">
            View Blueprint
          </button>
        </div>
      </motion.div>

      {/* Floating UI Elements */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-20 left-10 hidden xl:block glass p-6 rounded-3xl w-64 space-y-4"
      >
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
              <ShieldCheck size={18} />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest leading-none">Security Verified</span>
        </div>
        <div className="space-y-2">
           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-500/40 animate-pulse" />
           </div>
           <div className="h-1 w-3/4 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-500/20" />
           </div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-40 right-10 hidden xl:block glass p-6 rounded-3xl w-72 space-y-4 rotate-3"
      >
        <div className="flex justify-between items-center">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Node Cluster 04</span>
           <Cpu size={14} className="text-stone-600" />
        </div>
        <div className="flex items-end gap-1">
           {[40, 70, 45, 90, 65].map((h, i) => (
             <div key={i} className="flex-1 bg-indigo-500/30 rounded-t-sm" style={{ height: `${h}%` }} />
           ))}
        </div>
        <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest text-center">Inference Engine: 99.8% Load</p>
      </motion.div>
    </section>
  );
};

const LogoCloud = () => {
  return (
    <section className="py-24 border-y border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[10px] font-bold text-stone-500 uppercase tracking-[0.4em] mb-12">
          Trusted by Industry Leaders
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
           {Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="flex justify-center flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
                <span className="text-[10px] font-bold">LOGO {i+1}</span>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
};

const ModelsShowcase = () => {
  const models = [
    { name: 'DeepSeek R1', desc: 'General-purpose chatbot with strong capabilities in research, translation, and understanding.', tag: 'CHATS' },
    { name: 'Gemma 7B', desc: 'AI chatbot designed for educational use, research, and personalized learning.', tag: 'CHATS' },
    { name: 'Llama 3.1 405B', desc: 'Advanced AI assistant for deep reasoning, knowledge retrieval, and coding.', tag: 'CHATS' },
    { name: 'Mistral-7B', desc: 'Lightweight instruction-following chatbot ideal for quick responses.', tag: 'CHATS' },
    { name: 'Nemotron-70B', desc: 'Advanced instruction-tuned model for complex reasoning and NLP tasks.', tag: 'CHATS' },
    { name: 'Llama 3.3 70B', desc: 'High-level AI for professional writing, research, and business analytics.', tag: 'CHATS' },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">100+ Generative AI Models</h2>
          <p className="text-stone-400 max-w-2xl leading-relaxed">
            Develop powerful applications with open-source and advanced generative AI models for chat, images, code, and more.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl group hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <MessageSquare size={16} />
                 </div>
                 <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{model.tag}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors uppercase">{model.name}</h3>
              <p className="text-sm text-stone-400 leading-relaxed mb-8">
                {model.desc}
              </p>
              <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 group-hover:gap-3 transition-all">
                Try This Model <ChevronRight size={14} className="text-indigo-500" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StackSection = () => {
  const services = [
    { title: 'Neural Compute', desc: 'Enterprise-grade GPU architecture engineered for massive scalability and ultra-low latency.', icon: Cpu },
    { title: 'Vocal Intelligence', desc: 'Human-parity voice models capable of complex emotional reasoning and real-time interaction.', icon: Mic },
    { title: 'Quantum Linguistics', desc: 'Advanced LLM processing with unique contextual memory and cross-domain expertise.', icon: MessageSquare },
    { title: 'Automated Dev Hub', desc: 'A self-healing code environment that writes and deploys alongside your thoughts.', icon: Terminal },
    { title: 'Hyper-Inference', desc: 'Global edge network delivering AI outputs in milliseconds, anywhere on the planet.', icon: Layers },
    { title: 'Studio One', desc: 'The most powerful interface ever built for orchestrating AI agents and workflows.', icon: Box },
  ];

  return (
    <section className="py-40 bg-black relative px-6">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#050505] to-transparent" />
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-10">
          <div className="max-w-2xl space-y-6">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Integrated Ecosystem</span>
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] font-display uppercase italic text-glow">Superior Compute. <br /> Absolute Control.</h2>
          </div>
          <p className="text-stone-500 max-w-sm text-lg font-serif italic text-right">
            "Engineered for the visionaries who require more than just power."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.02 }}
              className="p-10 glass rounded-[48px] group relative overflow-hidden"
            >
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/5 blur-[60px] group-hover:bg-indigo-600/10 transition-colors" />
               <div className="w-16 h-16 rounded-3xl bg-black border border-white/10 flex items-center justify-center text-indigo-500 mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                  <service.icon size={32} />
               </div>
               <h3 className="text-2xl font-black mb-4 uppercase tracking-tight font-display italic">{service.title}</h3>
               <p className="text-stone-400 text-sm leading-relaxed mb-10 font-medium">{service.desc}</p>
               <button className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 flex items-center gap-4 group-hover:text-white transition-colors">
                  Initialize <div className="w-8 h-px bg-indigo-500 group-hover:w-16 transition-all" />
               </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const UseCases = () => {
    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-20">
                    <div className="lg:w-1/2 space-y-8">
                        <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Use Cases</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight">We've got your use case covered</h2>
                        <p className="text-stone-400 text-lg leading-relaxed">Empower your organization with our advanced AI Acceleration Cloud platform.</p>
                    </div>
                    <div className="lg:w-1/2 space-y-px bg-white/5 border border-white/5">
                        {[
                            { title: 'AI – Model Fine Tuning', desc: 'Refine Intelligence for Your Business Needs. Customize models for domain-specific accuracy.' },
                            { title: 'Data Pipeline Optimization', desc: 'Powering AI with Efficient Data Flow. Design and optimize robust data pipelines.' },
                            { title: 'AI Model Deployment', desc: 'Smart Deployment for Continuous Excellence. Deploy, monitor, and maintain AI models.' }
                        ].map((item, i) => (
                            <div key={i} className="p-10 bg-[#050505] space-y-4">
                                <h3 className="text-xl font-bold uppercase">{item.title}</h3>
                                <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                                <button className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-white/20 pb-1">Read More</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const StatsSection = () => {
    const stats = [
        { val: '70%', label: 'Seamless Integration Support' },
        { val: '60%', label: 'Flexible Model Deployment' },
        { val: '40%', label: 'Fine-Tuning API Improvements' },
        { val: '60%', label: 'Performance Gain (Inference)' },
    ];

    return (
        <section className="py-32 bg-indigo-600 px-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2)_0%,transparent_70%)]" />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {stats.map((stat, i) => (
                        <div key={i} className="space-y-2">
                            <span className="text-5xl md:text-7xl font-black tracking-tighter text-white">{stat.val}</span>
                            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Testimonials = () => {
    return (
        <section className="py-32 px-6 bg-[#080808]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Voices of Innovation</h2>
                    <p className="text-stone-500 uppercase text-[10px] font-bold tracking-[0.4em]">How We're Shaping AI Together</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'KPMG', text: 'Optimized workflows, automating tasks and boosting efficiency across teams.' },
                        { name: 'H&R Block', text: 'Unlocked organizational knowledge, empowering faster responses.' },
                        { name: 'TomTom', text: 'Introduced an AI assistant for in-car cockpit simplification.' }
                    ].map((t, i) => (
                        <div key={i} className="p-12 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-black text-xl">
                                {t.name[0]}
                            </div>
                            <p className="text-stone-300 text-lg leading-[1.6]">"{t.text}"</p>
                            <span className="block text-[10px] font-black uppercase text-indigo-400 tracking-widest">{t.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CTASection = ({ onStart }: { onStart: () => void }) => {
    return (
        <section className="py-40 px-6 text-center">
            <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none mb-12 uppercase italic transform -rotate-1">
                Train Smarter, <br /> Faster.
            </h2>
            <button 
                onClick={onStart}
                className="px-16 py-8 bg-white text-black font-black uppercase tracking-[0.4em] text-xl hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-white/20"
            >
                Step Into The Future
            </button>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="py-24 px-6 border-t border-white/5 bg-black">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
                <div className="col-span-2 space-y-6">
                    <h3 className="text-2xl font-black tracking-tighter">AkinAI.</h3>
                    <p className="text-stone-500 max-w-xs leading-relaxed text-sm italic">
                        Leading AI and GPU cloud platform delivering high-performance solutions for the modern world.
                    </p>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Products</h4>
                    <ul className="space-y-2 text-sm text-stone-400">
                        <li>GPUs</li>
                        <li>Inference</li>
                        <li>Voicebots</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Company</h4>
                    <ul className="space-y-2 text-sm text-stone-400">
                        <li>About</li>
                        <li>Careers</li>
                        <li>Legal</li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                <span>2026 © AkinAI. All rights reserved</span>
                <Globe size={16} />
            </div>
        </footer>
    )
}
