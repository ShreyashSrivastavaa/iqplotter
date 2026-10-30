import React from 'react';
import { Header } from './components/layout/Header';
import { Hero } from './components/hero/Hero';
import { ShowcaseCard } from './components/showcase/ShowcaseCard';
import { ContentSections } from './components/content/ContentSections';
import { Footer } from './components/layout/Footer';
import { HistoryDrawer } from './components/history/HistoryDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { Toast } from './components/ui/Toast';
import { useApp } from './state/store';

export const AppContent: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink transition-colors duration-200 selection:bg-[#F26B21]/20">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Hero */}
        <Hero />

        {/* Workspace Showcase Card */}
        <ShowcaseCard />

        {/* Content Sections */}
        <ContentSections />
      </main>

      {/* Footer */}
      <Footer />

      {/* Overlays */}
      <HistoryDrawer />
      <AuthModal />
      <KeyboardShortcutsModal />
      <Toast message={toastMessage} />
    </div>
  );
};

