import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2rwMQDf3FXl5LzX-gXSveeLGfD4dLBCI",
  authDomain: "placement-prep-7ad94.firebaseapp.com",
  projectId: "placement-prep-7ad94",
  storageBucket: "placement-prep-7ad94.firebasestorage.app",
  messagingSenderId: "1014696113604",
  appId: "1:1014696113604:web:66ae4f525fba886f232091",
  measurementId: "G-DS21RC9DY1",
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics is browser-only; load lazily to avoid SSR errors.
export async function initAnalytics() {
  if (typeof window === "undefined") return;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) getAnalytics(app);
  } catch {
    /* analytics is optional */
  }
}

export default app;
