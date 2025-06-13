import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Percent } from 'lucide-react';
import useStore from '../../store';
import BitcoinTicker from '../tickers/BitcoinTicker';

const SummaryView = () => {
  const { bitcoin, m2 } = useStore();

  const formatPrice = (price) => {
    if (!price) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatTrillions = (num) => {
    if (!num) return '--';
    return `$${(num / 1000000000000).toFixed(2)}T`;
  };

  const formatNumber = (num, decimals = 2) => {
    if (!num && num !== 0) return '--';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getCurrentBTCM2Ratio = () => {
    if (!bitcoin.currentPrice?.price || !m2.currentValue?.value) return null;
    return bitcoin.currentPrice.price / (m2.currentValue.value / 1000000);
  };

  const cards = [
    {
      title: 'M2 Money Supply',
      value: formatTrillions(m2.currentValue?.value),
      change: m2.currentValue?.changePercent || null,
      icon: BarChart3,
      color: 'blue',
      description: 'Total M2 money supply in circulation'
    },
    {
      title: 'BTC Market Cap',
      value: formatTrillions(bitcoin.stats?.marketCap),
      change: null,
      icon: DollarSign,
      color: 'orange',
      description: 'Total market capitalization of Bitcoin'
    },
    {
      title: 'BTC/M2 Ratio',
      value: formatNumber(getCurrentBTCM2Ratio(), 6),
      change: null,
      icon: Percent,
      color: 'purple',
      description: 'Bitcoin price per million M2 dollars'
    },
    {
      title: '24h Volume',
      value: formatTrillions(bitcoin.stats?.volume24h),
      change: null,
      icon: TrendingUp,
      color: 'green',
      description: '24-hour trading volume'
    }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, description }) => {
    const colorClasses = {
      blue: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      orange: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
      purple: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
      green: 'text-green-500 bg-green-500/10 border-green-500/30'
    };

    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
          {change !== null && (
            <div className={`flex items-center gap-1 ${
              change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm font-semibold">
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
          <div className="text-2xl font-bold text-white font-mono">{value}</div>
          <p className="text-gray-500 text-xs">{description}</p>
        </div>
      </div>
    );
  };

  const getMarketSentiment = () => {
    const btcChange = bitcoin.currentPrice?.change24h || 0;
    const m2Change = m2.currentValue?.changePercent || 0;
    
    if (btcChange > 5) return { label: 'Bullish', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (btcChange < -5) return { label: 'Bearish', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (btcChange > 0) return { label: 'Positive', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (btcChange < 0) return { label: 'Negative', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'Neutral', color: 'text-gray-500', bg: 'bg-gray-500/10' };
  };

  const sentiment = getMarketSentiment();

  return (
    <div className="space-y-6">
      {/* Bitcoin Ticker */}
      <BitcoinTicker />

      {/* Market Sentiment */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Market Sentiment</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${sentiment.color} ${sentiment.bg}`}>
            {sentiment.label}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Bitcoin 24h Change</span>
              <span className={`font-semibold ${
                (bitcoin.currentPrice?.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {bitcoin.currentPrice?.change24h ? 
                  `${bitcoin.currentPrice.change24h >= 0 ? '+' : ''}${bitcoin.currentPrice.change24h.toFixed(2)}%` : 
                  '--'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">M2 Growth Rate</span>
              <span className="text-blue-500 font-semibold">
                {m2.currentValue?.changePercent ? 
                  `+${m2.currentValue.changePercent.toFixed(2)}%` : 
                  '--'
                }
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Last Updated</span>
              <span className="text-white">
                {bitcoin.lastUpdated ? 
                  new Date(bitcoin.lastUpdated).toLocaleTimeString() : 
                  '--'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Data Source</span>
              <span className="text-white">CoinGecko / FRED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Quick Insights */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Insights</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-white">
                <span className="font-semibold">Money Supply Impact:</span> 
                {m2.currentValue?.changePercent ? (
                  ` M2 has grown by ${m2.currentValue.changePercent.toFixed(2)}% indicating ${
                    m2.currentValue.changePercent > 10 ? 'significant monetary expansion' : 'moderate monetary policy'
                  }.`
                ) : (
                  ' M2 money supply data is being loaded.'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-white">
                <span className="font-semibold">Bitcoin Performance:</span>
                {bitcoin.currentPrice?.change24h ? (
                  ` Bitcoin is ${bitcoin.currentPrice.change24h >= 0 ? 'up' : 'down'} ${Math.abs(bitcoin.currentPrice.change24h).toFixed(2)}% in the last 24 hours.`
                ) : (
                  ' Bitcoin price data is being loaded.'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-white">
                <span className="font-semibold">Correlation Analysis:</span>
                {getCurrentBTCM2Ratio() ? (
                  ` Current BTC/M2 ratio suggests ${getCurrentBTCM2Ratio() > 0.01 ? 'strong' : 'weak'} correlation between Bitcoin adoption and monetary expansion.`
                ) : (
                  ' Correlation data will be available once both datasets are loaded.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;