import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// The config will be injected dynamically if provided by the user in localStorage
// Default config is empty, so it will throw if used without being set
export const initFirebase = (configStr) => {
  try {
    const firebaseConfig = JSON.parse(configStr);
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    return { app, storage };
  } catch (err) {
    console.error("Firebase init failed:", err);
    return null;
  }
};

const savedConfig = localStorage.getItem('quantrex_firebase_config');
export let firebaseInstance = savedConfig ? initFirebase(savedConfig) : null;

export const updateFirebaseConfig = (configStr) => {
  localStorage.setItem('quantrex_firebase_config', configStr);
  firebaseInstance = initFirebase(configStr);
  return firebaseInstance;
};
