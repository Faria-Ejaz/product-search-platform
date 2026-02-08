/**
 * Product Card Component
 * Matches the design reference with "Add to cart" button
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { SearchResult } from '@/types/product';
import { Card, Button, StarIcon } from '../ui';

interface ProductCardProps {
  product: SearchResult;
  onAddToCart?: () => void;
  searchQuery?: string;
}

const HighlightText = ({ text, query }: { text: string; query?: string }) => {
  if (!text) return null;
  if (!query || !query.trim()) return <>{text}</>;

  // Use the same tokenization as the search engine
  const normalize = (t: string) => t.toLowerCase().trim().replace(/\s+/g, ' ');
  const tokens = normalize(query).split(' ').filter(t => t.length > 0);
  
  if (tokens.length === 0) return <>{text}</>;

  // Sort tokens by length descending to match longest possible string first
  const sortedTokens = [...tokens].sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${sortedTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        
        const isMatch = tokens.some(token => 
          part.toLowerCase() === token.toLowerCase() ||
          (token.length >= 3 && part.toLowerCase().includes(token.toLowerCase()))
        );

        return isMatch ? (
          <mark key={i} className="bg-yellow-100 text-yellow-900 rounded-px px-0.5">
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </>
  );
};

export const ProductCard = React.memo(function ProductCard({ product, onAddToCart, searchQuery }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasImage = product.images.length > 0 && product.images[0].url;
  const fallbackImage =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">' +
        '<rect width="600" height="600" fill="#F3F4F6" />' +
        '<rect x="120" y="140" width="360" height="320" rx="24" fill="#E5E7EB" />' +
        '<circle cx="220" cy="240" r="28" fill="#D1D5DB" />' +
        '<path d="M160 380l90-90 70 70 90-110 130 130H160z" fill="#D1D5DB" />' +
        '<text x="300" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#9CA3AF">No image</text>' +
      '</svg>'
    );
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice.amount - product.price.amount) / product.compareAtPrice.amount) * 100)
    : 0;
  const isOutOfStock = product.inventory === 0;

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card hover className="group" role="article" aria-label={`Product: ${product.title}`}>
      {/* Image Container */}
      <div className="relative aspect-square bg-[#f3f4f6] overflow-hidden">
        {/* Skeleton Shimmer */}
        {!imageLoaded && hasImage && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" aria-hidden="true" />
        )}
        
        <Image
          src={hasImage ? product.images[0].url : fallbackImage}
          alt={product.images[0]?.altText || product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`
            object-cover transition-all duration-500
            ${imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}
            group-hover:scale-105
          `}
          onLoad={() => setImageLoaded(true)}
          unoptimized={!hasImage} // Don't optimize the SVG data URI fallback
        />
        
        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-20">
            <span 
              className="px-2.5 py-1 bg-primary text-white text-xs font-medium rounded"
              role="status"
            >
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-card">
        {/* Vendor */}
        <div className="text-xs font-semibold uppercase tracking-wide text-secondary mb-1">
          <span className="sr-only">Brand: </span>
          <HighlightText text={product.vendor} query={searchQuery} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-normal text-text-primary mb-3 line-clamp-2 min-h-[2.5rem]">
          <HighlightText text={product.title} query={searchQuery} />
        </h3>

        {/* Match Info (if match is only in hidden fields) */}
        {searchQuery && product.matchedFields && product.matchedFields.length > 0 && 
         !product.matchedFields.includes('title') && !product.matchedFields.includes('vendor') && (
          <div className="mb-3 text-[10px] text-secondary bg-gray-50 px-2 py-1 rounded inline-flex items-center gap-1 italic">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Matched in {product.matchedFields.includes('description') ? 'description' : (product.matchedFields.includes('tags') ? 'tags' : 'related fields')}
          </div>
        )}

        {/* Rating */}
        {product.rating && product.reviewCount && (
          <div className="flex items-center gap-1 mb-3" aria-label={`Rating: ${product.rating} out of 5 stars from ${product.reviewCount} reviews`}>
            <div className="flex" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  filled={i < Math.round(product.rating!)}
                  className="text-black"
                />
              ))}
            </div>
            <span className="text-xs text-secondary underline ml-1">
              {product.reviewCount} Reviews
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          <div className="text-lg font-medium text-text-primary">
            <span className="sr-only">Current Price: </span>
            {formatPrice(product.price.amount, product.price.currency)}
          </div>
          {product.compareAtPrice && (
            <div className="text-sm text-secondary line-through">
              <span className="sr-only">Original Price: </span>
              {formatPrice(product.compareAtPrice.amount, product.compareAtPrice.currency)}
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="secondary"
          size="md"
          disabled={isOutOfStock}
          onClick={onAddToCart}
          aria-label={isOutOfStock ? `${product.title} is out of stock` : `Add ${product.title} to cart`}
          className="w-full rounded-full hover:bg-black hover:text-white"
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
        </Button>
      </div>
    </Card>
  );
});
