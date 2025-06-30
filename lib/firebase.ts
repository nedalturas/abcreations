// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Check if we have a valid Firebase configuration
const hasValidConfig = () => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
};

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Initialize Firebase only if we have valid config
let app;
let db;
let auth;
let storage;

if (hasValidConfig()) {
  // Initialize Firebase
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  // Initialize Firebase services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);

  // Connect to emulators in development (optional)
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Only connect to emulators if they haven't been connected already
    try {
      // Uncomment these lines if you want to use Firebase emulators for local development
      // connectFirestoreEmulator(db, 'localhost', 8080);
      // connectAuthEmulator(auth, 'http://localhost:9099');
      // connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
      // Emulators already connected
    }
  }
} else {
  // Create mock objects when Firebase is not configured
  console.warn('Firebase configuration is incomplete. Using mock services.');
  app = null;
  db = null;
  auth = null;
  storage = null;
}

export { db, auth, storage, hasValidConfig };
export default app;