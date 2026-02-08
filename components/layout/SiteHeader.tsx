'use client';

import React from 'react';
import type { SortOption, GridLayout } from '@/types/product';

interface SiteHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  suggestions: string[];
  isSuggestionOpen: boolean;
  onSuggestionToggle: (open: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  isFilterOpen: boolean;
  onFilterToggle: () => void;
  cartCount: number;
  onCartClick: () => void;
  gridLayout: GridLayout;
  onGridLayoutChange: (layout: GridLayout) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent-desc', label: 'New Arrivals' },
  { value: 'vendor-asc', label: 'Brand (A-Z)' },
  { value: 'vendor-desc', label: 'Brand (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'rating-desc', label: 'Highest Rated' },
];

export const SiteHeader = ({
  query,
  onQueryChange,
  suggestions,
  isSuggestionOpen,
  onSuggestionToggle,
  sortBy,
  onSortChange,
  totalResults,
  isFilterOpen,
  onFilterToggle,
  cartCount,
  onCartClick,
  gridLayout,
  onGridLayoutChange,
}: SiteHeaderProps) => {
  const hasSuggestions = isSuggestionOpen && suggestions.length > 0;

  return (
    <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-2 sm:px-4 transition-all bg-white/80 backdrop-blur-md" role="banner">
      <div className="max-w-[1440px] mx-auto bg-white border border-gray-100 rounded-full h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Left: Show Filters & Results */}
        <nav className="flex-1 flex items-center gap-2 sm:gap-6" aria-label="Filters and Results Information">
          <button
            onClick={onFilterToggle}
            aria-expanded={isFilterOpen}
            aria-controls="filter-sidebar"
            aria-label={isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            className="flex items-center gap-2 hover:bg-gray-100 transition-colors py-2 px-4 rounded-full"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span className="hidden sm:inline text-[13px] font-medium tracking-wider uppercase text-black">
              {isFilterOpen ? 'Hide' : 'Show'} Filters
            </span>
          </button>
          <div className="hidden sm:block h-4 w-px bg-gray-200" aria-hidden="true"></div>
          <div 
            className="hidden md:block text-[#6b7280] text-[12px] font-medium uppercase tracking-wider whitespace-nowrap"
            aria-live="polite"
            role="status"
          >
            {totalResults} results
          </div>
          <div className="hidden lg:flex items-center gap-1 ml-2 border-l border-gray-100 pl-4">
            {[2, 4, 6].map((cols) => (
              <button
                key={cols}
                onClick={() => onGridLayoutChange(cols as GridLayout)}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                  gridLayout === cols 
                    ? 'bg-black text-white' 
                    : 'text-gray-400 hover:bg-gray-100 hover:text-black'
                }`}
                aria-label={`Show ${cols} columns grid`}
                aria-pressed={gridLayout === cols}
              >
                <div className={`grid gap-0.5 ${
                  cols === 2 ? 'grid-cols-1' : (cols === 4 ? 'grid-cols-2' : 'grid-cols-3')
                }`}>
                  {[...Array(cols === 2 ? 2 : (cols === 4 ? 4 : 6))].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-current rounded-full" />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="text-[24px] sm:text-[32px] font-bold tracking-tighter text-black leading-none pb-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            healf<span className="text-black">.</span>
          </button>
        </div>

        {/* Right: Search, Sort & Cart */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-6">
          {/* Sort Dropdown */}
          <div className="hidden lg:flex items-center">
            <div className="relative group">
              <label htmlFor="sort-by" className="sr-only">Sort products by</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent border-none text-black text-[12px] font-medium uppercase tracking-wider focus:outline-none appearance-none cursor-pointer pr-6 py-2 px-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-black" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="hidden lg:block relative group max-w-[400px] w-full" role="search">
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-black pointer-events-none" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <label htmlFor="search-input" className="sr-only">Search products</label>
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => {
                onQueryChange(e.target.value);
                onSuggestionToggle(true);
              }}
              onFocus={() => onSuggestionToggle(true)}
              onBlur={() => onSuggestionToggle(false)}
              placeholder="Search products"
              autoComplete="off"
              className="w-full bg-[#f3f4f6] border-none rounded-full py-2 pl-10 sm:pl-12 pr-10 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-500 hover:bg-gray-200 transition-colors"
            />

            {query && (
              <button
                onClick={() => {
                  onQueryChange('');
                  onSuggestionToggle(false);
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {hasSuggestions && (
              <div 
                className="absolute z-20 mt-2 w-full rounded-2xl border border-border bg-white shadow-lg overflow-hidden"
              >
                <ul className="max-h-64 overflow-y-auto" role="listbox">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion} role="option">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onQueryChange(suggestion);
                          onSuggestionToggle(false);
                        }}
                        className="w-full px-6 py-3 text-left text-sm text-text-primary hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <button 
            onClick={onCartClick}
            aria-label={`View shopping cart, ${cartCount} items`}
            className="text-black relative hover:bg-gray-100 transition-colors p-2 rounded-full flex items-center"
          >
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span 
                aria-hidden="true"
                className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

