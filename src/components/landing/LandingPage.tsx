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
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
      {/* Background Orbs/Animations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Rotating Fan/Orb Simulation */}
      <div className="relative mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="w-32 h-32 md:w-48 md:h-48 border border-white/10 rounded-full flex items-center justify-center p-4 relative"
        >
          <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-pulse" />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="w-full h-full border border-white/5 rounded-full flex items-center justify-center"
          >
            <Zap className="text-indigo-400 w-12 h-12" />
          </motion.div>
        </motion.div>
        <div className="absolute -inset-8 bg-indigo-500/10 blur-3xl rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl z-10"
      >
        <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 animate-pulse">
          AI Journey Starts Here
        </span>
        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
          Train, Optimize, & Deploy <br />
          <span className="italic font-serif">at Lightning Speed</span>
        </h1>
        <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          The ultimate stack for generative AI. 100+ models, Kubernetes-native GPU clusters, and high-performance inference engines for infinite scalability.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight size={18} />
          </button>
          <button className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white font-black uppercase tracking-widest text-sm border border-white/10 hover:bg-white/10 transition-all">
            Documentation
          </button>
        </div>
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
    { title: 'GPU as a Service', desc: 'Kubernetes-native GPU clusters built for intensive model training.', icon: Cpu },
    { title: 'AI Voicebot', desc: 'Deploy natural, low-latency voice AI agents for customer support.', icon: Mic },
    { title: 'AI Chatbot', desc: 'Intelligent, context-aware chatbots trained on your unique data.', icon: MessageSquare },
    { title: 'AI IDE Lab', desc: 'Cloud-native dev environment with AI-powered code completion.', icon: Terminal },
    { title: 'Serverless Inferencing', desc: 'Run LLM and ML model inference at scale with zero management.', icon: Layers },
    { title: 'AI Apps Builder', desc: 'Drag-and-drop studio to build and launch AI applications.', icon: Box },
  ];

  return (
    <section className="py-32 bg-[#080808] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Everything you need to build, <br /> deploy & scale AI</h2>
          <p className="text-stone-500 max-w-xl mx-auto">From raw GPU power to intelligent applications - we give you the full stack to move from idea to production at speed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 overflow-hidden">
          {services.map((service, i) => (
            <div key={i} className="p-12 bg-[#080808] hover:bg-[#0a0a0a] transition-all group">
               <service.icon className="w-10 h-10 text-indigo-500 mb-8 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-bold mb-4 uppercase">{service.title}</h3>
               <p className="text-stone-400 text-sm leading-relaxed mb-8">{service.desc}</p>
               <button className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  Explore Now <ArrowRight size={14} />
               </button>
            </div>
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
