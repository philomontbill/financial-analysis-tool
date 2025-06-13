import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { formatDateForChart } from '../../utils/dateHelpers';
import { CHART_COLORS } from '../../utils/constants';

const BitcoinPriceChart = ({ data, timeRange, showVolume = false }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Calculate moving average
    const maLength = timeRange === '24h' ? 12 : 20;
    
    return data.map((item, index) => {
      const maValues = data
        .slice(Math.max(0, index - maLength + 1), index + 1)
        .map(d => d.price);
      
      const ma = maValues.reduce((sum, val) => sum + val, 0) / maValues.length;
      
      return {
        ...item,
        ma,
        volume: item.volume || 0
      };
    });
  }, [data, timeRange]);

  const { minPrice, maxPrice, avgPrice } = useMemo(() => {
    if (!chartData.length) return { minPrice: 0, maxPrice: 0, avgPrice: 0 };
    
    const prices = chartData.map(d => d.price);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: prices.reduce((sum, p) => sum + p, 0) / prices.length
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    const priceChange = ((data.price - avgPrice) / avgPrice) * 100;

    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
        <p className="text-gray-300 text-sm mb-2">
          {formatDateForChart(data.timestamp, timeRange)}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-400">Price:</span>
            <span className="text-sm font-semibold text-white">
              {formatCurrency(data.price, { minimumFractionDigits: 2 })}
            </span>
          </div>
          {data.ma && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">MA:</span>
              <span className="text-sm font-semibold text-blue-400">
                {formatCurrency(data.ma, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-400">vs Avg:</span>
            <span className={`text-sm font-semibold ${
              priceChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatPercentage(priceChange)}
            </span>
          </div>
          {showVolume && data.volume > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-400">Volume:</span>
              <span className="text-sm font-semibold text-white">
                {formatCurrency(data.volume, { notation: 'compact' })}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!chartData.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-800 rounded-lg">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBitcoin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.bitcoin} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_COLORS.bitcoin} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => formatDateForChart(value, timeRange)}
            stroke={CHART_COLORS.text}
            tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
          />
          
          <YAxis
            tickFormatter={(value) => formatCurrency(value, { notation: 'compact' })}
            stroke={CHART_COLORS.text}
            tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
            domain={['dataMin * 0.99', 'dataMax * 1.01']}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine
            y={avgPrice}
            stroke={CHART_COLORS.neutral}
            strokeDasharray="5 5"
            label={{ value: "Average", position: "left", fill: CHART_COLORS.text }}
          />
          
          <Area
            type="monotone"
            dataKey="price"
            stroke={CHART_COLORS.bitcoin}
            fillOpacity={1}
            fill="url(#colorBitcoin)"
            strokeWidth={2}
          />
          
          <Area
            type="monotone"
            dataKey="ma"
            stroke="#3B82F6"
            fillOpacity={0}
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex justify-between text-sm text-gray-400">
        <span>Low: {formatCurrency(minPrice, { minimumFractionDigits: 2 })}</span>
        <span>Avg: {formatCurrency(avgPrice, { minimumFractionDigits: 2 })}</span>
        <span>High: {formatCurrency(maxPrice, { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
};

export default BitcoinPriceChart;
