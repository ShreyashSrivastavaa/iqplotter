import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'number' | 'date' | 'category' | 'text' | 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles = {
    number:
      'bg-[#EBF3FB] text-[#1D4ED8] border-[#BFDBFE] dark:bg-[#1E3A8A]/30 dark:text-[#93C5FD] dark:border-[#1E40AF]/40',
    date:
      'bg-[#FEF3F2] text-[#B42318] border-[#FECDD3] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5] dark:border-[#991B1B]/40',
    category:
      'bg-[#FEF7EC] text-[#B54708] border-[#FEDF89] dark:bg-[#78350F]/30 dark:text-[#FDE68A] dark:border-[#92400E]/40',
    text:
      'bg-[#F2F4F7] text-[#344054] border-[#EAECF0] dark:bg-[#374151]/30 dark:text-[#D1D5DB] dark:border-[#4B5563]/40',
    neutral:
      'bg-[#F4EFE6] text-[#5C574D] border-[#E9E4D2] dark:bg-[#2B2824] dark:text-[#B8B2A6] dark:border-[#3D3933]',
    success:
      'bg-[#ECFDF3] text-[#067647] border-[#A6F4C5] dark:bg-[#064E3B]/30 dark:text-[#6EE7B7] dark:border-[#065F46]/40',
    warning:
      'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89] dark:bg-[#78350F]/30 dark:text-[#FDE68A] dark:border-[#92400E]/40',
    danger:
      'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5] dark:border-[#991B1B]/40',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
