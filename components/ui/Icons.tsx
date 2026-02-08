/**
 * Reusable Icon Components
 */

export const SearchIcon = ({ className = '' }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 13L17.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const FilterIcon = ({ className = '' }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export const StarIcon = ({ filled = false, className = '' }: { filled?: boolean; className?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1"
    className={className}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export const SpinnerIcon = ({ className = '' }: { className?: string }) => (
  <div className={`border-4 border-secondary-lighter border-t-primary rounded-full animate-spin ${className}`} />
);
