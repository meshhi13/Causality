"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import YahooFinance from "yahoo-finance2";
import app from "@/config.js";

function Dashboard() {
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [symbol, setSymbol] = useState("goog");
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUser(user);
        } else {
            router.push("/");
        }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        router.push("/");
    } catch (error) {
        console.error("Error signing out: ", error);  
    }
  };

  const fetchStockPrice = async () => {
    try {
        const result = await YahooFinance.quote("AAPL");
        setPrice(result.regularMarketPrice);
        setError(null);
    } catch (err) {
        console.error("Error fetching stock price: ", err);
        setError("Failed to fetch stock price. Please check the symbol.");
        setPrice(null);
    }
  };
  
  useEffect(() => {
    fetchStockPrice();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center bg-background text-white p-4">
        <h1 className="text-4xl font-bold">Hey {user ? user.displayName : "User"}!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <div className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-600">Stock Price Checker</h2>
          <div className="mb-4">
            <label htmlFor="symbol" className="block text-gray-700 font-medium mb-2">
              Enter Stock Symbol:
            </label>
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchStockPrice}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
            Get Stock Price
          </button>
          <div className="mt-4">
            {price ? (
              <p className="text-green-600 font-bold">
                Current Price: <strong>${price}</strong>
              </p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <p className="text-gray-600">Enter a stock symbol to get the price.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;