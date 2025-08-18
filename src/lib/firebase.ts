
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase config from the Firebase console
const firebaseConfig = {
  "projectId": "boymo-finances",
  "appId": "1:172365009197:web:5cab47f18ed997fca743a4",
  "storageBucket": "boymo-finances.firebasestorage.app",
  "apiKey": "AIzaSyChwjWxCD6DRbuU8YCZyGaAKT7omEYf0Hs",
  "authDomain": "boymo-finances.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "172365009197"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
