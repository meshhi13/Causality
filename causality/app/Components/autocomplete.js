import React, { useState } from 'react';

const AutocompleteDropdown = ({suggestions, onSelect}) => {
    const [value, setValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState('');
    const filtered = suggestions
    .filter(suggestion => 
        suggestion.toLowerCase().startsWith(value.toLowerCase())
    )
    .sort()
    .slice(0, 4)
    
    const handleEvent = (event) => {
        setValue(event.target.value)
    }

    const handleSuggestionClick = (suggestion) => {
        setValue(suggestion);
        onSelect(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div className='w-'>
            <input className="w-full border border-gray-300 text-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={value} onChange={handleEvent} onFocus={() => setShowSuggestions(true)}/>
            {showSuggestions && (
                <ul>
                    {filtered.map(filter => (
                        <button>
                            <li
                                className="px-4 py-2 mt-2 cursor-pointer hover:bg-blue-100 text-gray-700 rounded-lg"
                                key={filter} 
                                onClick={() => handleSuggestionClick(filter)}
                            > 
                                {filter} 
                            </li>
                        </button>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteDropdown;