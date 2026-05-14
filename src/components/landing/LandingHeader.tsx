/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LandingHeaderProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onStart, onLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Help & Support', href: '#' },
    { label: 'Menu', href: '#' },
  ];

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-[100] transition-all duration-700",
      isScrolled ? "py-4 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/5" : "py-10 bg-transparent"
    )}>
      <div className="max-w-[1440px] mx-auto px-8 lg:px-16 flex items-center justify-between">
        <div className="flex items-center gap-16">
          <a href="#" className="group flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-indigo-600/30">
               <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
               <Zap size={22} className="text-white fill-white relative z-10" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black tracking-tighter uppercase italic font-display text-glow">AkinAI.</span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-indigo-500/80">Sokpah Intelligence Gen</span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500 hover:text-white transition-all hover:tracking-[0.4em]"
                onClick={link.label === 'Help & Support' ? onLogin : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={onLogin}
            className="hidden sm:block text-[9px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-indigo-400 transition-colors"
          >
            Terminal Login
          </button>
          
          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <button 
            onClick={onStart}
            className="group relative px-8 py-3 overflow-hidden rounded-full transition-all duration-500"
          >
            <div className="absolute inset-0 bg-white group-hover:bg-indigo-500 transition-colors duration-500" />
            <span className="relative z-10 text-black group-hover:text-white text-[9px] font-black uppercase tracking-[0.25em] transition-colors duration-500 flex items-center gap-2">
              Launch Platform <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button 
            className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full inset-x-0 bg-black border-b border-white/10 p-6 flex flex-col gap-6 lg:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className="text-sm font-black uppercase tracking-widest text-stone-400"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-white/5" />
            <button 
              onClick={onLogin}
              className="text-left text-sm font-black uppercase tracking-widest text-indigo-400"
            >
              Login / Sign Up
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
