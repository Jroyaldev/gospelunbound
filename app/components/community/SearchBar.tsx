'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { SearchBarProps } from '@/app/types/community';

/**
 * SearchBar component provides search functionality for the community section
 *
 * Features:
 * - Debounced input to prevent excessive API calls
 * - Clear button to reset search
 * - Accessible with proper ARIA attributes
 * - Focus and hover states
 */
const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search discussions...'
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update the input value when searchQuery prop changes
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);
  
  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set a new timer to update the search query after 400ms
    timerRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 400);
  };
  
  // Clear the search input
  const handleClearSearch = () => {
    setInputValue('');
    onSearchChange('');
    
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle focus events
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div className={`relative transition-all ${isFocused ? 'ring-2 ring-[#4A7B61]/20 rounded-lg' : ''}`}>
      <div className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none transition-colors ${isFocused ? 'text-[#4A7B61]' : 'text-[#706C66]'}`}>
        <Search size={20} />
      </div>
      
      <input
        ref={inputRef}
        type="search"
        className="w-full p-3.5 pl-11 pr-11 text-[#2C2925] bg-white border border-[#E8E6E1] rounded-lg focus:ring-[#4A7B61] focus:border-[#4A7B61] focus:outline-none transition-all placeholder:text-[#706C66]/60"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label="Search"
      />
      
      {inputValue && (
        <button
          onClick={handleClearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#706C66] hover:text-[#2C2925] transition-colors active:scale-95"
          aria-label="Clear search"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
