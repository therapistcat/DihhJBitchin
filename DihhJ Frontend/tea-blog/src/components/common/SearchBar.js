import React, { useState, useEffect, useRef } from 'react';
import './Common.css';

const SearchBar = ({ onSearch, placeholder = "Search tea posts...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
        // Mock suggestions - in real app, this would come from API
        setSuggestions([
          `"${query}" in titles`,
          `"${query}" in content`,
          `"${query}" by author`,
          `"${query}" in batch 26`,
          `"${query}" in batch 27`
        ]);
        setShowSuggestions(true);
      } else {
        onSearch('');
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsExpanded(true);
      }
      
      // Escape to close search
      if (event.key === 'Escape') {
        inputRef.current?.blur();
        setIsExpanded(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleFocus = () => {
    setIsExpanded(true);
    if (query.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    const searchTerm = suggestion.split('"')[1]; // Extract the search term
    setQuery(searchTerm);
    onSearch(searchTerm);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className={`search-bar ${isExpanded ? 'expanded' : ''} ${className}`}>
      <div className="search-input-container">
        <div className="search-icon">🔍</div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search tea posts"
        />
        {query && (
          <button
            onClick={handleClear}
            className="search-clear"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <div className="search-shortcut">⌘K</div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="search-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="suggestion-icon">🔍</span>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
