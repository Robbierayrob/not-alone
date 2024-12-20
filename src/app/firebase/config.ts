import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Validate environment variables
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('Firebase environment variables are missing. Check your .env.local file.');
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCULPTI0o9CEnr1ek6yRgCUgaVcH1zswNk",
  authDomain: "notalone-de4fc.firebaseapp.com",
  projectId: "notalone-de4fc",
  storageBucket: "notalone-de4fc.firebasestorage.app",
  messagingSenderId: "784029337452",
  appId: "1:784029337452:web:9d75d1d9e61b9188e05549",
  measurementId: "G-5XQNBH4V1B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  console.log('Connecting to Firebase emulators...');
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

// Debug output
console.log('Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  environment: process.env.NODE_ENV
});

