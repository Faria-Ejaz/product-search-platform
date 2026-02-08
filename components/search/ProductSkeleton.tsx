'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export const ProductSkeleton = () => {
  return (
    <Card className="animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200 overflow-hidden" />
      
      {/* Content Skeleton */}
      <div className="p-card space-y-3">
        {/* Vendor */}
        <div className="h-3 w-1/4 bg-gray-200 rounded" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
        </div>
        
        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-3 bg-gray-200 rounded-full" />
          ))}
        </div>
        
        {/* Price */}
        <div className="h-6 w-1/3 bg-gray-200 rounded mt-2" />
        
        {/* Button */}
        <div className="h-10 w-full bg-gray-200 rounded-full mt-4" />
      </div>
    </Card>
  );
};
