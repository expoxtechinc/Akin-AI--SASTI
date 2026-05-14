/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Github, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '../../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (isAdmin?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const isAdmin = email === 'aki.sokpah.link@gmail.com';
        onSuccess(isAdmin);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        onSuccess(email === 'aki.sokpah.link@gmail.com');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const isAdmin = result.user.email === 'aki.sokpah.link@gmail.com';
      onSuccess(isAdmin);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050505]/90 backdrop-blur-3xl" 
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="relative w-full max-w-[480px] bg-[#0A0A0A] border border-white/10 rounded-[64px] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] bg-mesh"
          >
            <button 
              onClick={onClose}
              className="absolute top-10 right-10 p-4 bg-white/5 rounded-full border border-white/10 text-stone-500 hover:text-white transition-all transform hover:rotate-90 z-20"
            >
              <X size={20} />
            </button>

            <div className="p-16 text-white relative z-10">
              <div className="mb-16 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 mb-8 transform -rotate-3 group-hover:rotate-0 transition-transform">
                    <Lock size={36} className="text-white" />
                 </div>
                 <h2 className="text-4xl font-black tracking-tighter italic font-display uppercase text-glow mb-2">
                   {mode === 'login' ? 'Terminal_Access' : 'Initialize_Node'}
                 </h2>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">
                   Intelligence Synchronization Required
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'signup' && (
                  <div className="relative group">
                     <User className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                     <input 
                       type="text" 
                       placeholder="FULL_IDENTITY_NAME"
                       value={displayName}
                       onChange={(e) => setDisplayName(e.target.value)}
                       className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[32px] outline-none focus:border-indigo-500/50 transition-all font-black text-xs uppercase tracking-widest italic"
                     />
                  </div>
                )}
                <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="ADMIN_PROTOCOL_EMAIL"
                     className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[32px] outline-none focus:border-indigo-500/50 transition-all font-black text-xs uppercase tracking-widest italic"
                     required
                   />
                </div>
                <div className="relative group">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="ENCRYPTION_KEY"
                     className="w-full pl-16 pr-6 py-6 bg-white/5 border border-white/10 rounded-[32px] outline-none focus:border-indigo-500/50 transition-all font-black text-xs uppercase tracking-widest italic"
                     required
                   />
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[9px] font-black uppercase tracking-widest italic text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="pt-6">
                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full relative group py-8 rounded-[40px] overflow-hidden transition-all duration-700 disabled:opacity-50"
                   >
                     <div className="absolute inset-0 bg-white group-hover:bg-indigo-600 transition-all duration-700" />
                     <span className="relative z-10 text-black group-hover:text-white text-xs font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                       {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Sync_Access' : 'Forge_Key')} 
                       <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                     </span>
                   </button>
                </div>
              </form>

              <div className="mt-16 text-center space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-700">Alternate Protocols</span>
                    <div className="h-px flex-1 bg-white/5" />
                 </div>
                 
                 <button 
                   onClick={handleGoogleLogin}
                   className="w-full py-5 bg-white/5 border border-white/10 rounded-[32px] text-stone-400 font-black uppercase tracking-[0.3em] text-[9px] flex items-center justify-center gap-4 hover:bg-white/10 hover:text-white transition-all group"
                 >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse group-hover:scale-150 transition-transform" />
                    Google Intelligence Login
                 </button>

                 <button 
                   onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                   className="block w-full text-[9px] font-black uppercase tracking-[0.25em] text-stone-600 hover:text-indigo-400 transition-colors pt-4"
                 >
                   {mode === 'login' ? "New Intelligence Entity? Initialize_Here" : "Existing Node identified? Terminate_&_Access"}
                 </button>
              </div>
            </div>
            
            {/* Absolute Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 blur-[100px] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
