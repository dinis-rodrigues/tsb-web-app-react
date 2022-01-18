import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

// OFICIAL PRODUCTION DATABASE
const firebaseConfig = {
  apiKey: "AIzaSyAHPrWvVr1El3NkJd3C0gbZbiTl_weCTlE",
  authDomain: "tsb-aplication.firebaseapp.com",
  databaseURL: "https://tsb-aplication.firebaseio.com",
  projectId: "tsb-aplication",
  storageBucket: "tsb-aplication.appspot.com",
  messagingSenderId: "124968779478",
  appId: "1:124968779478:web:0a2c6266560c594a779377",
  measurementId: "G-0Z77DRSCH6",
};

// DEVELOPMENT DATABASE
// const firebaseConfig = {
//   apiKey: "AIzaSyBZm2feIZTi5dTGRQuJKoQUEwdh1axiSgs",
//   authDomain: "tsb-application-dev.firebaseapp.com",
//   databaseURL:
//     "https://tsb-application-dev-default-rtdb.europe-west1.firebasedatabase.app/",
//   projectId: "tsb-application-dev",
//   storageBucket: "tsb-application-dev.appspot.com",
//   messagingSenderId: "403433771845",
//   appId: "1:403433771845:web:1a4bba7416dc343ef9a42c",
// };

// Initialize Firebase
const app: firebase.app.App = firebase.initializeApp(firebaseConfig);

export const db = app.database();
export const st = app.storage();
export const auth = app.auth();
export default app;
