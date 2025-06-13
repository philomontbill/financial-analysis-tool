import React from 'react';
import BitcoinTicker from './tickers/BitcoinTicker';
import DualAxisChart from './charts/DualAxisChart';
import ChartControls from './charts/ChartControls';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import useStore from '../store';
import useDataSync from '../hooks/useDataSync';

const Dashboard = () => {
  const { bitcoin, m2, ui } = useStore();
  const { syncData } = useDataSync();

  const isLoading = bitcoin.isLoading || m2.isLoading;
  const hasError = bitcoin.error || m2.error;

  if (isLoading && !bitcoin.historicalData.length) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading financial data..." />
      </div>
    );
  }

  if (hasError && !bitcoin.historicalData.length) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <ErrorMessage 
          error={bitcoin.error || m2.error} 
          onRetry={syncData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ticker Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BitcoinTicker />
        <div className="lg:col-span-2">
          <ChartControls />
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-800 rounded-lg p-4 lg:p-6">
        <DualAxisChart
          bitcoinData={bitcoin.historicalData}
          m2Data={m2.data}
          timeRange={ui.selectedTimeRange}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="24h Volume"
          value="$28.5B"
          change="+12.5%"
          positive={true}
        />
        <StatCard
          title="Market Cap"
          value="$1.2T"
          change="+3.2%"
          positive={true}
        />
        <StatCard
          title="M2 Growth Rate"
          value="4.8%"
          subtitle="Annual"
        />
        <StatCard
          title="BTC/M2 Ratio"
          value="0.062"
          change="-2.1%"
          positive={false}
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, positive, subtitle }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-500">{subtitle}</div>
      )}
      {change && (
        <div className={`text-sm font-medium ${
          positive ? 'text-green-500' : 'text-red-500'
        }`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
