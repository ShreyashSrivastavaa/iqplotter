import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../src/state/store';
import { StageTabs } from '../src/components/showcase/StageTabs';
import { IngestionPanel } from '../src/components/upload/IngestionPanel';

describe('Component - StageTabs', () => {
  it('renders three workflow stages and supports keyboard arrow navigation', () => {
    render(
      <AppProvider>
        <StageTabs />
      </AppProvider>
    );

    const ingestionTab = screen.getByRole('tab', { name: /data ingestion/i });
    const inspectionTab = screen.getByRole('tab', { name: /data inspection/i });
    const visualizationTab = screen.getByRole('tab', { name: /data visualization/i });

    expect(ingestionTab).toBeInTheDocument();
    expect(inspectionTab).toBeInTheDocument();
    expect(visualizationTab).toBeInTheDocument();

    // Ingestion starts active
    expect(ingestionTab).toHaveAttribute('aria-selected', 'true');
    expect(inspectionTab).toHaveAttribute('aria-selected', 'false');

    // Press ArrowRight on ingestion tab
    fireEvent.keyDown(ingestionTab, { key: 'ArrowRight' });
    expect(inspectionTab).toHaveAttribute('aria-selected', 'true');

    // Press ArrowRight again
    fireEvent.keyDown(inspectionTab, { key: 'ArrowRight' });
    expect(visualizationTab).toHaveAttribute('aria-selected', 'true');

    // Press Home
    fireEvent.keyDown(visualizationTab, { key: 'Home' });
    expect(ingestionTab).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Component - IngestionPanel', () => {
  it('renders dropzone, browse files button and sample chips', () => {
    render(
      <AppProvider>
        <IngestionPanel />
      </AppProvider>
    );

    expect(screen.getByText(/Drag & drop your CSV here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument();
    expect(screen.getByText(/Monthly sales/i)).toBeInTheDocument();
    expect(screen.getByText(/Daily temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/Exam scores/i)).toBeInTheDocument();
    expect(screen.getByText(/Processed in your browser. Never uploaded./i)).toBeInTheDocument();
  });
});
