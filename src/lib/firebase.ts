import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { initializeFirestore, doc, setDoc, setLogLevel, memoryLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import appletConfig from "../../firebase-applet-config.json";

// Keep setLogLevel at "warn" in development so real warnings/errors are visible
setLogLevel("warn");

// Defensive initialization with dynamic environment variables or provisioned applet configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId
};

const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || appletConfig.firestoreDatabaseId;

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: memoryLocalCache(),
}, databaseId);
export const storage = getStorage(app);

// Keep persistent anonymous user credentials so the user always has a secure id
export async function initializeAnonymousSession(
  onUserReady: (uid: string) => void,
  onAuthError?: (error: any) => void
) {
  try {
    const userCredential = await signInAnonymously(auth);
    if (userCredential.user) {
      console.log("Firebase Anonymous Auth active:", userCredential.user.uid);
      onUserReady(userCredential.user.uid);
      await testConnection();
    }
  } catch (error: any) {
    const errorCode = error?.code || "";
    const isNetworkErr = errorCode.includes("network-request-failed") || error?.message?.includes("network");
    
    // Retrieve or create a stable browser offline UID
    let offlineUid = localStorage.getItem("magneto_offline_uid");
    if (!offlineUid) {
      offlineUid = `offline_magneto_${Date.now()}`;
      localStorage.setItem("magneto_offline_uid", offlineUid);
    }

    if (isNetworkErr) {
      console.warn("Firebase Auth network connection unavailable. Running seamlessly in local storage mode:", offlineUid);
      onUserReady(offlineUid);
    } else {
      console.error("Firebase Anonymous Auth error:", error);
      onUserReady(offlineUid);
      if (onAuthError) {
        onAuthError(error);
      }
    }
  }
}

// Verify connection by writing a test document to Firestore collection 'healthcheck' on startup
export async function testConnection() {
  try {
    const healthRef = doc(db, "healthcheck", "startup_check");
    await setDoc(healthRef, {
      timestamp: new Date().toISOString(),
      clientStatus: "ready",
      appId: "magneto"
    });
    console.log("Firestore connected");
  } catch (error: any) {
    console.warn("Firestore connection check note (offline/rules fallback):", error?.message || error);
  }
}

testConnection();
