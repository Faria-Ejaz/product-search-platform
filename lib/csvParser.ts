/**
 * CSV Parser optimized for LARGE files (872k rows, 49MB)
 * Handles client-side parsing with progress tracking
 * Uses Papa Parse for robust CSV parsing with JSON fields
 */

import type { Product, ProductImage } from '@/types/product';

interface RawProductData {
  ID: string;
  TITLE: string;
  HANDLE: string;
  VENDOR: string;
  PRODUCT_TYPE: string;
  DESCRIPTION: string;
  BODY_HTML: string;
  TAGS: string;
  STATUS: string;
  CREATED_AT: string;
  UPDATED_AT: string;
  PRICE_RANGE_V2: string;
  TOTAL_INVENTORY: string;
  IMAGES: string;
  FEATURED_IMAGE: string;
  METAFIELDS?: string;
}

/**
 * Parse statistics for reporting
 */
interface ParseStats {
  totalRows: number;
  parsedProducts: number;
  skippedRows: number;
  errors: number;
  parseTime: number;
}

let cachedParseResult: { products: Product[]; stats: ParseStats } | null = null;

export function getCachedParseResult() {
  return cachedParseResult;
}

export function clearCachedParseResult() {
  cachedParseResult = null;
}

/**
 * Safe JSON parse
 */
function safeJsonParse<T>(json: string | undefined): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Extract price from JSON
 */
function extractPrice(priceJson: string): { amount: number; currency: string } {
  const priceRange = safeJsonParse<{
    min_variant_price?: { amount: number; currency_code: string };
  }>(priceJson);
  
  if (priceRange?.min_variant_price) {
    return {
      amount: Number(priceRange.min_variant_price.amount) || 0,
      currency: priceRange.min_variant_price.currency_code || 'GBP',
    };
  }
  
  return { amount: 0, currency: 'GBP' };
}

/**
 * Extract images
 */
function extractImages(imagesJson: string, featuredJson?: string): ProductImage[] {
  const images: ProductImage[] = [];
  
  if (featuredJson) {
    const featured = safeJsonParse<{
      id?: string;
      url?: string;
      alt_text?: string;
      width?: number;
      height?: number;
    }>(featuredJson);
    
    if (featured?.url) {
      images.push({
        id: featured.id || 'featured',
        url: featured.url,
        altText: featured.alt_text,
        width: featured.width,
        height: featured.height,
      });
    }
  }
  
  return images;
}

/**
 * Extract rating
 */
function extractRating(metafieldsJson?: string): { rating?: number; reviewCount?: number } {
  if (!metafieldsJson) return {};
  
  const metafields = safeJsonParse<Record<string, { value: string }>>(metafieldsJson);
  if (!metafields) return {};
  
  const rating = parseFloat(metafields.yotpo_reviews_average?.value || '0') || undefined;
  const reviewCount = parseInt(metafields.yotpo_reviews_count?.value || '0', 10) || undefined;
  
  return {
    rating: rating && rating > 0 ? rating : undefined,
    reviewCount: reviewCount && reviewCount > 0 ? reviewCount : undefined,
  };
}

/**
 * Parse tags
 */
function parseTags(tagsString: string): string[] {
  if (!tagsString) return [];
  return tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0);
}

/**
 * Parse single product row
 */
function parseProduct(raw: RawProductData): Product | null {
  try {
    const price = extractPrice(raw.PRICE_RANGE_V2);
    const images = extractImages(raw.IMAGES, raw.FEATURED_IMAGE);
    const { rating, reviewCount } = extractRating(raw.METAFIELDS);
    const tags = parseTags(raw.TAGS || '');
    
    return {
      id: raw.ID || '',
      title: raw.TITLE || 'Untitled Product',
      handle: raw.HANDLE || '',
      vendor: raw.VENDOR || 'Unknown',
      productType: raw.PRODUCT_TYPE || '',
      description: raw.DESCRIPTION || '',
      bodyHtml: raw.BODY_HTML || '',
      tags,
      status: (raw.STATUS as 'ACTIVE' | 'DRAFT' | 'ARCHIVED') || 'ACTIVE',
      createdAt: raw.CREATED_AT || '',
      updatedAt: raw.UPDATED_AT || '',
      price,
      inventory: parseInt(raw.TOTAL_INVENTORY || '0', 10),
      images,
      rating,
      reviewCount,
    };
  } catch (error) {
    console.warn('Failed to parse product:', error);
    return null;
  }
}

/**
 * Parse CSV text into products array
 * Optimized for large files with chunking and progress
 */
export function parseCSV(
  csvText: string,
  onProgress?: (percent: number, stats?: Partial<ParseStats>) => void
): { products: Product[]; stats: ParseStats } {
  const startTime = Date.now();
  
  // Split more carefully to handle newlines in quoted fields
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    
    if (char === '"') {
      if (csvText[i + 1] === '"') {
        currentLine += '""';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      // Skip \r\n combination
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  
  // Add last line
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  if (lines.length < 2) {
    return {
      products: [],
      stats: {
        totalRows: 0,
        parsedProducts: 0,
        skippedRows: 0,
        errors: 0,
        parseTime: Date.now() - startTime,
      },
    };
  }

  // Parse header - handle CSV with proper escaping
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  
  const products: Product[] = [];
  let skippedRows = 0;
  let errors = 0;
  const totalLines = lines.length - 1;
  
  // Parse rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      skippedRows++;
      continue;
    }
    
    try {
      const values = parseCSVLine(line);
      
      // Create object from headers and values
      const rawData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rawData[header] = values[index] || '';
      });
      
      const product = parseProduct(rawData as unknown as RawProductData);
      
      // Only include active products with a valid price (> 0)
      if (product && product.status === 'ACTIVE' && product.price.amount > 0) {
        products.push(product);
      } else {
        skippedRows++;
      }
    } catch (error) {
      errors++;
      skippedRows++;
    }
    
    // Report progress every 1000 rows
    if (onProgress && i % 1000 === 0) {
      const percent = Math.round((i / totalLines) * 100);
      onProgress(percent, {
        totalRows: i,
        parsedProducts: products.length,
        skippedRows,
        errors,
      });
    }
  }
  
  if (onProgress) {
    onProgress(100, {
      totalRows: totalLines,
      parsedProducts: products.length,
      skippedRows,
      errors,
    });
  }
  
  const parseTime = Date.now() - startTime;

  const result = {
    products,
    stats: {
      totalRows: totalLines,
      parsedProducts: products.length,
      skippedRows,
      errors,
      parseTime,
    },
  };

  cachedParseResult = result;

  return result;
}

/**
 * Parse a single CSV line handling quoted fields with embedded commas/newlines
 * Uses simple split-based parsing to avoid recursion issues
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      // Check if this is an escaped quote (two quotes in a row while in quotes)
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field when we hit comma outside quotes
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

/**
 * Parse CSV file from File object
 */
export async function parseCSVFile(
  file: File,
  onProgress?: (percent: number, stats?: Partial<ParseStats>) => void
): Promise<{ products: Product[]; stats: ParseStats }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      try {
        const result = parseCSV(text, onProgress);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Export parse statistics interface
 */
export type { ParseStats };
