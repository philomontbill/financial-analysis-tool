import React from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import useStore from '../../store';

const TableView = () => {
  const { bitcoin, m2 } = useStore();

  const formatPrice = (price) => {
    if (!price) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change) => {
    if (!change && change !== 0) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatNumber = (num) => {
    if (!num) return '--';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatTrillions = (num) => {
    if (!num) return '--';
    return `$${(num / 1000000000000).toFixed(2)}T`;
  };

  const data = [
    {
      metric: 'Bitcoin Price',
      current: formatPrice(bitcoin.currentPrice?.price),
      change: bitcoin.currentPrice?.change24h,
      unit: 'USD',
      icon: DollarSign,
      color: bitcoin.currentPrice?.change24h >= 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      metric: 'M2 Money Supply',
      current: formatTrillions(m2.currentValue?.value),
      change: m2.currentValue?.changePercent,
      unit: 'Trillions USD',
      icon: Calendar,
      color: 'text-blue-500'
    },
    {
      metric: 'BTC Market Cap',
      current: bitcoin.stats?.marketCap ? formatTrillions(bitcoin.stats.marketCap) : '--',
      change: null,
      unit: 'Trillions USD',
      icon: TrendingUp,
      color: 'text-orange-500'
    },
    {
      metric: 'BTC/M2 Ratio',
      current: (bitcoin.currentPrice?.price && m2.currentValue?.value) 
        ? formatNumber(bitcoin.currentPrice.price / (m2.currentValue.value / 1000000))
        : '--',
      change: null,
      unit: 'BTC per Million M2',
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ];

  // Recent historical data table
  const recentData = bitcoin.historicalData?.slice(-10).reverse() || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Key Financial Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.map((row, index) => {
                const Icon = row.icon;
                const isPositiveChange = row.change >= 0;
                
                return (
                  <tr key={index} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={row.color} />
                        <span className="text-white font-medium">{row.metric}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-mono text-lg">
                      {row.current}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.change !== null ? (
                        <div className={`flex items-center gap-1 ${
                          isPositiveChange ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {isPositiveChange ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                          <span className="font-semibold">{formatChange(row.change)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {row.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Data Table */}
      {recentData.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Recent Bitcoin Price History</h2>
            <p className="text-gray-400 text-sm mt-1">Last 10 data points</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Change from Previous
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentData.map((item, index) => {
                  const prevPrice = index < recentData.length - 1 ? recentData[index + 1]?.price : null;
                  const priceChange = prevPrice ? ((item.price - prevPrice) / prevPrice) * 100 : null;
                  const isPositive = priceChange >= 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-mono text-lg">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {priceChange !== null ? (
                          <div className={`flex items-center gap-1 ${
                            isPositive ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {isPositive ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                            <span className="font-semibold">{formatChange(priceChange)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableView;