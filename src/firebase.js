import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCeWYFk-UNYodcxGbB47HRmoGna5C45zeg",
  authDomain: "quantrex-9c898.firebaseapp.com",
  projectId: "quantrex-9c898",
  storageBucket: "quantrex-9c898.firebasestorage.app",
  messagingSenderId: "941267319618",
  appId: "1:941267319618:web:f78c056aebbd3a56ad66db",
  measurementId: "G-8P1DVLRK2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
export const firebaseInstance = { storage };
export const updateFirebaseConfig = () => {};

// Function to fetch toppers data from Realtime Database
export const fetchToppersFromFirebase = async () => {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `toppers`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No toppers available in Firebase Database");
      return null;
    }
  } catch (error) {
    console.error("Error fetching toppers from Firebase:", error);
    return null;
  }
};

// Function to fetch syllabus data from Realtime Database
export const fetchSyllabusFromFirebase = async () => {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `syllabus`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No syllabus available in Firebase Database");
      return null;
    }
  } catch (error) {
    console.error("Error fetching syllabus from Firebase:", error);
    return null;
  }
};
