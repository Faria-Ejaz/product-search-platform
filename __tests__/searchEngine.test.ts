import { describe, it, expect } from 'vitest';
import { searchProducts } from '@/lib/searchEngine';
import type { Product } from '@/types/product';

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Transparent Labs Whey Protein',
    vendor: 'Transparent Labs',
    status: 'ACTIVE',
    price: { amount: 40, currency: 'GBP' },
    description: 'High quality protein',
    tags: ['protein', 'whey'],
    images: [],
    inventory: 10,
    handle: 'tl-whey',
    productType: 'Supplements',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bodyHtml: '<p>High quality protein</p>'
  },
  {
    id: '2',
    title: 'Another Brand Supplement',
    vendor: 'Generic Brand',
    status: 'ACTIVE',
    price: { amount: 20, currency: 'GBP' },
    description: 'Contains Transparent Labs formula',
    tags: ['mix'],
    images: [],
    inventory: 5,
    handle: 'generic-supp',
    productType: 'Supplements',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bodyHtml: '<p>Contains formula</p>'
  }
];

describe('Search Engine logic', () => {
  it('should find products by brand name (Transparent Labs)', () => {
    const results = searchProducts(mockProducts, { query: 'Transparent Labs' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].vendor).toBe('Transparent Labs');
  });

  it('should identify matches in hidden fields like description', () => {
    const results = searchProducts(mockProducts, { query: 'formula' });
    const matchWithDescription = results.find(r => r.id === '2');
    expect(matchWithDescription).toBeDefined();
    expect(matchWithDescription?.matchedFields).toContain('description');
  });

  it('should correctly score title matches higher than description matches', () => {
    const results = searchProducts(mockProducts, { query: 'Transparent Labs' });
    // Product 1 has "Transparent Labs" in title AND vendor
    // Product 2 has it only in description
    expect(results[0].id).toBe('1');
    expect(results[1].id).toBe('2');
  });
});
