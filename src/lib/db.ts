import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase.ts';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. User Profiles
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  createdAt: string;
}

export async function syncUserProfile(uid: string, email: string, displayName: string, photoURL: string): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    // Check if user is admin based on bootstrapped email
    const isAdmin = email === 'gildedlensstudio2005@gmail.com';

    if (userDoc.exists()) {
      const data = userDoc.data();
      const updatedProfile: UserProfile = {
        uid,
        email,
        displayName: displayName || data.displayName || 'AkinAI User',
        photoURL: photoURL || data.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        isAdmin,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      
      await setDoc(userDocRef, updatedProfile);
      return updatedProfile;
    } else {
      const newProfile: UserProfile = {
        uid,
        email,
        displayName: displayName || 'AkinAI User',
        photoURL: photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        isAdmin,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// 2. Conversations
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const path = `users/${userId}/conversations`;
  try {
    const q = query(collection(db, 'users', userId, 'conversations'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as Conversation);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function createConversation(userId: string, title: string): Promise<Conversation> {
  const convId = 'conv_' + Math.random().toString(36).substring(2, 11);
  const path = `users/${userId}/conversations/${convId}`;
  const now = new Date().toISOString();
  
  const conversation: Conversation = {
    id: convId,
    userId,
    title,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'users', userId, 'conversations', convId), conversation);
    return conversation;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function deleteConversation(userId: string, convId: string): Promise<void> {
  const path = `users/${userId}/conversations/${convId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'conversations', convId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// 3. Messages
export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export async function getMessages(userId: string, convId: string): Promise<Message[]> {
  const path = `users/${userId}/conversations/${convId}/messages`;
  try {
    const q = query(
      collection(db, 'users', userId, 'conversations', convId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as Message);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function addMessage(userId: string, convId: string, role: 'user' | 'model', content: string, imageUrl?: string): Promise<Message> {
  const msgId = 'msg_' + Math.random().toString(36).substring(2, 11);
  const path = `users/${userId}/conversations/${convId}/messages/${msgId}`;
  const now = new Date().toISOString();

  const message: Message = {
    id: msgId,
    conversationId: convId,
    userId,
    role,
    content,
    createdAt: now,
  };
  if (imageUrl) {
    message.imageUrl = imageUrl;
  }

  try {
    // Add message
    await setDoc(doc(db, 'users', userId, 'conversations', convId, 'messages', msgId), message);
    
    // Update conversation updatedAt timestamp
    await updateDoc(doc(db, 'users', userId, 'conversations', convId), {
      updatedAt: now,
    });

    return message;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// 4. Admin News & Information
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  publishedBy: string;
  createdAt: string;
}

export async function getNews(): Promise<NewsItem[]> {
  const path = 'news';
  try {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as NewsItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function publishNews(title: string, content: string, publishedBy: string): Promise<NewsItem> {
  const newsId = 'news_' + Math.random().toString(36).substring(2, 11);
  const path = `news/${newsId}`;
  
  const newsItem: NewsItem = {
    id: newsId,
    title,
    content,
    publishedBy,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'news', newsId), newsItem);
    return newsItem;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function deleteNewsItem(newsId: string): Promise<void> {
  const path = `news/${newsId}`;
  try {
    await deleteDoc(doc(db, 'news', newsId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}
