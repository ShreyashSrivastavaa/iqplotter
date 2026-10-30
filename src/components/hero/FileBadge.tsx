import React from 'react';

export interface FileBadgeProps {
  variant: 'csv' | 'xls' | 'generic';
  className?: string;
}

export const FileBadge: React.FC<FileBadgeProps> = ({ variant, className = '' }) => {
  if (variant === 'csv') {
    // 1. CSV: white document icon with a folded top-right corner and a black rounded label reading "CSV" (white mono text) across its lower half.
    return (
      <svg
        className={`inline-block align-middle select-none drop-shadow-sm ${className}`}
        width="1.15em"
        height="1.15em"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Document base with folded corner */}
        <path
          d="M6 4C6 2.89543 6.89543 2 8 2H20L26 8V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V4Z"
          fill="#FFFFFF"
          stroke="#1A1714"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Folded corner triangle */}
        <path
          d="M20 2V8H26"
          fill="#FAF7E9"
          stroke="#1A1714"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Document line hint */}
        <line x1="10" y1="10" x2="16" y2="10" stroke="#E9E4D2" strokeWidth="1.5" strokeLinecap="round" />
        {/* Black label badge across lower half with white CSV text */}
        <rect x="4" y="16" width="24" height="11" rx="3" fill="#1A1714" />
        <text
          x="16"
          y="24.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily='"IBM Plex Mono", monospace'
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          CSV
        </text>
      </svg>
    );
  }

  if (variant === 'xls') {
    // 2. XLS: green document icon (#1D7B45-ish) with white "XLS" text.
    return (
      <svg
        className={`inline-block align-middle select-none drop-shadow-sm ${className}`}
        width="1.15em"
        height="1.15em"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6 4C6 2.89543 6.89543 2 8 2H20L26 8V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V4Z"
          fill="#1D7B45"
          stroke="#12562F"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M20 2V8H26"
          fill="#279958"
          stroke="#12562F"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* White label pill */}
        <rect x="4" y="16" width="24" height="11" rx="3" fill="#145A32" />
        <text
          x="16"
          y="24.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily='"IBM Plex Mono", monospace'
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          XLS
        </text>
      </svg>
    );
  }

  // 3. Neutral badge: blue (#1F6FD1) rounded-square (radius ≈14%) with a simple white table-grid glyph.
  return (
    <svg
      className={`inline-block align-middle select-none drop-shadow-sm ${className}`}
      width="1.15em"
      height="1.15em"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="4.5" fill="#1F6FD1" stroke="#17529C" strokeWidth="1" />
      {/* Table grid glyph */}
      <rect x="6" y="6" width="20" height="20" rx="2" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="6" y1="13" x2="26" y2="13" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="6" y1="19" x2="26" y2="19" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="14" y1="6" x2="14" y2="26" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
};

import { useApp } from '../../state/store';

export const BadgeCluster: React.FC = () => {
  const { loadSampleByName, scrollToWorkspace } = useApp();

  const handleBadgeClick = (sample: string, e: React.MouseEvent) => {
    e.stopPropagation();
    scrollToWorkspace(false);
    loadSampleByName(sample);
  };

  return (
    <span
      role="presentation"
      className="inline-flex items-center align-middle mx-[0.15em] relative -translate-y-[0.05em]"
    >
      <button
        type="button"
        onClick={(e) => handleBadgeClick('monthly-sales.csv', e)}
        title="Click to load Monthly Sales sample"
        aria-label="Load CSV sample"
        className="relative z-10 transition-transform hover:-translate-y-1 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
      >
        <FileBadge variant="csv" />
      </button>
      <button
        type="button"
        onClick={(e) => handleBadgeClick('daily-temperature.csv', e)}
        title="Click to load Daily Temperature sample"
        aria-label="Load XLS sample"
        className="relative z-20 -ml-[0.45em] transition-transform hover:-translate-y-1 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
      >
        <FileBadge variant="xls" />
      </button>
      <button
        type="button"
        onClick={(e) => handleBadgeClick('exam-scores.csv', e)}
        title="Click to load Exam Scores sample"
        aria-label="Load Exam Scores sample"
        className="relative z-30 -ml-[0.45em] transition-transform hover:-translate-y-1 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
      >
        <FileBadge variant="generic" />
      </button>
    </span>
  );
};
