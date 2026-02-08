/**
 * Core product type definitions
 */

export interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  productType: string;
  description: string;
  bodyHtml: string;
  tags: string[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  price: {
    amount: number;
    currency: string;
  };
  compareAtPrice?: {
    amount: number;
    currency: string;
  };
  inventory: number;
  images: ProductImage[];
  rating?: number;
  reviewCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

/**
 * Search-related types
 */

export interface SearchResult extends Product {
  relevanceScore: number;
  matchedFields: string[];
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  sortBy?: SortOption;
  limit?: number;
}

export interface SearchFilters {
  vendors?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
}

export type SortOption = 
  | 'recent-desc'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'vendor-asc'
  | 'vendor-desc';

export type GridLayout = 2 | 4 | 6;

