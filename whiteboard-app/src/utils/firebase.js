// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAE-b3ewDftY-kKEDZqYP4E66l7JHDghHM",
  authDomain: "whiteboard-app-5a201.firebaseapp.com",
  projectId: "whiteboard-app-5a201",
  storageBucket: "whiteboard-app-5a201.firebasestorage.app",
  messagingSenderId: "329721886326",
  appId: "1:329721886326:web:8382b582dd2e4409619157",
  measurementId: "G-KM2CL6VY8T",
  databaseURL: "https://whiteboard-app-5a201-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
export { db, rtdb};