import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TradingProvider } from './context/TradingContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavigationTab } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { JournalTable } from './components/journal/JournalTable';
import { AnalyseView } from './components/analyse/AnalyseView';
import { InsightsView } from './components/insights/InsightsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddTradeModal } from './components/journal/AddTradeModal';
import { TradeDetailModal } from './components/journal/TradeDetailModal';
import { CsvImportModal } from './components/journal/CsvImportModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { Modal } from './components/common/Modal';
import { RiskCalculator } from './components/analyse/RiskCalculator';
import { Trade } from './types';
import { AuthScreen } from './components/auth/AuthScreen';
import { DisclaimerModal } from './components/auth/DisclaimerModal';

const MainLayout: React.FC = () => {
  const { user, currentUser, isAuthenticated, acceptDisclaimer } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Modals state
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => Boolean(currentUser && !currentUser.isOnboarded));
  const [isRiskCalcOpen, setIsRiskCalcOpen] = useState(false);

  // If not authenticated, require registration/login first
  if (!isAuthenticated || !currentUser) {
    return <AuthScreen />;
  }

  const handleOpenAddTrade = () => {
    setEditingTrade(null);
    setIsAddTradeOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsAddTradeOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAddTrade={handleOpenAddTrade}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-1 w-full max-w-[1720px] mx-auto">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 lg:p-7 pb-24 md:pb-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddTrade={handleOpenAddTrade}
              onNavigateToAnalyse={() => setActiveTab('analyse')}
              onNavigateToInsights={() => setActiveTab('insights')}
              onOpenRiskCalculator={() => setIsRiskCalcOpen(true)}
              onOpenCsvImport={() => setIsCsvImportOpen(true)}
            />
          )}

          {activeTab === 'journal' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Trading Journal
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record setups in &lt;30 seconds • Automatic calculations and emotional tagging
                </p>
              </div>
              <JournalTable
                onOpenAddTrade={handleOpenAddTrade}
                onEditTrade={handleEditTrade}
                onSelectTrade={setSelectedTrade}
                onOpenCsvImport={() => setIsCsvImportOpen(true)}
              />
            </div>
          )}

          {activeTab === 'analyse' && <AnalyseView />}

          {activeTab === 'insights' && <InsightsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <AddTradeModal
        isOpen={isAddTradeOpen}
        onClose={() => {
          setIsAddTradeOpen(false);
          setEditingTrade(null);
        }}
        initialTrade={editingTrade}
      />

      <TradeDetailModal
        isOpen={!!selectedTrade}
        onClose={() => setSelectedTrade(null)}
        trade={selectedTrade}
        onEdit={handleEditTrade}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onOpenCsvImport={() => setIsCsvImportOpen(true)}
      />

      {/* Standalone Risk Calculator Modal */}
      <Modal
        isOpen={isRiskCalcOpen}
        onClose={() => setIsRiskCalcOpen(false)}
        title="Risk & Position Sizing Calculator"
        subtitle="Calculate mathematically precise position sizing and capital allocation"
        maxWidth="2xl"
      >
        <RiskCalculator />
      </Modal>

      {/* Mandatory First-Time SEBI & Educational Disclaimer Modal */}
      <DisclaimerModal
        isOpen={Boolean(currentUser && !currentUser.hasAcceptedDisclaimer)}
        onAccept={acceptDisclaimer}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TradingProvider>
        <MainLayout />
      </TradingProvider>
    </AuthProvider>
  );
}
