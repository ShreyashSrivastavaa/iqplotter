import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  onRemove,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border transition-colors select-none ${
        selected
          ? 'bg-[#1A1714] text-[#FAF7E9] border-[#1A1714]'
          : 'bg-[#FCFAF2] text-[#1A1714] border-[#8A8478]/50 hover:border-[#1A1714]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span>{label}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-[#F26B21] ml-0.5"
          aria-label={`Remove ${label}`}
        >
          ×
        </span>
      )}
    </button>
  );
};
