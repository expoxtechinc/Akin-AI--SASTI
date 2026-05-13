/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Megaphone, ShoppingBag, ArrowRight } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

export const AdOverlay: React.FC = () => {
  const [ad, setAd] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenAd, setHasSeenAd] = useState(false);

  useEffect(() => {
    // Fetch the most recent ad
    const q = query(
      collection(db, 'posts'),
      where('type', '==', 'ads'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const adData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setAd(adData);
        
        // Show ad if it's new or user hasn't seen one this session
        if (!hasSeenAd) {
          setTimeout(() => {
            setIsOpen(true);
            setHasSeenAd(true);
          }, 3000); // Delay for 3 seconds after load
        }
      }
    });

    return () => unsubscribe();
  }, [hasSeenAd]);

  if (!ad) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-all z-10"
            >
              <X size={20} />
            </button>

            <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative bg-stone-100">
               <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
               <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                  <Megaphone size={12} /> Sponsored Ad
               </div>
            </div>

            <div className="w-full md:w-1/2 p-12 flex flex-col justify-center gap-6">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black tracking-tight leading-none text-stone-900 uppercase italic">
                    {ad.title}
                  </h2>
                  <p className="text-stone-500 text-lg leading-relaxed">
                    {ad.content}
                  </p>
               </div>

               <div className="flex flex-col gap-4">
                  <button 
                    className="group w-full py-6 bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Get it Now <ShoppingBag size={20} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-stone-400 font-bold uppercase tracking-widest text-[10px] hover:text-stone-600 transition-colors"
                  >
                    No thanks, continue to AkinAI
                  </button>
               </div>

               <div className="pt-8 border-t border-stone-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                     <ArrowRight size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ad partner verified by AkinAI</span>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
