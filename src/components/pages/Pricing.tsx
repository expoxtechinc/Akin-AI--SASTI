/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, Star, Shield, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for exploring the possibilities of AkinAI.',
    features: ['Standard AI Models', '100 requests per day', 'Public Group Chat Access', 'Community Support'],
    color: 'stone',
    buttonText: 'Current Plan'
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'Advanced engines for power users and creators.',
    features: ['Elite AI Engines (v3.1)', 'Unlimited Live Conversations', 'Private Room Creation', 'Early Access Features', 'Priority Support'],
    color: 'indigo',
    popular: true,
    buttonText: 'Upgrade Now'
  },
  {
    name: 'Family',
    price: '$39',
    description: 'Shared intelligence for the whole household.',
    features: ['Up to 5 members', 'Shared Memory Sync', 'Parental Controls', 'Private Family Feed', 'Concierge Support'],
    color: 'rose',
    buttonText: 'Get Started'
  }
];

export const Pricing: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-stone-900 italic uppercase">
          Choose Your <span className="text-indigo-600">Power Level</span>
        </h1>
        <p className="text-stone-500 font-medium max-w-xl mx-auto">
          Scale your creative and emotional intelligence with our specialized subscription plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative bg-white rounded-[48px] p-8 border-2 transition-all hover:shadow-2xl flex flex-col",
              plan.popular ? "border-indigo-600 shadow-xl shadow-indigo-100" : "border-stone-100"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight text-stone-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-black text-stone-900">{plan.price}</span>
                <span className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">/ month</span>
              </div>
              <p className="text-stone-500 text-xs font-medium mt-4 leading-relaxed italic">
                {plan.description}
              </p>
            </div>

            <div className="space-y-4 flex-1">
              {plan.features.map((feature, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                    plan.popular ? "bg-indigo-100 text-indigo-600" : "bg-stone-100 text-stone-400"
                  )}>
                    <Check size={10} />
                  </div>
                  <span className="text-[13px] font-medium text-stone-600">{feature}</span>
                </div>
              ))}
            </div>

            <button className={cn(
              "w-full mt-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95",
              plan.popular 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700" 
                : "bg-stone-100 text-stone-900 hover:bg-stone-200"
            )}>
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 pt-20 border-t border-stone-100">
         <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Frequently Asked <span className="text-rose-500">Curiosities</span></h2>
            <div className="space-y-8">
               {[
                 { q: 'Can I switch plans anytime?', a: 'Of course. Your subscription is as fluid as our AI models. Upgrade or downgrade whenever you need.' },
                 { q: 'What happens if I exceed my limit?', a: 'You will transition to our "Grace Mode" with slightly higher latency until the next cycle resets.' },
                 { q: 'Is my data secure?', a: 'We use military-grade encryption and strict privacy protocols. Your data is yours alone.' }
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <h4 className="font-black uppercase tracking-tight text-stone-900 text-sm">/ {item.q}</h4>
                    <p className="text-sm text-stone-500 leading-relaxed font-medium">{item.a}</p>
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-stone-50 rounded-[48px] p-12 flex flex-col justify-center items-center text-center space-y-6 border border-stone-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100">
               <Shield size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Enterprise Scaling</h3>
            <p className="text-stone-500 text-sm font-medium italic">Requirement for dedicated infrastructure and custom model training? Our team is ready to architect your bespoke solution.</p>
            <button className="flex items-center gap-2 text-stone-900 font-black uppercase text-[10px] tracking-widest hover:gap-4 transition-all">
               Speak with an Architect <ArrowRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};
