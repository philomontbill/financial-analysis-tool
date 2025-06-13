import React from 'react';
import BitcoinTicker from '../tickers/BitcoinTicker';
import DualAxisChart from '../charts/DualAxisChart';
import ChartControls from '../charts/ChartControls';
import useStore from '../../store';

const DashboardView = () => {
  const { bitcoin, m2, ui } = useStore();

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

  const formatTrillions = (num) => {
    if (!num) return '--';
    return `$${(num / 1000000000000).toFixed(1)}T`;
  };

  const getBTCM2Ratio = () => {
    if (!bitcoin.currentPrice?.price || !m2.currentValue?.value) return '--';
    return (bitcoin.currentPrice.price / (m2.currentValue.value / 1000000)).toFixed(3);
  };

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
          value={formatTrillions(bitcoin.stats?.volume24h) || '--'}
          change={bitcoin.stats?.volume24hChange ? `${bitcoin.stats.volume24hChange > 0 ? '+' : ''}${bitcoin.stats.volume24hChange.toFixed(1)}%` : null}
          positive={bitcoin.stats?.volume24hChange > 0}
        />
        <StatCard
          title="Market Cap"
          value={formatTrillions(bitcoin.stats?.marketCap) || '--'}
          change={bitcoin.currentPrice?.change24h ? `${bitcoin.currentPrice.change24h > 0 ? '+' : ''}${bitcoin.currentPrice.change24h.toFixed(1)}%` : null}
          positive={bitcoin.currentPrice?.change24h > 0}
        />
        <StatCard
          title="M2 Growth Rate"
          value={m2.currentValue?.changePercent ? `${m2.currentValue.changePercent.toFixed(1)}%` : '--'}
          subtitle="Annual"
        />
        <StatCard
          title="BTC/M2 Ratio"
          value={getBTCM2Ratio()}
          change={null}
          subtitle="BTC per Million M2"
        />
      </div>
    </div>
  );
};

export default DashboardView;