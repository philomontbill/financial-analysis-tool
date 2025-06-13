import React, { useState } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import ViewSelector from './ui/ViewSelector';
import DashboardView from './views/DashboardView';
import TableView from './views/TableView';
import SummaryView from './views/SummaryView';
import DebugTest from './DebugTest';
import MinimalTest from './MinimalTest';
import useStore from '../store';
import useDataSync from '../hooks/useDataSync';

const Dashboard = () => {
  const { bitcoin, m2 } = useStore();
  // const { syncData } = useDataSync(); // Temporarily disabled
  const [currentView, setCurrentView] = useState('dashboard');

  const isLoading = bitcoin.isLoading || m2.isLoading;
  const hasError = bitcoin.error || m2.error;

  // Debug logging
  console.log('Dashboard state:', {
    bitcoinLoading: bitcoin.isLoading,
    m2Loading: m2.isLoading,
    bitcoinHistoricalData: bitcoin.historicalData?.length || 0,
    bitcoinCurrentPrice: bitcoin.currentPrice,
    m2CurrentValue: m2.currentValue,
    hasError,
    showLoading: isLoading && !bitcoin.historicalData?.length
  });

  // Temporarily disable loading screen to debug
  // Show loading only on initial load when we have no data at all
  // if (bitcoin.isLoading && !bitcoin.currentPrice && !bitcoin.historicalData?.length) {
  //   return (
  //     <div className="min-h-[600px] flex items-center justify-center">
  //       <LoadingSpinner size="large" message="Loading financial data..." />
  //     </div>
  //   );
  // }

  if (hasError && !bitcoin.historicalData.length) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <ErrorMessage 
          error={bitcoin.error || m2.error} 
          onRetry={() => console.log('Retry clicked')}
        />
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'table':
        return <TableView />;
      case 'summary':
        return <SummaryView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Minimal Test - Debug */}
      <MinimalTest />
      
      {/* Debug Test - Temporary */}
      <DebugTest />
      
      {/* View Selector */}
      <div className="flex justify-center">
        <ViewSelector 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
      </div>

      {/* Selected View Content */}
      {renderView()}
    </div>
  );
};

export default Dashboard;