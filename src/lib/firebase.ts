import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
  // Browser only: initialize Firebase client SDK
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  auth = getAuth(app);
  // initializeFirestore requires an app instance
  db = initializeFirestore(app, {
    cacheSizeBytes: 40 * 1024 * 1024, // 40 MB
    experimentalForceLongPolling: true,
  });
  storage = getStorage(app);

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('DEV Firebase config:', {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
    });
  }
} else {
  // Server: avoid initializing client SDK during SSR/build.
  // eslint-disable-next-line no-console
  console.warn('Firebase client SDK not initialized on server (window is undefined).')
}

export { auth, googleProvider, db, storage };