import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyCO_qwD-KtBoPhkzavly5zX5blhbaiOCQg",
  authDomain: "homeo-clinic-36461.firebaseapp.com",
  projectId: "homeo-clinic-36461",
  storageBucket: "homeo-clinic-36461.firebasestorage.app",
  messagingSenderId: "603470183250",
  appId: "1:603470183250:web:c00fc437f0b4028334188b",
  measurementId: "G-05NB4HZ643"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

export default app;
