/**
 * Sidebar Filter Component
 * Slides in from left when "Show Filters" is clicked
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { Product, SearchFilters } from '@/types/product';
import { getUniqueVendors, getPriceRange } from '@/lib/searchEngine';
import { Button, FilterIcon } from '../ui';

interface FilterSidebarProps {
  products: Product[];
  filters: SearchFilters | undefined;
  onFiltersChange: (filters: SearchFilters | undefined) => void;
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export function FilterSidebar({
  products,
  filters,
  onFiltersChange,
  isOpen,
  onClose,
  query,
  onQueryChange,
}: FilterSidebarProps) {
  const vendors = useMemo(() => getUniqueVendors(products), [products]);
  const priceRange = useMemo(() => getPriceRange(products), [products]);
  
  const [brandSearch, setBrandSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    availability: true,
    price: true,
    brands: true,
  });
  
  const selectedVendors = filters?.vendors || [];
  const selectedPriceRange = filters?.priceRange || priceRange;
  const inStockOnly = filters?.inStock || false;

  const vendorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.vendor, (counts.get(product.vendor) || 0) + 1);
    }
    return counts;
  }, [products]);

  const filteredVendors = useMemo(() => (
    vendors.filter(v => v.toLowerCase().includes(brandSearch.toLowerCase()))
  ), [vendors, brandSearch]);

  const updateFilters = useCallback((newFilterValues: Partial<SearchFilters>) => {
    const updatedFilters: SearchFilters = {
      vendors: 'vendors' in newFilterValues ? newFilterValues.vendors : filters?.vendors,
      priceRange: 'priceRange' in newFilterValues ? newFilterValues.priceRange : filters?.priceRange,
      inStock: 'inStock' in newFilterValues ? newFilterValues.inStock : filters?.inStock,
    };

    const hasActiveFilters =
      (updatedFilters.vendors && updatedFilters.vendors.length > 0) ||
      updatedFilters.priceRange ||
      (updatedFilters.inStock !== undefined && updatedFilters.inStock !== false);

    onFiltersChange(hasActiveFilters ? updatedFilters : undefined);
  }, [filters, onFiltersChange]);

  const toggleVendor = useCallback((vendor: string) => {
    const newVendors = selectedVendors.includes(vendor)
      ? selectedVendors.filter(v => v !== vendor)
      : [...selectedVendors, vendor];
    
    updateFilters({ vendors: newVendors.length > 0 ? newVendors : undefined });
  }, [selectedVendors, updateFilters]);

  const updatePriceRange = useCallback((min: number, max: number) => {
    updateFilters({ priceRange: { min, max } });
  }, [updateFilters]);

  const toggleInStock = useCallback(() => {
    updateFilters({ inStock: !inStockOnly });
  }, [updateFilters, inStockOnly]);

  const clearFilters = useCallback(() => {
    onFiltersChange(undefined);
    setBrandSearch('');
  }, [onFiltersChange]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        id="filter-sidebar"
        aria-label="Product filters"
        className={`
          fixed top-0 left-0 h-full w-80 bg-background-card shadow-card-hover z-50
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-card border-b border-border px-card-lg py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Hide Filter Sidebar"
            className="flex items-center gap-2 text-primary-light hover:text-text-primary"
          >
            <FilterIcon aria-hidden="true" />
            <span className="font-medium">Hide Filters</span>
          </button>
          
          {filters && (
            <button
              onClick={clearFilters}
              aria-label="Clear all active filters"
              className="text-sm text-secondary hover:text-text-primary"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Content */}
        <div className="px-card-lg pt-4 pb-card-lg flex flex-col gap-8">
          {/* Mobile Search - Only visible on mobile */}
          <div className="lg:hidden">
            <h3 id="mobile-search-heading" className="text-lg font-medium text-text-primary mb-4">Search</h3>
            <div className="relative" role="search">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <label htmlFor="mobile-search" className="sr-only">Search products</label>
              <input
                id="mobile-search"
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search products"
                className="w-full bg-[#f3f4f6] border-none rounded-full py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-black transition-colors"
              />
              {query && (
                <button
                  onClick={() => onQueryChange('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Availability */}
          <fieldset className="border-b border-gray-100 pb-6">
            <button
              onClick={() => toggleSection('availability')}
              className="w-full flex items-center justify-between text-lg font-medium text-text-primary mb-2 group"
              aria-expanded={expandedSections.availability}
            >
              <legend>Availability</legend>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${expandedSections.availability ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`mt-4 space-y-4 overflow-hidden transition-all duration-300 ${expandedSections.availability ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={toggleInStock}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-secondary-lighter"
                />
                <span className="text-sm text-primary-light">In stock only</span>
              </label>
            </div>
          </fieldset>

          {/* Price Range */}
          {priceRange.max > 0 && (
            <fieldset className="border-b border-gray-100 pb-6">
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-lg font-medium text-text-primary mb-2 group"
                aria-expanded={expandedSections.price}
              >
                <legend>Price (£)</legend>
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${expandedSections.price ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${expandedSections.price ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1">
                    <label htmlFor="min-price" className="text-xs text-secondary mb-1 block">Min</label>
                    <input
                      id="min-price"
                      type="number"
                      value={Math.round(selectedPriceRange.min)}
                      onChange={(e) => updatePriceRange(parseFloat(e.target.value) || 0, selectedPriceRange.max)}
                      className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-xl text-sm focus:outline-none focus:border-black bg-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="max-price" className="text-xs text-secondary mb-1 block">Max</label>
                    <input
                      id="max-price"
                      type="number"
                      value={Math.round(selectedPriceRange.max)}
                      onChange={(e) => updatePriceRange(selectedPriceRange.min, parseFloat(e.target.value) || priceRange.max)}
                      className="w-full px-3 py-2.5 border border-[#e5e7eb] rounded-xl text-sm focus:outline-none focus:border-black bg-white"
                      placeholder="399"
                    />
                  </div>
                </div>
                <div className="px-2 py-4">
                  <label htmlFor="price-slider" className="sr-only">Price Range Slider</label>
                  <input
                    id="price-slider"
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step="1"
                    value={selectedPriceRange.max}
                    onChange={(e) => updatePriceRange(selectedPriceRange.min, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#e5e7eb] rounded-full appearance-none cursor-pointer accent-black"
                  />
                </div>
              </div>
            </fieldset>
          )}

          {/* Brands */}
          {vendors.length > 0 && (
            <fieldset>
              <button
                onClick={() => toggleSection('brands')}
                className="w-full flex items-center justify-between text-lg font-medium text-text-primary mb-2 group"
                aria-expanded={expandedSections.brands}
              >
                <legend>Brands</legend>
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${expandedSections.brands ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${expandedSections.brands ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                {/* Search brands */}
                <div className="mb-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827]" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    <label htmlFor="brand-search" className="sr-only">Filter brands by name</label>
                    <input
                      id="brand-search"
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Search brands"
                      className="w-full bg-[#f3f4f6] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-0 placeholder:text-[#6b7280] group-hover:bg-gray-200 transition-colors"
                    />
                  </div>
                </div>

                {/* Brand list */}
                <div className="space-y-1 max-h-80 overflow-y-auto pr-2 custom-scrollbar" role="group" aria-label="Brand selection">
                  {filteredVendors.map((vendor) => {
                    const count = vendorCounts.get(vendor) || 0;
                    return (
                      <label
                        key={vendor}
                        className="flex items-center justify-between cursor-pointer group py-2.5 px-1 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedVendors.includes(vendor)}
                            onChange={() => toggleVendor(vendor)}
                            className="w-5 h-5 rounded-md border-[#d1d5db] text-black focus:ring-0 cursor-pointer"
                          />
                          <span className="text-[15px] font-normal text-[#111827] group-hover:text-black">
                            {vendor}
                          </span>
                        </div>
                        <span className="text-[15px] text-[#9ca3af] font-normal pl-4" aria-label={`${count} products available`}>{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </fieldset>
          )}
        </div>
      </aside>
    </>
  );
}
