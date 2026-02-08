import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { describe, it, expect, vi } from 'vitest';
import type { Product } from '@/types/product';

const mockProducts: Product[] = [];

describe('FilterSidebar Component', () => {
  const defaultProps = {
    products: mockProducts,
    filters: undefined,
    onFiltersChange: vi.fn(),
    isOpen: true,
    onClose: vi.fn(),
    query: '',
    onQueryChange: vi.fn(),
  };

  it('should toggle sections when clicked', () => {
    render(<FilterSidebar {...defaultProps} />);
    
    const availabilityButton = screen.getByRole('button', { name: /Availability/i });
    
    // Check if expanded initially (based on our default state)
    expect(availabilityButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click to collapse
    fireEvent.click(availabilityButton);
    expect(availabilityButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should call onFiltersChange when availability is toggled', () => {
    render(<FilterSidebar {...defaultProps} />);
    
    const checkbox = screen.getByLabelText(/In stock only/i);
    fireEvent.click(checkbox);
    
    expect(defaultProps.onFiltersChange).toHaveBeenCalled();
  });
});
