/**
 * Optimized search engine for 5k+ products
 * Uses efficient string matching and early termination
 */

import type { Product, SearchResult, SearchOptions, SearchFilters, SortOption } from '@/types/product';

// Search configuration
const FIELD_WEIGHTS = {
  title: 3.0,
  vendor: 2.0,
  description: 1.0,
  tags: 0.5,
};

const MINIMUM_SCORE = 0.1;

/**
 * Normalize text for search
 */
function normalize(text?: string | null): string {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function normalizeForFuzzy(text?: string | null): string {
  return normalize(text).replace(/[^a-z0-9]/g, '');
}

function isSubsequence(needle: string, haystack: string): boolean {
  if (!needle) return false;
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (needle[i] === haystack[j]) i++;
  }
  return i === needle.length;
}

/**
 * Tokenize query
 */
function tokenize(query: string): string[] {
  return normalize(query).split(/\s+/).filter(t => t.length > 0);
}

/**
 * Calculate field score with early termination
 */
function scoreField(tokens: string[], field?: string | null, weight: number = 1): number {
  if (!field || tokens.length === 0) return 0;
  
  const normalized = normalize(field);
  const normalizedFuzzy = normalized.length <= 120 ? normalizeForFuzzy(field) : '';
  let score = 0;
  
  for (const token of tokens) {
    const fuzzyToken = token.length >= 3 ? token.replace(/[^a-z0-9]/g, '') : '';
    if (normalized === token) {
      score += 10 * weight;
    } else if (normalized.startsWith(token)) {
      score += 5 * weight;
    } else if (normalized.includes(` ${token} `) || normalized.startsWith(`${token} `) || normalized.endsWith(` ${token}`)) {
      score += 4 * weight;
    } else if (normalized.includes(token)) {
      score += 2 * weight;
    } else if (normalizedFuzzy && fuzzyToken && isSubsequence(fuzzyToken, normalizedFuzzy)) {
      score += 1 * weight;
    }
  }
  
  return score;
}

/**
 * Strip HTML tags
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Calculate product relevance score
 */
function calculateScore(product: Product, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  
  let score = 0;
  
  score += scoreField(tokens, product.title, FIELD_WEIGHTS.title);
  score += scoreField(tokens, product.vendor, FIELD_WEIGHTS.vendor);
  score += scoreField(tokens, stripHtml(product.description || product.bodyHtml || ''), FIELD_WEIGHTS.description);
  score += scoreField(tokens, product.tags?.join(' ') || '', FIELD_WEIGHTS.tags);
  
  return score;
}

/**
 * Get matched fields
 */
function getMatches(product: Product, tokens: string[]): string[] {
  const matched: string[] = [];
  
  if (tokens.some(t => normalize(product.title).includes(t))) matched.push('title');
  if (tokens.some(t => normalize(product.vendor).includes(t))) matched.push('vendor');
  if (tokens.some(t => normalize(stripHtml(product.description || product.bodyHtml || '')).includes(t))) matched.push('description');
  if (tokens.some(t => product.tags?.some(tag => normalize(tag).includes(t)))) matched.push('tags');
  
  return matched;
}

/**
 * Apply filters
 */
function applyFilters(products: Product[], filters?: SearchFilters): Product[] {
  if (!filters) return products;
  
  let filtered = products;
  
  if (filters.vendors && filters.vendors.length > 0) {
    filtered = filtered.filter(p => filters.vendors!.includes(p.vendor));
  }
  
  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    filtered = filtered.filter(p => p.price.amount >= min && p.price.amount <= max);
  }
  
  if (filters.inStock !== undefined && filters.inStock) {
    filtered = filtered.filter(p => p.inventory > 0);
  }
  
  return filtered;
}

/**
 * Sort results
 */
function sortResults(results: SearchResult[], sortBy: SortOption = 'recent-desc'): SearchResult[] {
  const sorted = [...results];
  
  switch (sortBy) {
    case 'recent-desc':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'price-asc':
      sorted.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case 'rating-desc':
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'vendor-asc':
      sorted.sort((a, b) => a.vendor.localeCompare(b.vendor));
      break;
    case 'vendor-desc':
      sorted.sort((a, b) => b.vendor.localeCompare(a.vendor));
      break;
    default:
      // Default to recent if unknown
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }
  
  return sorted;
}

/**
 * Main search function - optimized for 5k+ products
 */
export function searchProducts(
  products: Product[],
  options: SearchOptions
): SearchResult[] {
  const { query, filters, sortBy, limit } = options;
  
  // Apply filters first to reduce dataset
  const filtered = applyFilters(products, filters);
  
  // If no query, return filtered products
  if (!query || query.trim() === '') {
    const results = filtered.map(p => ({
      ...p,
      relevanceScore: 0,
      matchedFields: [] as string[],
    }));
    const sorted = sortResults(results, sortBy || 'vendor-asc');
    return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
  }
  
  // Tokenize query
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  
  // Calculate scores and filter by minimum
  const results: SearchResult[] = [];
  for (const product of filtered) {
    const score = calculateScore(product, tokens);
    
    if (score >= MINIMUM_SCORE) {
      results.push({
        ...product,
        relevanceScore: score,
        matchedFields: getMatches(product, tokens),
      });
    }
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // If no specific sortBy is provided, relevance is the internal default for active search
  if (!sortBy) {
    return typeof limit === 'number' ? results.slice(0, limit) : results;
  }
  
  // Apply user sorting and limit
  const sorted = sortResults(results, sortBy);
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

/**
 * Get unique vendors
 */
export function getUniqueVendors(products: Product[]): string[] {
  const vendors = new Set(products.map(p => p.vendor).filter(Boolean));
  return Array.from(vendors).sort();
}

/**
 * Get price range
 */
export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };
  
  const prices = products.map(p => p.price.amount);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
