import React from 'react';
import { PerformanceHeader } from './PerformanceHeader';
import { QuickActions } from './QuickActions';
import { EquityCurveChart } from './EquityCurveChart';
import { AICoachCard } from './AICoachCard';
import { PnLCalendar } from './PnLCalendar';
import { BreakdownCharts } from './BreakdownCharts';

interface DashboardViewProps {
  onOpenAddTrade: () => void;
  onNavigateToAnalyse: () => void;
  onNavigateToInsights: () => void;
  onOpenRiskCalculator: () => void;
  onOpenCsvImport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddTrade,
  onNavigateToAnalyse,
  onNavigateToInsights,
  onOpenRiskCalculator,
  onOpenCsvImport,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Top Greeting & Performance Metrics */}
      <PerformanceHeader />

      {/* 2. Quick Actions */}
      <QuickActions
        onAddTrade={onOpenAddTrade}
        onAnalyseMarket={onNavigateToAnalyse}
        onOpenRiskCalculator={onOpenRiskCalculator}
        onOpenCsvImport={onOpenCsvImport}
      />

      {/* 3. Equity Curve Chart */}
      <EquityCurveChart />

      {/* 4. AI Trading Coach Summary Card */}
      <AICoachCard onViewInsights={onNavigateToInsights} />

      {/* 5. Daily P&L Calendar */}
      <PnLCalendar />

      {/* 6. Trading Breakdown */}
      <BreakdownCharts />
    </div>
  );
};
