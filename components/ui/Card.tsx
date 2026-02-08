/**
 * Reusable Card Component
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card = React.memo(function Card({
  children,
  hover = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-background-card rounded-card overflow-hidden
        ${hover ? 'hover:shadow-card-hover transition-shadow duration-default' : 'shadow-card'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
});
