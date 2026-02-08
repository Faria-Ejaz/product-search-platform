/**
 * React hooks optimized for large datasets
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Product, SearchResult, SearchOptions, SearchFilters, SortOption } from '@/types/product';
import { searchProducts } from './searchEngine';

const DEBOUNCE_DELAY = 300;

/**
 * Hook for product search with performance optimizations
 */
export function useProductSearch(products: Product[]) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>('recent-desc');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce query
  useEffect(() => {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Memoized search results
  const results = useMemo<SearchResult[]>(() => {
    const options: SearchOptions = {
      query: debouncedQuery,
      filters,
      sortBy,
    };
    return searchProducts(products, options);
  }, [products, debouncedQuery, filters, sortBy]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters: SearchFilters | undefined) => {
    setFilters(newFilters);
  }, []);

  const updateSortBy = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
  }, []);

  const resetSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setFilters(undefined);
    setSortBy('recent-desc');
  }, []);

  const hasQuery = query.trim() !== '';
  const hasActiveFilters = Boolean(
    (filters?.vendors && filters.vendors.length > 0) ||
    filters?.priceRange ||
    filters?.inStock
  );
  const hasNoResults = results.length === 0 && (hasQuery || hasActiveFilters);
  const isLoading = isSearching && query !== debouncedQuery;

  // Memoized search suggestions
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return [];

    const unique = new Set<string>();
    const suggestionList: string[] = [];

    // Use current results for relevant suggestions
    for (const product of results) {
      const title = product.title?.trim();
      const vendor = product.vendor?.trim();

      if (title && title.toLowerCase().includes(normalized) && !unique.has(title)) {
        unique.add(title);
        suggestionList.push(title);
      }

      if (vendor && vendor.toLowerCase().includes(normalized) && !unique.has(vendor)) {
        unique.add(vendor);
        suggestionList.push(vendor);
      }

      if (suggestionList.length >= 6) break;
    }

    return suggestionList;
  }, [query, results]);

  return {
    query,
    debouncedQuery,
    suggestions,
    results,
    filters,
    sortBy,
    isLoading,
    hasQuery,
    hasActiveFilters,
    hasNoResults,
    totalResults: results.length,
    updateQuery,
    updateFilters,
    updateSortBy,
    resetSearch,
  };
}
