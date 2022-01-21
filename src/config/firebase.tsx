import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

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
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
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
  }
} else {
  // Use production DB if we are going to build
  firebaseConfig = firebaseProductionConfig;
}
// Initialize Firebase
const app: firebase.app.App = firebase.initializeApp(firebaseConfig);

export const db = app.database();
export const st = app.storage();
export const auth = app.auth();
export default app;
