"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, deleteDoc, doc, setDoc, getDoc, addDoc, where } from "firebase/firestore";
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";

export default function Account() {
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedStockPrice, setSelectedStockPrice] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState(null);
  
  const handleSellAsset = async () => {
    try {
      const assetsRef = collection(db, "users", user?.uid, "assets");
      const assetQuery = query(assetsRef, where("symbol", "==", selectedStock));
      const assetSnapshot = await getDocs(assetQuery);
  
      if (!assetSnapshot.empty) {
        const assetDoc = assetSnapshot.docs[0];
        const assetDocRef = doc(db, "users", user?.uid, "assets", assetDoc.id);
        const currentAsset = assetDoc.data();
  
        if (quantity > currentAsset.stockQuantity) {      
          throw new Error("Sell quantity exceeds available quantity.");
        }
  
        const updatedQuantity = currentAsset.stockQuantity - quantity;
  
        if (updatedQuantity > 0) {
          await setDoc(assetDocRef, {
            ...currentAsset,
            stockQuantity: updatedQuantity,
          });
        } else {
          await deleteDoc(assetDocRef);
        }
  
        const balanceDocRef = doc(db, "users", user?.uid);
        const balanceDoc = await getDoc(balanceDocRef);
  
        if (!balanceDoc.exists()) {
          throw new Error("User balance document does not exist.");
        }
  
        const currentBalance = balanceDoc.data().balance;
        const totalSaleValue = quantity * selectedStockPrice;
  
        await setDoc(balanceDocRef, {
          ...balanceDoc.data(),
          balance: currentBalance + totalSaleValue,
        });
  
        setAssets((prev) =>
          prev
            .map((asset) =>
              asset.id === assetDoc.id
                ? { ...asset, stockQuantity: updatedQuantity }
                : asset
            )
            .filter((asset) => asset.stockQuantity > 0)
        );
  
        setBalance((prev) => prev + totalSaleValue);
  
        closePopup();
        toast.success(`Sold ${quantity} shares of ${selectedStock}`, {
            style: {
                backgroundColor: "#5ced7380",   
                fontWeight: "lighter",
                fontSize: 15
            }
        });
      } else {
        throw new Error("Asset not found in user's assets.");
      }
    } catch (error) {
      toast.error("Could not sell assets.", {
          style: {
              backgroundColor: "#ed766d",
              fontWeight: "lighter",
              fontSize: 15
            }
      });
      console.error("Error selling asset:", error);
      closePopup();
    }
  };

  const handleQuantityPurchase = async () => {
    try {
      const balanceDocRef = doc(db, "users", user?.uid);
      const balanceDoc = await getDoc(balanceDocRef);

      if (!balanceDoc.exists()) {
        throw new Error("User balance document does not exist.");
      }

      const currentBalance = balanceDoc.data().balance;
      const totalCost = selectedStockPrice * quantity;

      if (currentBalance < totalCost) {
        throw new Error("Insufficient balance to complete the purchase.");
      }

      await setDoc(balanceDocRef, {
        ...balanceDoc.data(),
        balance: currentBalance - totalCost,
      });

      const assetsRef = collection(db, "users", user?.uid, "assets");
      const purchasesRef = collection(db, "users", user?.uid, "purchases");

      const purchaseObject = {
        symbol: selectedStock,
        price: selectedStockPrice,
        stockQuantity: quantity,
        date: new Date(),
      };

      const assetQuery = query(assetsRef, where("symbol", "==", selectedStock));
      const assetSnapshot = await getDocs(assetQuery);

      if (!assetSnapshot.empty) {
        const assetDoc = assetSnapshot.docs[0];
        const existingAsset = assetDoc.data();
        const updatedQuantity = existingAsset.stockQuantity + quantity;

        await setDoc(doc(db, "users", user?.uid, "assets", assetDoc.id), {
          ...existingAsset,
          stockQuantity: updatedQuantity,
        });

        setAssets((prev) =>
          prev.map((asset) =>
            asset.symbol === selectedStock ? { ...asset, stockQuantity: updatedQuantity } : asset
          )
        );
      }

      else {
        await addDoc(assetsRef, purchaseObject);
        setAssets((prev) => [...prev, purchaseObject]);
      }

      await addDoc(purchasesRef, purchaseObject);

      setBalance(currentBalance - totalCost);
      setPurchases((prev) => [...prev, purchaseObject]);

      closePopup();
      toast.success(`Purchased ${quantity} shares of ${selectedStock}`, {
        style: {
            backgroundColor: "#ed766d",
            fontWeight: "lighter",
            fontSize: 15
          }
        });
    } catch (error) {
      toast.error("Could not purchase assets.", {
        style: {
          backgroundColor: "#ed766d",
          fontWeight: "lighter",
          fontSize: 15
        }
     });
      console.error("Error handling purchase:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (selectedUser) => {
      if (selectedUser) {
        setUser(selectedUser);
        await initializeUserAccount(selectedUser.uid);
        fetchWatchlist(selectedUser.uid);
        fetchPurchases(selectedUser.uid);
        fetchAssets(selectedUser.uid);
      } else {
        setUser(null);
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribe();
  }, []);

  const initializeUserAccount = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          balance: 100000,
          createdAt: new Date(),
        });
        setBalance(100000)
      }
      else {
        setBalance(userDoc.data().balance);
      }

    } catch (error) {
      console.error("Error initializing user account:", error);
    }
  };

  const fetchPurchases = async (userId) => {
    try {
      const purchasesRef = collection(db, "users", userId, "purchases");
      const querySnapshot = await getDocs(purchasesRef);
  
      const purchasesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
        };
      });

      purchasesData.sort((a, b) => b.date - a.date);
  
      setPurchases(purchasesData);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  const fetchWatchlist = async (userId) => {
    try {
      const q = query(collection(db, "users", userId, "watchlist"));
      const querySnapshot = await getDocs(q);

      const stocks = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const stockData = doc.data();
          const latestPrice = await fetchCurrentPrice(stockData.symbol);
          const closingPrice = await fetchClosingPrice(stockData.symbol);
          return { id: doc.id, ...stockData, price: latestPrice, dayPercentChange: (latestPrice-closingPrice)/closingPrice * 100 };
        })
      );

      setWatchlist(stocks);
    } catch (error) {
      console.error("Error fetching watchlist: ", error);
    }
  };

  const fetchAssets = async (userId) => {
    try {
        const q = query(collection(db, "users", userId, "assets"));
        const querySnapshot = await getDocs(q);
  
        const stocks = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const stockData = doc.data();
            const latestPrice = await fetchCurrentPrice(stockData.symbol);
            return { id: doc.id, ...stockData, price: latestPrice };
          })
        );
  
        setAssets(stocks);
      } catch (error) {
        console.error("Error fetching assets: ", error);
      }
    };

  const fetchCurrentPrice = async (symbolToFetch) => {
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

      return data.c;
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return null;
    }
  };

  const fetchClosingPrice = async (symbolToFetch) => {
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

      if (!data || !data.pc) {
        throw new Error("No stock data available for the given symbol.");
      }

      return data.pc;
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return null;
    }
  };

  const handleRemove = async (stockId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "watchlist", stockId));
      setWatchlist((prev) => prev.filter((stock) => stock.id !== stockId));
    } catch (error) {
      console.error("Error removing stock: ", error);
    }
  };

  const handlePurchase = (stockSymbol, stockPrice) => {
    setSelectedStock(stockSymbol);
    setSelectedStockPrice(stockPrice);
    setQuantity(1);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedStock(null);
    setSelectedStockPrice(0);
    setQuantity(1);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value || 0);
    setQuantity(value);
  };

  return (
    <div className="mt-10 mx-4 lg:mx-10 flex flex-col lg:flex-row items-center lg:items-start flex-grow justify-center">
      <div className={`flex flex-col lg:flex-row h-full w-full gap-6 ${isPopupOpen ? "blur-sm" : ""}`}>
        <div className="w-full lg:w-1/3 bg-gray-100 p-6 rounded-lg">
          {user && (
            <div className="flex flex-col items-center">
              <img
                src={user ? user.photoURL : ""}
                alt="Profile"
                className="w-1/4 h-1/4 rounded-full mb-4 text-gray-700"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-2xl font-bold mb-4 text-gray-700 text-center">
                {user.displayName}
              </h1>
              <div className="bg-white shadow-md rounded-lg p-6 w-full">
                <h2 className="text-xl font-bold mb-4 text-gray-700">
                  Your Watchlist
                </h2>
                <div>
                {watchlist.length > 0 ? (
                  <ul>
                    {watchlist.map((stock) => (
                      <li
                        key={stock.symbol + stock.price}
                        className="text-gray-700 mb-2 flex flex-col lg:flex-row justify-between items-center"
                      >
                        <span className="text-center lg:text-left">
                          {stock.symbol} - ${stock.price?.toFixed(2)} -{" "}
                          <span
                            className={
                              stock.dayPercentChange > 0
                                ? `text-green-500`
                                : `text-red-500`
                            }
                          >
                            {stock.dayPercentChange?.toFixed(2)}%
                          </span>
                        </span>
                        <div className="flex gap-2 mt-2 lg:mt-0">
                          <button
                            onClick={() => handlePurchase(stock.symbol, stock.price)}
                            className="bg-green-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-green-600"
                          >
                            $
                          </button>
                          <button
                            onClick={() => handleRemove(stock.id)}
                            className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600"
                          >
                            X
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Your watchlist is empty.</p>
                )}
                </div>
              </div>
              <div className="mt-3 bg-white shadow-md rounded-lg p-6 w-full">
                <h2 className="text-xl font-bold mb-4 text-gray-700">Current Balance</h2>
                <p className="text-gray-700 mb-2 text-7xl flex flex-col lg:flex-row justify-between items-center">${balance?.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col lg:flex-row bg-white p-6 rounded-lg shadow-md">
          <div className="w-full lg:w-1/2 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-gray-300">
            <h1 className="text-gray-700 sticky top-0 my-5 lg:my-0 bg-white z-10 p-2">
              Purchases
            </h1>
            {purchases.length > 0 ? (
                <div className="flex-grow flex items-center justify-center w-full ">
                    <div className="overflow-y-auto h-7/8 max-h-120 w-full lg:mr-10">
                        <ul className="w-full items-center text-center">
                            {purchases.map((purchase) => (
                            <li
                                key={`${purchase.symbol}-${purchase.date}`} 
                                className="text-gray-700 border-b border-gray-300 py-4 px-6 flex justify-between items-center"
                            >
                                <div className="text-left w-1/2">
                                <p className="font-bold text-lg">{purchase.symbol}</p>
                                <p className="text-sm text-gray-500">
                                    Quantity: {purchase.stockQuantity}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Price: ${purchase.price.toFixed(2)}
                                </p>
                                </div>
                                <div className="text-right w-1/2">
                                    <p className="text-sm text-gray-500">
                                        {moment(purchase.date).format("MMM DD YYYY, hh:mm A")}
                                    </p>
                                </div>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-500 mb-5 lg:mb-0 text-center">
                    No purchases available
                </p>
            </div>)}
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center border-b lg:border-b-0 border-gray-300">
            <h1 className="text-gray-700 sticky top-0 my-5 lg:my-0 bg-white z-10 p-2">
              Assets
            </h1>
            {assets.length > 0 ? (
              <div className="flex-grow flex items-center justify-center w-full">
                <div className="overflow-y-auto h-7/8 max-h-120 w-full">
                <div className="flex flex-col items-center w-full">
                  <h2 className="text-xl text-gray-700">
                      Total Assets: {parseInt(balance?.toFixed(2)) + parseInt(assets.reduce((accumulator, asset) => accumulator + (asset.stockQuantity * asset.price), 0).toFixed(2))}
                  </h2> 
                </div>
                  <ul className="w-full items-center text-center">
                    {assets.map((asset) => (
                      <li
                        key={asset.id}
                        className="text-gray-700 border-b border-gray-300 py-4 px-6 flex justify-between items-center"
                      >
                        <div className="text-left w-1/2">
                          <p className="font-bold text-lg">{asset.symbol}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {asset.stockQuantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Current Price: ${asset.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right w-1/2">
                          <p className="text-sm text-gray-500">
                            Total Value: ${(asset.stockQuantity * asset.price).toFixed(2)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-500 mb-5 lg:mb-0 text-center">
                  No assets available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full lg:w-1/3">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Purchase Stock
            </h2>
            <p className="text-gray-700 mb-4">
              Stock: <strong>{selectedStock}</strong>
            </p>
            <p className="text-gray-700 mb-4">
              Price per Stock: <strong>${selectedStockPrice.toFixed(2)}</strong>
            </p>
            <div className="mb-4">
              <label
                htmlFor="quantity"
                className="block text-gray-700 font-medium mb-2"
              >
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity == 0 ? "" : quantity}
                onChange={handleQuantityChange}
                onKeyDown={(e) => {
                    if (
                      !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key) &&
                      !/^[0-9]$/.test(e.key)
                    ) {
                      e.preventDefault();
                    }
                }}
                className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <p className="text-gray-700 mb-4">
              Total Price:{" "}
              <strong>${(selectedStockPrice * quantity).toFixed(2)}</strong>
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => closePopup()}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSellAsset()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sell
              </button>
              <button
                onClick={() => handleQuantityPurchase()}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer autoClose={1500} position="bottom-right" />
    </div>
  );
}