import React from 'react';
import { Upload, TrendingUp, BarChart3 } from 'lucide-react';
import { useApp } from '../../state/store';
import { WorkspaceTab } from '../../state/types';

interface TabItem {
  id: WorkspaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'ingestion', label: 'Data Ingestion', icon: Upload },
  { id: 'inspection', label: 'Data Inspection', icon: TrendingUp },
  { id: 'visualization', label: 'Data Visualization', icon: BarChart3 },
];

export const StageTabs: React.FC = () => {
  const { state, dispatch } = useApp();
  const tabListRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = TABS.length - 1;
    }

    if (nextIndex !== index) {
      const nextTab = TABS[nextIndex];
      if (nextTab) {
        dispatch({ type: 'SET_ACTIVE_TAB', tab: nextTab.id });
        const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
        buttons?.[nextIndex]?.focus();
      }
    }
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label="Workflow stages"
      className="w-full max-w-[778px] mx-auto min-h-[64px] sm:min-h-[74px] p-1.5 sm:p-2 rounded-full border border-white/60 dark:border-white/15 bg-pill-bg backdrop-blur-md flex items-center justify-between gap-1 shadow-sm select-none"
    >
      {TABS.map((tab, idx) => {
        const isActive = state.activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: tab.id })}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 px-3 sm:px-4 rounded-full font-mono font-medium text-xs sm:text-base lg:text-[18px] transition-all duration-150 ${
              isActive
                ? 'bg-pill-active border border-pill-border text-ink shadow-sm'
                : 'text-ink/80 hover:text-ink hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            <Icon
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isActive ? 'text-accent-orange' : 'text-ink'
              }`}
            />
            {/* Show label always on >=480px, or on active tab on <480px */}
            <span
              className={`truncate ${
                isActive ? 'inline' : 'hidden xs:inline sm:inline'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
