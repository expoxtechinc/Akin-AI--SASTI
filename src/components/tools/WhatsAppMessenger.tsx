/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Shield, CheckCircle2, AlertCircle, Loader2, Smartphone, Code, Hash, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { sendWhatsAppMessage } from '../../services/twilioService';

export const WhatsAppMessenger: React.FC = () => {
  const [to, setTo] = useState('whatsapp:+231889824005');
  const [useTemplate, setUseTemplate] = useState(true);
  const [body, setBody] = useState('');
  const [contentSid, setContentSid] = useState('HXb5b62575e6e4ff6129ad7c8efe1f983e');
  const [var1, setVar1] = useState('12/1');
  const [var2, setVar2] = useState('3pm');
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const params: any = { to };
    if (useTemplate) {
      params.contentSid = contentSid;
      params.contentVariables = { "1": var1, "2": var2 };
    } else {
      params.body = body;
    }

    try {
      const result = await sendWhatsAppMessage(params);
      setStatus({ 
        type: 'success', 
        message: `Message queued successfully! SID: ${result.sid.substring(0, 12)}...` 
      });
    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        message: err.message || 'Failed to send message' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-200">
           <MessageSquare size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-stone-900">
          WhatsApp <span className="text-emerald-600">Enterprise</span>
        </h1>
        <p className="text-stone-500 font-medium max-w-md mx-auto italic">
          Broadcast messages and notifications via Twilio Sandbox.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Area */}
        <div className="lg:col-span-8 bg-white rounded-[40px] border border-stone-100 p-8 shadow-2xl shadow-stone-100 space-y-8">
          <form onSubmit={handleSend} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Recipient (WhatsApp ID)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600">
                  <Smartphone size={18} />
                </div>
                <input 
                  type="text" 
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="whatsapp:+123456789"
                  className="w-full pl-16 pr-6 py-5 bg-stone-50 border border-stone-100 rounded-[28px] font-bold text-stone-900 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 p-1 bg-stone-100 rounded-2xl">
              <button 
                type="button"
                onClick={() => setUseTemplate(true)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  useTemplate ? "bg-white text-emerald-600 shadow-sm" : "text-stone-400 hover:text-stone-600"
                )}
              >
                Template Mode
              </button>
              <button 
                type="button"
                onClick={() => setUseTemplate(false)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  !useTemplate ? "bg-white text-emerald-600 shadow-sm" : "text-stone-400 hover:text-stone-600"
                )}
              >
                Free Form
              </button>
            </div>

            <AnimatePresence mode="wait">
              {useTemplate ? (
                <motion.div 
                  key="template"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Content SID</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400">
                        <Code size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={contentSid}
                        onChange={(e) => setContentSid(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-stone-50 border border-stone-100 rounded-[28px] font-bold text-stone-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Date Variable ({"{{1}}"})</label>
                      <input 
                        type="text" 
                        value={var1}
                        onChange={(e) => setVar1(e.target.value)}
                        className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold text-stone-900 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Time Variable ({"{{2}}"})</label>
                      <input 
                        type="text" 
                        value={var2}
                        onChange={(e) => setVar2(e.target.value)}
                        className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl font-bold text-stone-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-xs text-emerald-800 font-medium italic leading-relaxed">
                      "Your appointment is coming up on <span className="font-black text-emerald-600">{var1 || '...'}</span> at <span className="font-black text-emerald-600">{var2 || '...'}</span>. If you need to change it, please reply back and let us know."
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="free"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Message Body</label>
                  <textarea 
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your WhatsApp message..."
                    className="w-full px-6 py-5 bg-stone-50 border border-stone-100 rounded-[28px] font-bold text-stone-900 outline-none resize-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-emerald-600 text-white rounded-[28px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Send Message</>}
            </button>
          </form>

          {status && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={cn(
                "p-4 rounded-2xl flex items-center gap-3 font-bold text-xs italic",
                status.type === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
              )}
            >
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {status.message}
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-stone-900 rounded-[40px] p-8 text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-16 -mt-16" />
            <Hash size={32} className="text-emerald-400" />
            <div className="space-y-2">
              <h4 className="text-lg font-black uppercase tracking-tighter italic">Twilio Sandbox</h4>
              <p className="text-xs text-stone-400 font-medium leading-relaxed italic">
                Test WhatsApp messaging without waiting for brand approval. Perfect for developers.
              </p>
            </div>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <Shield size={14} /> Server Proxy Active
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                <Settings size={14} /> Configurable via .env
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-[40px] p-8 border border-emerald-100 space-y-6">
             <h4 className="text-sm font-black uppercase tracking-tight italic text-emerald-950 underline decoration-emerald-200 decoration-2 underline-offset-4">Security Notice</h4>
             <p className="text-xs text-emerald-800 font-medium italic leading-relaxed">
               All Twilio credentials are stored securely on the environment side. API calls are proxied through our encrypted backend layer to prevent Auth Token exposure.
             </p>
             <div className="p-4 bg-white/50 rounded-2xl border border-white">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Status</span>
                <span className="text-xs font-bold text-emerald-950">AES-256 Tunnel Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
