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
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl" 
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 text-stone-500 hover:text-white transition-colors"
            >
              <X />
            </button>

            <div className="p-12 text-white">
              <div className="mb-12">
                 <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">
                   {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                 </h2>
                 <p className="text-stone-500 text-sm">
                   Join the most advanced AI acceleration cloud in the world.
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                     <User className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                     <input 
                       type="text" 
                       placeholder="Full Name"
                       className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                     />
                  </div>
                )}
                <div className="relative">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="Email Address"
                     className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                     required
                   />
                </div>
                <div className="relative">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Password"
                     className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500/50 transition-all font-bold text-sm"
                     required
                   />
                </div>

                {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>}

                <div className="pt-4">
                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Login' : 'Sign Up')} <ArrowRight size={18} />
                   </button>
                </div>
                
                <div className="relative py-4">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                   <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-stone-600"><span className="bg-[#0a0a0a] px-4">Or Continue With</span></div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                  >
                     Google Account
                  </button>
                  <button 
                    type="button"
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-white/10 transition-all opacity-50 cursor-not-allowed"
                  >
                     <Github size={18} /> Github Account
                  </button>
                </div>
              </form>

              <div className="mt-12 text-center">
                 <button 
                   onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                   className="text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-white transition-colors"
                 >
                   {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
