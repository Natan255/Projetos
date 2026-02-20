// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDS-hslR0upzFXtP59pLHvK1TSu4d-oVJ0",
  authDomain: "rank-over.firebaseapp.com",
  projectId: "rank-over",
  storageBucket: "rank-over.firebasestorage.app",
  messagingSenderId: "949485307397",
  appId: "1:949485307397:web:646081311f3cd1b6b13e6c",
  measurementId: "G-VZLMLSGCVZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Exportando as funções do Firebase para facilitar o uso nos componentes
export { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword };