import { FirebaseApp, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

let firebaseConfig = {};

// DATABASE
const firebaseProductionConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const firebaseDevConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY_DEV,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN_DEV,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL_DEV,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID_DEV,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_DEV,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID_DEV,
  appId: process.env.REACT_APP_FIREBASE_APP_ID_DEV,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID_DEV,
};

// Check if we are in development and if DEV api key exists
if (
  process.env.NODE_ENV === "development" &&
  process.env.REACT_APP_FIREBASE_API_KEY
) {
  if (
    process.env.OVERRIDE_DEVELOPMENT &&
    process.env.OVERRIDE_DEVELOPMENT === "TRUE"
  ) {
    firebaseConfig = firebaseProductionConfig;
  } else {
    firebaseConfig = firebaseDevConfig;
    console.log("Using development firebase config");
  }
} else {
  // Use production DB if we are going to build
  firebaseConfig = firebaseProductionConfig;
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const st = getStorage(app);
export const auth = getAuth(app);

export default app;
