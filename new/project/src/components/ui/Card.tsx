// components/ui/Card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'gradient';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, children, variant = 'dark', hover = false, ...props }) => {
  const baseStyles = 'rounded-xl shadow-lg p-6 transition-all duration-300';

  const variantStyles = {
    light: 'bg-white/10 border border-white/20 text-white backdrop-blur-sm',
    dark: 'bg-gradient-to-br from-white/15 to-white/8 backdrop-blur-xl border border-white/25 text-white',
    gradient: 'bg-gradient-to-br from-primary-600/20 to-secondary-500/20 backdrop-blur-xl border border-white/25 text-white',
  };

  const hoverStyles = hover ? 'hover:scale-105 hover:shadow-xl' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};