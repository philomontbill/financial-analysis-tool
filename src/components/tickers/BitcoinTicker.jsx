import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const BitcoinTicker = () => {
  // Temporary static data for testing
  const price = 50000;
  const change24h = 2.5;
  const isPositive = change24h >= 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">₿</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Bitcoin</h3>
            <p className="text-sm text-gray-400">BTC/USD</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-green-500" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatPrice(price)}
          </div>
          <div className={`flex items-center gap-1 ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? (
              <TrendingUp size={20} />
            ) : (
              <TrendingDown size={20} />
            )}
            <span className="font-semibold">{formatChange(change24h)}</span>
            <span className="text-gray-400 text-sm">24h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinTicker;
