export type ColumnType = 'number' | 'date' | 'category' | 'text';

export interface Column {
  key: string;
  label: string;
  type: ColumnType;
  missingCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
}

export type Cell = string | number | null;
export type Row = Record<string, Cell>;

export interface CleaningReport {
  removedEmptyRows: number;
  removedEmptyColumns: number;
  removedDuplicateRows: number;
  renamedHeaders: { from: string; to: string }[];
  normalizedNumericColumns: string[];
  missingValueCells: number;
  truncated: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  rows: Row[];
  columns: Column[];
  report: CleaningReport;
  loadedAt: number;
  rawSizeBytes?: number;
}

export type ChartType = 'bar' | 'line' | 'scatter' | 'pie';
export type Aggregation = 'sum' | 'mean' | 'count';
export type PaletteId = 'classic' | 'warm' | 'cool' | 'sunset' | 'cyberpunk';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ChartConfig {
  type: ChartType;
  xKey: string | null;
  yKeys: string[];
  aggregation: Aggregation;
  title: string;
  xLabel: string;
  yLabel: string;
  palette: PaletteId;
  top30ByValue?: boolean;
  sortOrder?: 'default' | 'desc' | 'asc';
  showGrid?: boolean;
  showDots?: boolean;
  curveType?: 'monotone' | 'linear';
  barRadius?: number;
}

export type AppErrorCode =
  | 'EMPTY_FILE'
  | 'NO_ROWS'
  | 'TOO_FEW_ROWS'
  | 'BAD_TYPE'
  | 'PARSE_FAILED'
  | 'NO_NUMERIC_COLUMNS'
  | 'TOO_LARGE';

export type AppError =
  | { code: 'EMPTY_FILE' | 'NO_ROWS' | 'TOO_FEW_ROWS' | 'BAD_TYPE' | 'PARSE_FAILED' | 'NO_NUMERIC_COLUMNS'; message?: string }
  | { code: 'TOO_LARGE'; maxMB: number; message?: string };

export type WorkspaceTab = 'ingestion' | 'inspection' | 'visualization';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AppState {
  dataset: Dataset | null;
  config: ChartConfig | null;
  activeTab: WorkspaceTab;
  status: 'idle' | 'parsing' | 'ready' | 'error';
  error: AppError | null;
  notices: string[];
  cleaningNoticeDismissed: boolean;
  historyOpen: boolean;
  authModalOpen: boolean;
  shortcutsModalOpen: boolean;
  user: UserProfile | null;
  theme: ThemeMode;
  isDark: boolean;
}

export type AppAction =
  | { type: 'SET_ACTIVE_TAB'; tab: WorkspaceTab }
  | { type: 'START_PARSING'; filename?: string }
  | { type: 'PARSE_SUCCESS'; dataset: Dataset; config: ChartConfig; notices?: string[]; targetTab?: WorkspaceTab }
  | { type: 'PARSE_ERROR'; error: AppError }
  | { type: 'SET_CONFIG'; config: Partial<ChartConfig> }
  | { type: 'DISMISS_CLEANING_NOTICE' }
  | { type: 'ADD_NOTICE'; notice: string }
  | { type: 'DISMISS_NOTICE'; index: number }
  | { type: 'CLEAR_DATASET' }
  | { type: 'TOGGLE_HISTORY'; open?: boolean }
  | { type: 'TOGGLE_AUTH_MODAL'; open?: boolean }
  | { type: 'TOGGLE_SHORTCUTS_MODAL'; open?: boolean }
  | { type: 'SET_USER'; user: UserProfile | null }
  | { type: 'SET_THEME'; theme: ThemeMode; isDark: boolean }
  | { type: 'RESTORE_DATASET_AND_CONFIG'; dataset: Dataset; config: ChartConfig };
