'use client';

/**
 * Product Search Platform - Main Page
 * Loads data from public/data.csv (872k rows, 49MB)
 * Optimized for large datasets with progress tracking
 */

import React, { useState, useEffect, useCallback, useMemo, Suspense, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/search/ProductCard';
import { ProductSkeleton } from '@/components/search/ProductSkeleton';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { CartModal } from '@/components/search/CartModal';
import { Button, SpinnerIcon } from '@/components/ui';
import { useProductSearch } from '@/lib/hooks';
import type { Product, SortOption, GridLayout } from '@/types/product';
import type { ParseStats } from '@/lib/csvParser';

function SearchStore() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parseStats, setParseStats] = useState<ParseStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [itemsPerPage] = useState(100);
  const [displayedItems, setDisplayedItems] = useState(100);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [gridLayout, setGridLayout] = useState<GridLayout>(4);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('healf-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('healf-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const cartCount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const gridClass = `grid grid-cols-1 sm:grid-cols-2 ${
    gridLayout === 6 ? 'lg:grid-cols-6' : gridLayout === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'
  } gap-x-6 gap-y-10`;

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const loadCSVData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const { parseCSV, getCachedParseResult } = await import('@/lib/csvParser');
      const cached = getCachedParseResult();
      if (cached) {
        setProducts(cached.products);
        setParseStats(cached.stats);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/data.csv');
      
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      // Parse CSV with progress tracking
      try {
        const result = parseCSV(csvText, (percent, stats) => {
          if (stats) {
            setParseStats(stats as ParseStats);
          }
        });
        
        setProducts(result.products);
        setParseStats(result.stats);
        setIsLoading(false);
        
      } catch (parseError) {
        console.error('CSV parsing error:', parseError);
        throw new Error('Failed to parse CSV file. The file may be corrupted or have invalid data.');
      }
    } catch (error) {
      console.error('Failed to load CSV:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load products');
      setIsLoading(false);
    }
  }, []);

  // Load CSV data on mount
  useEffect(() => {
    loadCSVData();
  }, [loadCSVData]);

  const {
    query,
    debouncedQuery,
    suggestions,
    results,
    filters,
    sortBy,
    isLoading: isSearching,
    hasQuery,
    hasActiveFilters,
    hasNoResults,
    totalResults,
    updateQuery,
    updateFilters,
    updateSortBy,
    resetSearch,
  } = useProductSearch(products);

  // Sync state with URL
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  // 1. Load initial state from URL
  useEffect(() => {
    if (isInitialSyncDone || products.length === 0) return;
    
    const q = searchParams.get('q');
    if (q) updateQuery(q);
    
    const sort = searchParams.get('sort') as SortOption;
    if (sort) updateSortBy(sort);
    
    const brands = searchParams.get('brands');
    if (brands) updateFilters({ ...filters, vendors: brands.split(',') });
    
    setIsInitialSyncDone(true);
  }, [searchParams, updateQuery, updateSortBy, updateFilters, filters, isInitialSyncDone, products.length]);

  // 2. Push state changes to URL
  useEffect(() => {
    if (!isInitialSyncDone) return;

    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (sortBy && sortBy !== 'recent-desc') params.set('sort', sortBy);
    if (filters?.vendors?.length) params.set('brands', filters.vendors.join(','));
    
    const newParams = params.toString();
    const currentParams = searchParams.toString();
    
    if (newParams !== currentParams) {
      router.replace(`${pathname}${newParams ? `?${newParams}` : ''}`, { scroll: false });
    }
  }, [debouncedQuery, sortBy, filters, pathname, router, searchParams, isInitialSyncDone]);

  // Scroll to top when search, filters, or sort change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, filters, sortBy]);

  // Reset pagination when search/filters change
  useEffect(() => {
    setDisplayedItems(itemsPerPage);
  }, [query, filters, sortBy, itemsPerPage]);

  const hasSuggestions = isSuggestionOpen && suggestions.length > 0;

  const handleLoadMore = useCallback(() => {
    setDisplayedItems((prev) => prev + itemsPerPage);
  }, [itemsPerPage]);

  // Infinite Scroll logic
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const visibleResults = useMemo(() => results.slice(0, displayedItems), [results, displayedItems]);
  const hasMoreResults = useMemo(() => results.length > displayedItems, [results.length, displayedItems]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreResults && !isSearching) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleLoadMore, hasMoreResults, isSearching]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mock Header Skeleton */}
        <div className="h-20 bg-white border-b border-gray-100 flex items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1400px] w-full mx-auto flex justify-between items-center">
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="h-10 w-full bg-gray-50 rounded-full border border-gray-100 animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 bg-gray-50 rounded-full animate-pulse" />
              <div className="h-10 w-10 bg-gray-50 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Progress Bar */}
          <div className="mb-8" role="status" aria-live="polite">
            {parseStats && (
              <p className="mt-2 text-xs text-secondary-lighter">
                Scanning dataset... {parseStats.totalRows?.toLocaleString()} rows processed
              </p>
            )}
          </div>

          {/* Skeleton Grid */}
          <div className={gridClass}>
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="mx-auto text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-text-primary mb-2">
            Failed to Load Products
          </h2>
          <p className="text-secondary mb-6">
            {loadError}
          </p>
          <Button onClick={loadCSVData} variant="primary" size="lg">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        query={query}
        onQueryChange={updateQuery}
        suggestions={suggestions}
        isSuggestionOpen={isSuggestionOpen}
        onSuggestionToggle={setIsSuggestionOpen}
        sortBy={sortBy}
        onSortChange={updateSortBy}
        totalResults={totalResults}
        isFilterOpen={isFilterOpen}
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        gridLayout={gridLayout}
        onGridLayoutChange={setGridLayout}
      />
      
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
      />
      
      {/* Filter Sidebar */}
      <FilterSidebar
        products={products}
        filters={filters}
        onFiltersChange={updateFilters}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        query={query}
        onQueryChange={updateQuery}
      />

      {/* Main Content */}
      <main id="main-content" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-8" role="status" aria-label="Searching products">
            <SpinnerIcon className="inline-block w-8 h-8" />
          </div>
        )}

        {/* No Results */}
        {hasNoResults && (
          <div className="text-center py-16" role="alert">
            <div className="mb-4" aria-hidden="true">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="mx-auto text-secondary-lighter"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeWidth="1" />
                <line x1="8" y1="11" x2="14" y2="11" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-text-primary mb-2">
              No products found
            </h2>
            <p className="text-secondary mb-6">
              Try adjusting your search or filters
            </p>
            <Button onClick={resetSearch} variant="primary" size="lg">
              Clear Search & Filters
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && !hasNoResults && results.length === 0 && !hasQuery && !hasActiveFilters && (
          <div className="text-center py-16" role="status">
            <div className="mb-4" aria-hidden="true">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="mx-auto text-secondary-lighter"
              >
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M7 9h10" strokeWidth="1" />
                <path d="M7 13h6" strokeWidth="1" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-text-primary mb-2">
              No products available
            </h2>
          </div>
        )}

        {/* Products Grid */}
        {!isSearching && !hasNoResults && (
          <section aria-label="Product Search Results">
            <div className={gridClass}>
              {visibleResults.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)}
                  searchQuery={debouncedQuery}
                />
              ))}
            </div>
          </section>
        )}

        {/* Infinite Scroll Trigger */}
        <div 
          ref={loadMoreRef} 
          className="h-20 flex items-center justify-center mt-8"
          role="status"
          aria-live="polite"
        >
          {hasMoreResults && !isSearching && !hasNoResults && (
            <div className="flex flex-col items-center gap-2">
              <SpinnerIcon className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Loading more products</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">Loading Search...</p>
        </div>
      </div>
    }>
      <SearchStore />
    </Suspense>
  );
}
