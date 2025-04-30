"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../config.js";
import AutocompleteDropdown from "./autocomplete.js";

export default function Dashboard() {
  const apiKey = "d06j14pr01qg26s894bgd06j14pr01qg26s894c0";
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [symbol, setSymbol] = useState(null);
  const [user, setUser] = useState(null)
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const tickers = await getExchangeTickers();
        setEntries(tickers);
      } catch (error) {
        console.error("Error fetching tickers:", error);
      }
    };

    fetchTickers();
  }, []);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const getExchangeTickers = async () => {
    const url_nasdaq= `https://finnhub.io/api/v1/stock/symbol?exchange=US&mic=XNAS&token=${apiKey}`;
    const url_nyse = `https://finnhub.io/api/v1/stock/symbol?exchange=US&mic=XNYS&token=${apiKey}`;
    
    const response_nasdaq = await fetch(url_nasdaq);
    const response_nyse = await fetch(url_nyse);

    if (!response_nasdaq.ok || !response_nyse.ok) {
      throw new Error("Failed to fetch stock data.");
    }

    const listOfEntries = []
    const data_nasdaq = await response_nasdaq.json();
    const data_nyse = await response_nyse.json()
    for (let i = 0; i < Object.keys(data_nasdaq).length; i++ ){
      listOfEntries.push(data_nasdaq[i].displaySymbol)
    }
    for (let i = 0; i < Object.keys(data_nyse).length; i++ ){
      listOfEntries.push(data_nyse[i].displaySymbol)
    }

    return listOfEntries;
  }

  const handleAutoCompleteClick = (selectedSymbol) => {
    setSymbol(selectedSymbol)
    fetchStockData(selectedSymbol)
  }
  const fetchStockData = async (symbolToFetch) => {
    console.log(symbolToFetch)
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbolToFetch}&token=${apiKey}`;

    try {
      if (!symbolToFetch || symbolToFetch.trim() === "") {
        throw new Error("Please enter a valid stock symbol.");
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch stock data.");
      }

      const data = await response.json();

      if (!data || !data.c) {
        throw new Error("No stock data available for the given symbol.");
      }

      setPrice(data.c);
      setError(null);
    
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError(error.message);
      setPrice(null)
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-cente text-white p-4">
        <h1 className="text-4xl font-bold mr-5">Hey {user ? user.displayName : "User"}!</h1>
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
            <AutocompleteDropdown suggestions={entries} onSelect={handleAutoCompleteClick} />
          </div>
          <button
            onClick={() => fetchStockData(symbol)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
            Get Stock Price
          </button>
          <div className="mt-4">
            {price ? (
              <p className="text-green-600 font-bold">
                Current Price: <strong>${price.toFixed(2)}</strong>
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