// firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
} from 'firebase/auth';

// 🔹 Your Firebase configuration (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDiJukh4RGHmwerFiSryUeLERXV8TEGono",
  authDomain: "file-upload-71e58.firebaseapp.com",
  projectId: "file-upload-71e58",
  storageBucket: "file-upload-71e58.firebasestorage.app",
  messagingSenderId: "771805127469",
  appId: "1:771805127469:web:0d88b1957b79ff82dbe9a4",
  measurementId: "G-4JCH7FPHYN"
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Authentication
export const auth = getAuth(app);

// ✅ Google Provider Setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always ask user to choose account
});

// ✅ Export Auth Methods
export {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
};
