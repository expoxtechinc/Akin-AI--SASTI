import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Video, 
  Image as ImageIcon, 
  MoreVertical, 
  Send,
  Loader2,
  Trash2,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  increment,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { cn } from '../../lib/utils';

interface SocialPost {
  id: string;
  content: string;
  type: 'post' | 'reel';
  mediaUrl?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likesCount: number;
  createdAt: any;
  hasLiked?: boolean;
}

export const SocialSpace: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'post' | 'reel'>('post');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'social_posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SocialPost[];
      
      // Check user likes for each post
      if (auth.currentUser) {
        const updateLikes = async () => {
          const postsWithLikes = await Promise.all(postsData.map(async (post) => {
            const likeDoc = await getDoc(doc(db, `social_posts/${post.id}/likes`, auth.currentUser?.uid || 'none'));
            return { ...post, hasLiked: likeDoc.exists() };
          }));
          setPosts(postsWithLikes);
          setIsLoading(false);
        };
        updateLikes();
      } else {
        setPosts(postsData);
        setIsLoading(false);
      }
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newContent.trim()) return;

    const user = auth.currentUser;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'social_posts'), {
        content: newContent,
        type: newType,
        mediaUrl: newMediaUrl || null,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'AkinAI User',
        authorAvatar: user.photoURL || null,
        likesCount: 0,
        createdAt: serverTimestamp()
      });
      
      setNewContent('');
      setNewMediaUrl('');
      setIsCreating(false);
    } catch (error) {
      console.error("Create Post Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (post: SocialPost) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const likeRef = doc(db, `social_posts/${post.id}/likes`, userId);
    const postRef = doc(db, 'social_posts', post.id);

    try {
      if (post.hasLiked) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef, { userId, createdAt: serverTimestamp() });
        await updateDoc(postRef, { likesCount: increment(1) });
      }
    } catch (error) {
      console.error("Like Toggle Error:", error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, 'social_posts', postId));
    } catch (error) {
      console.error("Delete Post Error:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-white overflow-hidden max-w-2xl mx-auto border-x border-white/5 h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
        <h2 className="text-xl font-black tracking-tight italic uppercase">Social Space</h2>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
             Community Feed
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto customized-scrollbar p-4 space-y-6">
        {/* Create Box */}
        {auth.currentUser ? (
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-4">
            {!isCreating ? (
              <div 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setIsCreating(true)}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white uppercase overflow-hidden">
                  {auth.currentUser.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="" />
                  ) : (
                    auth.currentUser.email?.[0] || 'A'
                  )}
                </div>
                <div className="flex-1 bg-white/5 border border-white/5 py-2.5 px-4 rounded-full text-stone-500 text-sm font-medium group-hover:bg-white/10 transition-all">
                  What's on your mind?
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  autoFocus
                  placeholder="What's on your mind?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-stone-600 resize-none min-h-[120px] text-lg font-medium"
                />
                
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <button 
                       type="button" 
                       onClick={() => setNewType('post')}
                       className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                          newType === 'post' ? "bg-indigo-600 border-indigo-600" : "bg-white/5 border-white/10 text-stone-400"
                       )}
                     >
                       Full Post
                     </button>
                     <button 
                       type="button" 
                       onClick={() => setNewType('reel')}
                       className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                          newType === 'reel' ? "bg-indigo-600 border-indigo-600" : "bg-white/5 border-white/10 text-stone-400"
                       )}
                     >
                       Reel Mode
                     </button>
                   </div>
                   
                   <input 
                     type="text"
                     placeholder="Optional: Image/Video URL"
                     value={newMediaUrl}
                     onChange={(e) => setNewMediaUrl(e.target.value)}
                     className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-stone-300 focus:border-indigo-500 outline-none"
                   />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <button type="button" className="text-stone-500 hover:text-indigo-400 transition-colors uppercase text-[10px] font-black tracking-widest flex items-center gap-2">
                       <ImageIcon size={16} /> Photo
                    </button>
                    <button type="button" className="text-stone-500 hover:text-indigo-400 transition-colors uppercase text-[10px] font-black tracking-widest flex items-center gap-2">
                       <Video size={16} /> Video
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                       type="button" 
                       onClick={() => setIsCreating(false)}
                       className="text-stone-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
                     >
                       Cancel
                     </button>
                     <button 
                       type="submit"
                       disabled={!newContent.trim() || isSubmitting}
                       className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                     >
                       {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                       Publish
                     </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white/5 border border-indigo-500/20 rounded-[24px] p-6 text-center space-y-4">
             <h3 className="text-lg font-black uppercase tracking-tight italic">Join the global conversation</h3>
             <p className="text-stone-500 text-sm">Sign in to share your thoughts, posts, and reels with the AkinAI community.</p>
          </div>
        )}

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
             <Users size={48} className="text-stone-600" />
             <p className="text-stone-600 font-bold uppercase tracking-widest text-[10px]">No interactions yet in the matrix</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/5 border border-white/5 rounded-[32px] overflow-hidden group hover:bg-white/10 transition-all hover:border-white/10"
                >
                  {/* Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center overflow-hidden border border-white/5">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt="" />
                        ) : (
                          <span className="font-bold text-stone-500">{post.authorName[0]}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white italic uppercase tracking-tighter">{post.authorName}</h4>
                        <span className="text-[8px] font-medium text-stone-600 uppercase tracking-widest">
                          {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleTimeString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                    {auth.currentUser?.uid === post.authorId && (
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-stone-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-4 space-y-4">
                    <p className="text-sm text-stone-200 leading-relaxed font-medium">
                      {post.content}
                    </p>

                    {post.mediaUrl && (
                      <div className={cn(
                        "rounded-2xl overflow-hidden bg-black/40 relative group/media",
                        post.type === 'reel' ? "aspect-[9/16] max-h-[500px]" : "aspect-video"
                      )}>
                        {post.type === 'reel' ? (
                          <video 
                            src={post.mediaUrl} 
                            className="w-full h-full object-cover" 
                            controls 
                          />
                        ) : (
                          <img 
                            src={post.mediaUrl} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        {post.type === 'reel' && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                             <Play size={10} fill="currentColor" /> Reel
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 border-t border-white/5 flex items-center gap-8 bg-black/20">
                    <button 
                      onClick={() => toggleLike(post)}
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                        post.hasLiked ? "text-red-500 scale-110" : "text-stone-500 hover:text-white"
                      )}
                    >
                      <Heart size={18} fill={post.hasLiked ? "currentColor" : "none"} />
                      {post.likesCount || 0}
                    </button>
                    <button className="flex items-center gap-2 text-stone-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                      <MessageCircle size={18} />
                      Comment
                    </button>
                    <button className="flex items-center gap-2 text-stone-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                      <Share2 size={18} />
                      Share
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

// Minimalist fallback icons for Users if not imported correctly
const Users = ({ size, className }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
