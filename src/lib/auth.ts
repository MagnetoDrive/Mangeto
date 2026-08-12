import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  planStatus: string;
  createdAt: string;
  lastActive: string;
  isAnonymous: boolean;
}

/**
 * Format Firebase Auth errors into user-friendly messages
 */
export function getAuthErrorMessage(error: any): string {
  const code = error?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled in Firebase Console.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    case "auth/unauthorized-domain":
      const host = typeof window !== "undefined" ? window.location.hostname : "preview domain";
      return `Domain (${host}) is not in your Firebase Authorized Domains list. Use Email & Password sign-in above, or add '${host}' to Firebase Console > Authentication > Settings > Authorized Domains.`;
    case "auth/network-request-failed":
      return "Network connection failed. Please check your internet connection.";
    default:
      return error?.message || "An unexpected authentication error occurred.";
  }
}

/**
 * Ensure user profile document exists in Firestore /users/{uid}
 */
export async function syncUserProfile(user: User, customDisplayName?: string): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const now = new Date().toISOString();
  let existingPlan = "Free";

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      existingPlan = data.planStatus || "Free";
    }
  } catch (err) {
    console.warn("Could not read user doc prior to sync:", err);
  }

  const displayName = customDisplayName || user.displayName || user.email?.split("@")[0] || "Magneto Creator";

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName,
    photoURL: user.photoURL || null,
    planStatus: existingPlan,
    createdAt: now,
    lastActive: now,
    isAnonymous: user.isAnonymous
  };

  try {
    await setDoc(userRef, {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      planStatus: profile.planStatus,
      lastActive: now,
      ...(user.isAnonymous ? {} : { registeredUser: true })
    }, { merge: true });
  } catch (err) {
    console.warn("User profile sync to Firestore note:", err);
  }

  return profile;
}

/**
 * Register new user with Email & Password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch (err) {
      console.warn("Failed to set display name profile:", err);
    }
  }
  return await syncUserProfile(cred.user, displayName);
}

/**
 * Sign in existing user with Email & Password
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return await syncUserProfile(cred.user);
}

/**
 * Sign in or Register with Google OAuth Popup
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  return await syncUserProfile(cred.user);
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Sign Out Current User
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen to real-time auth state changes
 */
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
