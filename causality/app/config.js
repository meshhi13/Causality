import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1cn2rzY1kT85fR5me2YrSN-So5EEOpEc",
  authDomain: "causality-57ff3.firebaseapp.com",
  projectId: "causality-57ff3",
  storageBucket: "causality-57ff3.firebasestorage.app",
  messagingSenderId: "870316205443",
  appId: "1:870316205443:web:b618c2c7de121fb86b82b6",
  measurementId: "G-X535YRXGKZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, provider, db };