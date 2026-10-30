import { PaletteId } from '../../state/types';

export const PALETTES: Record<PaletteId, { name: string; colors: string[] }> = {
  classic: {
    name: 'Classic',
    colors: ['#2F5D8A', '#D9822B', '#3C8D5A', '#B5423A', '#7A5BA6', '#8C6D46', '#D06BA0', '#5F6B73'],
  },
  warm: {
    name: 'Warm',
    colors: ['#C2410C', '#D97706', '#CA8A04', '#B45309', '#9A3412', '#A16207', '#7C2D12', '#854D0E'],
  },
  cool: {
    name: 'Cool',
    colors: ['#1D4ED8', '#0E7490', '#0F766E', '#4338CA', '#0369A1', '#115E59', '#5B21B6', '#1E40AF'],
  },
  sunset: {
    name: 'Sunset',
    colors: ['#F26B21', '#E11D48', '#8B5CF6', '#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#6366F1'],
  },
  cyberpunk: {
    name: 'Neon',
    colors: ['#06B6D4', '#10B981', '#84CC16', '#F43F5E', '#A855F7', '#EAB308', '#3B82F6', '#14B8A6'],
  },
};

export interface ChartProblem {
  code: 'NO_X' | 'NO_Y' | 'NON_NUMERIC_X' | 'NON_NUMERIC_Y' | 'PIE_INVALID' | 'EMPTY_SERIES';
  message: string;
  suggestion?: {
    label: string;
    action: {
      xKey?: string;
      yKeys?: string[];
      type?: 'bar' | 'line' | 'scatter' | 'pie';
    };
  };
}

export interface ChartDataPoint {
  x: string | number;
  xDisplay: string;
  [seriesKey: string]: string | number | null | undefined;
}

export interface ChartSeriesMeta {
  seriesKeys: string[];
  notes: string[];
  downsampled?: boolean;
  truncatedCategories?: boolean;
  excludedCount?: number;
  totalPoints: number;
  hasDots: boolean;
  isDateX?: boolean;
  maxY?: number;
}

export interface BuiltChartResult {
  problem?: ChartProblem;
  data: ChartDataPoint[];
  meta: ChartSeriesMeta;
}
