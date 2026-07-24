import firebase from "firebase/compat/app";
import "firebase/compat/storage";

// The config will be injected dynamically if provided by the user in localStorage
// Default config is empty, so it will throw if used without being set
export const initFirebase = (configStr) => {
  try {
    const firebaseConfig = JSON.parse(configStr);
    const app = firebase.initializeApp(firebaseConfig);
    const storage = firebase.storage();
    return { app, storage };
  } catch (err) {
    console.error("Firebase init failed:", err);
    return null;
  }
};

const savedConfig = typeof window !== 'undefined' ? localStorage.getItem('quantrex_firebase_config') : null;
export let firebaseInstance = savedConfig ? initFirebase(savedConfig) : null;

export const updateFirebaseConfig = (configStr) => {
  if (typeof window !== 'undefined') localStorage.setItem('quantrex_firebase_config', configStr);
  firebaseInstance = initFirebase(configStr);
  return firebaseInstance;
};
