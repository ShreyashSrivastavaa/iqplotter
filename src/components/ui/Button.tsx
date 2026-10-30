import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-mono font-semibold rounded-full transition-all duration-150 active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0 select-none';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px]',
    md: 'text-sm sm:text-base px-5 py-2.5 min-h-[44px]',
    lg: 'text-base sm:text-lg px-7 py-3.5 min-h-[52px]',
  }[size];

  const variantClasses = {
    primary: 'bg-[#1A1714] text-[#FAF7E9] hover:bg-[#34301F] shadow-sm',
    outline: 'border border-[#8A8478] bg-transparent text-[#1A1714] hover:bg-[#FCFAF2]',
    ghost: 'bg-transparent text-[#1A1714] hover:bg-[#FCFAF2]/80',
    danger: 'bg-[#B42318] text-white hover:bg-[#912015]',
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
