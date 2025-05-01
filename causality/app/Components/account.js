import { useState } from "react"

export default function Account () {
    const [watchlist, setWatchlist] = useState([])
    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-600">Your Watchlist</h2>
            {watchlist.length > 0 ? (
            <ul>
                {watchlist.map(stock => (
                <li key={stock.id} className="text-gray-700 mb-2">
                    {stock.symbol} - ${stock.price?.toFixed(2)}
                </li>
                ))}
            </ul>
            ) : (
            <p className="text-gray-600">Your watchlist is empty.</p>
            )}
        </div>
    )
}