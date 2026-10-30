import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }[size];

  return (
    <div
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-solid border-[#1A1714] border-t-transparent ${sizeMap} ${className}`}
    />
  );
};

export const ProgressBar: React.FC<{ progress: number; label?: string }> = ({ progress, label }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      {label && (
        <div className="flex justify-between text-xs font-mono text-[#5C574D] mb-1">
          <span>{label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-[#E9E4D2] h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#1A1714] h-full transition-all duration-150 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="p-6 text-center bg-[#FCFAF2] border border-[#E9E4D2] rounded-2xl">
          <p className="text-sm font-mono text-[#B42318] font-semibold mb-2">
            Something went wrong rendering this chart.
          </p>
          <p className="text-xs font-mono text-[#5C574D] mb-4">
            {this.state.error?.message || 'Unexpected rendering error.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs font-mono underline hover:text-[#1A1714]"
          >
            Try reloading chart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
