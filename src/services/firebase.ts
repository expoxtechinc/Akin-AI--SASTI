/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Error Handler per Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    // Attempt to read a non-existent document to trigger a light-weight check
    // We use getDocs on a non-existent collection to avoid "permission denied" errors 
    // that might occur if security rules are strictly production-ready.
    await getDocs(query(collection(db, '_connection_test_'), limit(1)));
    console.log("Firebase connection established successfully.");
  } catch (error: any) {
    console.error("Firebase Connection Error Details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.error("Firebase appears to be offline or unreachable. Please verify that: \n1. Firestore is enabled in your Firebase Console.\n2. The Project ID 'akinai-d2a38' is correct.\n3. You have a stable internet connection.");
    }
  }
}
testConnection();
