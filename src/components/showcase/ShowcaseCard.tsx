import React from 'react';
import { StageTabs } from './StageTabs';
import { useApp } from '../../state/store';
import { IngestionPanel } from '../upload/IngestionPanel';
import { InspectionPanel } from '../inspect/InspectionPanel';
import { VisualizationPanel } from '../visualize/VisualizationPanel';

export const ShowcaseCard: React.FC = () => {
  const { state, scrollToWorkspace } = useApp();
  const prevTabRef = React.useRef(state.activeTab);

  React.useEffect(() => {
    if (prevTabRef.current !== state.activeTab) {
      prevTabRef.current = state.activeTab;
      scrollToWorkspace();
    }
  }, [state.activeTab, scrollToWorkspace]);

  return (
    <section id="workspace" className="w-full max-w-[1375px] mx-auto px-4 sm:px-6 my-10 sm:my-16 scroll-mt-24">
      {/* Outer Gradient Card */}
      <div className="w-full rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 lg:p-12 lg:pt-[51px] bg-[var(--gradient)] shadow-md border border-line/40 transition-all">
        {/* Stage Tabs (Role Tablist) */}
        <div className="mb-6 sm:mb-10 lg:mb-[60px]">
          <StageTabs />
        </div>

        {/* Inner Workspace Card */}
        <div
          role="tabpanel"
          id={`panel-${state.activeTab}`}
          aria-labelledby={`tab-${state.activeTab}`}
          className="w-full max-w-[1248px] mx-auto min-h-[460px] bg-card text-ink rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 lg:p-10 shadow-innerCard border border-line/70 transition-all duration-150"
        >
          {state.activeTab === 'ingestion' && <IngestionPanel />}
          {state.activeTab === 'inspection' && <InspectionPanel />}
          {state.activeTab === 'visualization' && <VisualizationPanel />}
        </div>
      </div>
    </section>
  );
};
