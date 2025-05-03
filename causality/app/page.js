"use client";
import { useState, useEffect } from 'react';
import { auth, provider } from './config';
import { getAuth, signInWithPopup, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { GoogleButton }from 'react-google-button'
import Header from "./Components/header";
import Dashboard from "./Components/dashboard";
import { BrowserRouter } from 'react-router-dom';

function Home () {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }}
  ); 
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
      else {
        setUser(null);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  }

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-4xl font-bold mb-4">Welcome to Causality</h1>
              <p className="mb-4">Please sign in to continue</p>
              <GoogleButton onClick={handleGoogleLogin} />
            </div>
        </div>
      </div>
  );
}

export default Home;