import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  // Connect to emulators only once
  if (!auth.config.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  
  if (!db._delegate._databaseId.projectId.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  if (functions.app.options.projectId !== 'demo-project') {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
}

// Offline support utilities
export const goOffline = () => disableNetwork(db);
export const goOnline = () => enableNetwork(db);

// Export the app instance
export default app;