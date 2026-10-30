import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'number' | 'date' | 'category' | 'text' | 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    number: 'bg-[#EBF3FB] text-[#1D4ED8] border-[#BFDBFE]',
    date: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDD3]',
    category: 'bg-[#FEF7EC] text-[#B54708] border-[#FEDF89]',
    text: 'bg-[#F2F4F7] text-[#344054] border-[#EAECF0]',
    neutral: 'bg-[#F4EFE6] text-[#5C574D] border-[#E9E4D2]',
    success: 'bg-[#ECFDF3] text-[#067647] border-[#A6F4C5]',
    warning: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
    danger: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
