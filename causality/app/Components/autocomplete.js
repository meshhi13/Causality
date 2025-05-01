import React, { useState } from 'react';

export default function AutocompleteDropdown ({suggestions, onSelect, symbol, setSymbol}) {
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filtered = suggestions
        .filter(suggestion => 
            suggestion.toLowerCase().startsWith(symbol?.toLowerCase() || "")
        )
        .sort()
        .slice(0, 4);

    const handleInputChange = (event) => {
        setSymbol(event.target.value);
    };

    const handleSuggestionClick = (suggestion) => {
        onSelect(suggestion);
        setSymbol(suggestion);
        setShowSuggestions(false);
    };

    const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 150);
    };

    return (
        <div className="w-full">
            <input 
                className="w-full border border-gray-300 text-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={symbol || ""}
                onChange={handleInputChange} 
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleBlur}
            />

            {showSuggestions && (
                <ul className="bg-white border border-gray-300 rounded-lg mt-2">
                    {filtered.map(filter => (
                        <li
                            className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-700 rounded-lg"
                            key={filter} 
                            onMouseDown={() => handleSuggestionClick(filter)}
                        >
                            {filter}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};