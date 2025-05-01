"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "../config.js";
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import AutocompleteDropdown from "./autocomplete.js";
import { Routes, Route, Link } from 'react-router-dom';

export default function Dashboard() {
  const apiKey = "d06j14pr01qg26s894bgd06j14pr01qg26s894c0";
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [symbol, setSymbol] = useState(null);
  const [user, setUser] = useState(null);
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);
  const [allTickers, setAllTickers] = useState([])
  const [watchlist, setWatchlist] = useState([]);

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

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleAddToList = async (symbolToAdd) => {
    symbolToAdd = symbolToAdd ? symbolToAdd.toUpperCase() : null
    await setSymbol(null);
    await setPrice(null);

    const stockObject = {
      symbol: symbolToAdd,
      price: price,
      date: new Date(),
      userId: user?.uid,
    };

    try {
      if (!symbolToAdd) {
        throw new Error("No symbolToAdd provided");
      }
      if (allTickers.includes(symbolToAdd)) {
        throw new Error("Symbol already added");
      }
      const docRef = await addDoc(collection(db, user?.uid), stockObject);
      toast.success(symbolToAdd + " added to watchlist", {
        style: {
          backgroundColor: "#5ced7380",
          color: "#ffffff",
          fontWeight: "bold",
          textAlign: "center",
        }
      });
      console.log("Stock added with ID: ", docRef.id);
      fetchWatchlist();
    } catch (error) {
      if (allTickers.includes(symbolToAdd)) {
        toast.info("Stock has already been added!", {
          style: {
            backgroundColor: "#95b9f0",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "center"
          }
        });
      }
      else {
        console.error("Error adding stock: ", error);
        toast.error("Could not add stock to watchlist", {
          style: {
            backgroundColor: "#ed766d",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "center"
          }
        });
      }
    }
  };

  const fetchWatchlist = async () => {
    try {
      const q = query(collection(db, user?.uid));
      const querySnapshot = await getDocs(q);
      const stocks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWatchlist(stocks);
      setAllTickers(querySnapshot.docs.map(doc => (doc.data().symbol)))
    } catch (error) {
      console.error("Error fetching watchlist: ", error);
    }
  };

  const getExchangeTickers = async () => {
    const url_nasdaq = `https://finnhub.io/api/v1/stock/symbol?exchange=US&mic=XNAS&token=${apiKey}`;
    const url_nyse = `https://finnhub.io/api/v1/stock/symbol?exchange=US&mic=XNYS&token=${apiKey}`;

    const response_nasdaq = await fetch(url_nasdaq);
    const response_nyse = await fetch(url_nyse);

    if (!response_nasdaq.ok || !response_nyse.ok) {
      throw new Error("Failed to fetch stock data.");
    }

    const listOfEntries = [];
    const data_nasdaq = await response_nasdaq.json();
    const data_nyse = await response_nyse.json();
    for (let i = 0; i < Object.keys(data_nasdaq).length; i++) {
      listOfEntries.push(data_nasdaq[i].displaySymbol);
    }
    for (let i = 0; i < Object.keys(data_nyse).length; i++) {
      listOfEntries.push(data_nyse[i].displaySymbol);
    }

    return listOfEntries;
  };

  const handleAutoCompleteClick = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    fetchStockData(selectedSymbol);
  };

  const fetchStockData = async (symbolToFetch) => {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbolToFetch.toUpperCase()}&token=${apiKey}`;

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
      setPrice(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center text-white p-4">
          <h1 className="text-4xl font-bold">Hey {user ? user.displayName : "User"}!</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-600">Stock Price Checker</h2>
          <div className="mb-4">
            <label htmlFor="symbol" className="block text-gray-700 font-medium mb-2">
              Enter Stock Symbol:
            </label>
            <AutocompleteDropdown 
              suggestions={entries}
              onSelect={handleAutoCompleteClick} 
              symbol={symbol} 
              setSymbol={setSymbol}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => fetchStockData(symbol)}
              className="w-full md:w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md border-1 border-white cursor-pointer"
            >
              Get Quote
            </button>
            <button
              onClick={() => handleAddToList(symbol)}
              className="w-full md:w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md border-1 border-white cursor-pointer"
            >
              Add to List
            </button>
          </div>
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
      <ToastContainer autoClose={1500} position="bottom-right" />
    </div>
  );
}