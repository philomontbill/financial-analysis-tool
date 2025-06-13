#!/bin/bash

# Complete Financial Analysis Tool Implementation Script
echo "Completing Financial Analysis Tool implementation..."

# Create utils/formatters.js
cat > src/utils/formatters.js << 'EOF'
export const formatCurrency = (value, options = {}) => {
  const {
    currency = 'USD',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    notation = 'standard',
    compactDisplay = 'short'
  } = options;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
    compactDisplay
  }).format(value);
};

export const formatPercentage = (value, showSign = true) => {
  const formatted = Math.abs(value).toFixed(2);
  if (showSign) {
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }
  return `${formatted}%`;
};

export const formatNumber = (value, options = {}) => {
  const { notation = 'standard', minimumFractionDigits = 0 } = options;
  
  return new Intl.NumberFormat('en-US', {
    notation,
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits + 2
  }).format(value);
};

export const formatBitcoinAmount = (btc) => {
  if (btc >= 1) {
    return `${btc.toFixed(4)} BTC`;
  } else if (btc >= 0.001) {
    return `${(btc * 1000).toFixed(2)} mBTC`;
  } else {
    return `${(btc * 100000000).toFixed(0)} sats`;
  }
};

export const formatMarketCap = (value) => {
  return formatCurrency(value, {
    notation: 'compact',
    maximumFractionDigits: 2
  });
};

export const formatVolume = (value) => {
  return formatCurrency(value, {
    notation: 'compact',
    maximumFractionDigits: 1
  });
};
EOF

# Create utils/dateHelpers.js
cat > src/utils/dateHelpers.js << 'EOF'
import { 
  format, 
  parseISO, 
  isValid, 
  startOfDay, 
  endOfDay,
  subDays,
  subMonths,
  subYears,
  differenceInDays,
  differenceInHours
} from 'date-fns';

export const formatDate = (date, formatString = 'PPP') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatString) : '';
};

export const formatDateForChart = (date, timeRange) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';

  switch (timeRange) {
    case '24h':
      return format(dateObj, 'HH:mm');
    case '7d':
      return format(dateObj, 'EEE HH:mm');
    case '30d':
      return format(dateObj, 'MMM dd');
    case '90d':
      return format(dateObj, 'MMM dd');
    case '1y':
      return format(dateObj, 'MMM yyyy');
    default:
      return format(dateObj, 'MMM dd');
  }
};

export const getDateRangeForTimeframe = (timeframe) => {
  const end = endOfDay(new Date());
  let start;

  switch (timeframe) {
    case '24h':
      start = subDays(end, 1);
      break;
    case '7d':
      start = subDays(end, 7);
      break;
    case '30d':
      start = subDays(end, 30);
      break;
    case '90d':
      start = subDays(end, 90);
      break;
    case '1y':
      start = subYears(end, 1);
      break;
    case '5y':
      start = subYears(end, 5);
      break;
    default:
      start = subDays(end, 30);
  }

  return {
    start: startOfDay(start),
    end,
    days: differenceInDays(end, start),
    hours: differenceInHours(end, start)
  };
};

export const getRelativeTimeString = (date) => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  const diffInHours = differenceInHours(now, dateObj);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - dateObj) / 60000);
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = differenceInDays(now, dateObj);
    return `${diffInDays}d ago`;
  }
};

export const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  // Crypto markets are 24/7
  return true;
};
EOF

# Create utils/constants.js
cat > src/utils/constants.js << 'EOF'
export const TIME_RANGES = {
  '24h': { label: '24H', days: 1 },
  '7d': { label: '7D', days: 7 },
  '30d': { label: '30D', days: 30 },
  '90d': { label: '90D', days: 90 },
  '1y': { label: '1Y', days: 365 },
  '5y': { label: '5Y', days: 1825 }
};

export const CHART_COLORS = {
  bitcoin: '#F59E0B',
  m2: '#10B981',
  grid: '#374151',
  text: '#9CA3AF',
  positive: '#10B981',
  negative: '#EF4444',
  neutral: '#6B7280'
};

export const API_ENDPOINTS = {
  COINGECKO_BASE: 'https://api.coingecko.com/api/v3',
  FRED_BASE: 'https://api.stlouisfed.org/fred',
  BINANCE_WS: 'wss://stream.binance.com:9443/ws'
};

export const CACHE_DURATIONS = {
  PRICE_CURRENT: 30 * 1000, // 30 seconds
  PRICE_HISTORICAL: 5 * 60 * 1000, // 5 minutes
  M2_DATA: 60 * 60 * 1000, // 1 hour
};

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  API_LIMIT: 'API rate limit reached. Please try again later.',
  INVALID_DATA: 'Invalid data received from server.',
  UNKNOWN: 'An unexpected error occurred.'
};

export const BITCOIN_METRICS = {
  BLOCK_TIME: 10, // minutes
  MAX_SUPPLY: 21000000,
  HALVING_INTERVAL: 210000, // blocks
  GENESIS_DATE: new Date('2009-01-03')
};
EOF

# Create services/cache/dataCache.js
cat > src/services/cache/dataCache.js << 'EOF'
class DataCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, data, ttl = 60000) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store data with timestamp
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Set auto-cleanup timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    // Remove from cache
    this.cache.delete(key);
  }

  clear() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // Clear cache
    this.cache.clear();
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }

  size() {
    return this.cache.size;
  }

  // Get cache statistics
  getStats() {
    const keys = Array.from(this.cache.keys());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      keys,
      items: keys.map(key => {
        const item = this.cache.get(key);
        return {
          key,
          age: now - item.timestamp,
          ttl: item.ttl,
          remainingTTL: Math.max(0, item.ttl - (now - item.timestamp))
        };
      })
    };
  }
}

// Singleton instance
const dataCache = new DataCache();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    dataCache.clear();
  });
}

export default dataCache;
EOF

# Create hooks/useM2MoneySupply.js
cat > src/hooks/useM2MoneySupply.js << 'EOF'
import { useEffect } from 'react';
import useStore from '../store';
import fredApiService from '../services/api/fredApi';
import dataCache from '../services/cache/dataCache';
import { getDateRangeForTimeframe } from '../utils/dateHelpers';
import { CACHE_DURATIONS } from '../utils/constants';

const useM2MoneySupply = () => {
  const { m2, ui, setM2Data, setLoading, setError } = useStore();
  const { selectedTimeRange } = ui;

  useEffect(() => {
    const fetchM2Data = async () => {
      const cacheKey = `m2-${selectedTimeRange}`;
      
      // Check cache first
      const cached = dataCache.get(cacheKey);
      if (cached) {
        setM2Data(cached);
        return;
      }

      setLoading('m2', true);
      setError('m2', null);

      try {
        const { start, end } = getDateRangeForTimeframe(selectedTimeRange);
        const data = await fredApiService.getM2MoneySupply(
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0]
        );

        setM2Data(data);
        
        // Cache the data
        dataCache.set(cacheKey, data, CACHE_DURATIONS.M2_DATA);
      } catch (error) {
        console.error('Failed to fetch M2 data:', error);
        setError('m2', error);
      } finally {
        setLoading('m2', false);
      }
    };

    fetchM2Data();
  }, [selectedTimeRange, setM2Data, setLoading, setError]);

  return {
    data: m2.data,
    isLoading: m2.isLoading,
    error: m2.error,
    lastUpdated: m2.lastUpdated
  };
};

export default useM2MoneySupply;
EOF

# Create hooks/useWebSocket.js
cat > src/hooks/useWebSocket.js << 'EOF'
import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 5000,
    reconnectAttempts = 5,
  } = options;

  const ws = useRef(null);
  const reconnectCount = useRef(0);
  const reconnectTimeout = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = (event) => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectCount.current = 0;
        
        if (onOpen) {
          onOpen(event);
        }
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        if (onMessage) {
          onMessage(data);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        
        if (onError) {
          onError(event);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        if (onClose) {
          onClose(event);
        }

        // Attempt to reconnect
        if (reconnect && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          console.log(`Reconnecting... Attempt ${reconnectCount.current}`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, reconnectInterval * reconnectCount.current);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};

export default useWebSocket;
EOF

# Create components/layout/Footer.jsx
cat > src/components/layout/Footer.jsx << 'EOF'
import React from 'react';
import { Github, Twitter, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2024 Financial Viz. Real-time Bitcoin and M2 Money Supply Analysis.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Data provided by CoinGecko and Federal Reserve Economic Data (FRED)
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Website"
            >
              <Globe size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
EOF

# Create components/charts/BitcoinPriceChart.jsx
cat > src/components/charts/BitcoinPriceChart.jsx << 'EOF'
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
EOF

# Create store slice files
cat > src/store/bitcoinSlice.js << 'EOF'
// Bitcoin-specific store actions and state
export const bitcoinSlice = (set, get) => ({
  bitcoin: {
    currentPrice: null,
    historicalData: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    stats: {
      high24h: null,
      low24h: null,
      volume24h: null,
      marketCap: null,
      circulatingSupply: null,
    }
  },

  // Actions
  setBitcoinPrice: (priceData) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        currentPrice: priceData,
        lastUpdated: new Date(),
        error: null,
      },
    })),

  setBitcoinHistoricalData: (data) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        historicalData: data,
        error: null,
      },
    })),

  setBitcoinStats: (stats) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        stats: {
          ...state.bitcoin.stats,
          ...stats,
        },
      },
    })),

  setBitcoinLoading: (isLoading) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        isLoading,
      },
    })),

  setBitcoinError: (error) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        error,
        isLoading: false,
      },
    })),

  resetBitcoinState: () =>
    set((state) => ({
      bitcoin: {
        currentPrice: null,
        historicalData: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
        stats: {
          high24h: null,
          low24h: null,
          volume24h: null,
          marketCap: null,
          circulatingSupply: null,
        }
      },
    })),
});
EOF

cat > src/store/m2Slice.js << 'EOF'
// M2 Money Supply specific store actions and state
export const m2Slice = (set, get) => ({
  m2: {
    data: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    metadata: {
      units: 'Billions of Dollars',
      source: 'Federal Reserve Economic Data',
      frequency: 'Weekly',
      seasonallyAdjusted: true,
    }
  },

  // Actions
  setM2Data: (data) =>
    set((state) => ({
      m2: {
        ...state.m2,
        data,
        lastUpdated: new Date(),
        error: null,
      },
    })),

  setM2Loading: (isLoading) =>
    set((state) => ({
      m2: {
        ...state.m2,
        isLoading,
      },
    })),

  setM2Error: (error) =>
    set((state) => ({
      m2: {
        ...state.m2,
        error,
        isLoading: false,
      },
    })),

  setM2Metadata: (metadata) =>
    set((state) => ({
      m2: {
        ...state.m2,
        metadata: {
          ...state.m2.metadata,
          ...metadata,
        },
      },
    })),

  resetM2State: () =>
    set((state) => ({
      m2: {
        data: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
        metadata: {
          units: 'Billions of Dollars',
          source: 'Federal Reserve Economic Data',
          frequency: 'Weekly',
          seasonallyAdjusted: true,
        }
      },
    })),
});
EOF

cat > src/store/uiSlice.js << 'EOF'
// UI specific store actions and state
export const uiSlice = (set, get) => ({
  ui: {
    selectedTimeRange: '30d',
    chartType: 'line',
    isRealTimeEnabled: true,
    theme: 'dark',
    sidebarOpen: false,
    notifications: [],
    preferences: {
      showVolume: false,
      showMA: true,
      autoRefresh: true,
      refreshInterval: 30000,
    }
  },

  // Actions
  setTimeRange: (range) =>
    set((state) => ({
      ui: {
        ...state.ui,
        selectedTimeRange: range,
      },
    })),

  setChartType: (type) =>
    set((state) => ({
      ui: {
        ...state.ui,
        chartType: type,
      },
    })),

  toggleRealTime: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        isRealTimeEnabled: !state.ui.isRealTimeEnabled,
      },
    })),

  toggleSidebar: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        sidebarOpen: !state.ui.sidebarOpen,
      },
    })),

  addNotification: (notification) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [
          ...state.ui.notifications,
          {
            id: Date.now(),
            timestamp: new Date(),
            ...notification,
          },
        ],
      },
    })),

  removeNotification: (id) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter((n) => n.id !== id),
      },
    })),

  updatePreferences: (preferences) =>
    set((state) => ({
      ui: {
        ...state.ui,
        preferences: {
          ...state.ui.preferences,
          ...preferences,
        },
      },
    })),

  setTheme: (theme) =>
    set((state) => ({
      ui: {
        ...state.ui,
        theme,
      },
    })),
});
EOF

# Create styles/globals.css
cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS Variables */
:root {
  --color-primary: #F59E0B;
  --color-secondary: #10B981;
  --color-background: #111827;
  --color-surface: #1F2937;
  --color-border: #374151;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #9CA3AF;
  --color-positive: #10B981;
  --color-negative: #EF4444;
}

/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-surface);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4B5563;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Utility Classes */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Chart Customizations */
.recharts-tooltip-wrapper {
  z-index: 10;
}

.recharts-active-dot {
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
}

/* Glass Effect */
.glass {
  background: rgba(31, 41, 55, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(55, 65, 81, 0.5);
}

/* Gradient Backgrounds */
.gradient-primary {
  background: linear-gradient(135deg, #F59E0B 0%, #DC2626 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
}

/* Loading States */
.skeleton {
  background: linear-gradient(90deg, 
    var(--color-surface) 0%, 
    #2D3748 50%, 
    var(--color-surface) 100%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive Typography */
@media (max-width: 640px) {
  html {
    font-size: 14px;
  }
}

/* Focus Styles */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
EOF

# Create enhanced App.js with better routing and state management
cat > src/App.js << 'EOF'
import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import './styles/globals.css';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <ErrorMessage error={error} onRetry={resetErrorBoundary} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Layout>
        <Suspense 
          fallback={
            <div className="min-h-[600px] flex items-center justify-center">
              <LoadingSpinner size="large" message="Loading dashboard..." />
            </div>
          }
        >
          <Dashboard />
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
EOF

# Create index.js with proper providers
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  const reportWebVitals = (metric) => {
    console.log(metric);
  };
  
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Create .env.example with all needed variables
cat > .env.example << 'EOF'
# API Keys
REACT_APP_FRED_API_KEY=your_fred_api_key_here

# API Endpoints (optional overrides)
REACT_APP_COINGECKO_API_URL=https://api.coingecko.com/api/v3
REACT_APP_BINANCE_WS_URL=wss://stream.binance.com:9443/ws

# Feature Flags
REACT_APP_ENABLE_WEBSOCKET=true
REACT_APP_ENABLE_CACHE=true
REACT_APP_DEBUG_MODE=false

# Cache Settings (in milliseconds)
REACT_APP_CACHE_DURATION_PRICE=30000
REACT_APP_CACHE_DURATION_HISTORICAL=300000
REACT_APP_CACHE_DURATION_M2=3600000
EOF

# Create README.md
cat > README.md << 'EOF'
# Financial Analysis Tool

A real-time financial visualization dashboard that displays Bitcoin price data alongside M2 money supply metrics.

## Features

- **Real-time Bitcoin Price Tracking**: Live price updates via WebSocket connection
- **M2 Money Supply Data**: Federal Reserve economic data integration
- **Interactive Charts**: Dual-axis visualization with multiple time ranges
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Caching**: Intelligent caching to minimize API calls
- **Error Handling**: Comprehensive error boundaries and fallback UI

## Tech Stack

- **Frontend**: React 18, Zustand (state management)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Data Sources**: CoinGecko API, FRED API, Binance WebSocket
- **Utilities**: date-fns, axios

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- FRED API key (free from [https://fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/financial-analysis-tool.git
cd financial-analysis-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your FRED API key
```

4. Start the development server:
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/       # React components
│   ├── charts/      # Chart components
│   ├── common/      # Shared components
│   ├── layout/      # Layout components
│   └── tickers/     # Price ticker components
├── hooks/           # Custom React hooks
├── services/        # API and WebSocket services
├── store/           # Zustand state management
├── styles/          # Global styles
└── utils/           # Helper functions
```

## API Rate Limits

- **CoinGecko**: 50 calls/minute (free tier)
- **FRED**: 120 requests/minute
- **Binance WebSocket**: No strict limit

The app implements intelligent caching to stay within these limits.

## Performance Optimizations

- Lazy loading of components
- Data caching with TTL
- WebSocket for real-time updates
- Memoized calculations
- Virtualized lists for large datasets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- CoinGecko for cryptocurrency data
- Federal Reserve Economic Data (FRED) for M2 money supply data
- Binance for real-time price feeds
EOF

# Create package.json with all dependencies
cat > package.json << 'EOF'
{
  "name": "financial-analysis-tool",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.6.0",
    "zustand": "^4.4.7",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.292.0",
    "react-error-boundary": "^4.0.11",
    "web-vitals": "^3.5.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "analyze": "source-map-explorer 'build/static/js/*.js'",
    "lint": "eslint src/**/*.{js,jsx}"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ],
    "rules": {
      "no-console": "warn",
      "no-unused-vars": "warn"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "source-map-explorer": "^2.5.3",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/user-event": "^14.5.1"
  }
}
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bitcoin: '#F59E0B',
        m2: '#10B981',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo "✅ Financial Analysis Tool implementation completed!"
echo ""
echo "Next steps:"
echo "1. Run 'npm install' to install all dependencies"
echo "2. Copy .env.example to .env and add your FRED API key"
echo "3. Run 'npm start' to start the development server"
echo ""
echo "The application includes:"
echo "- Complete component implementations"
echo "- State management with Zustand"
echo "- Real-time WebSocket connections"
echo "- Comprehensive error handling"
echo "- Performance optimizations"
echo "- Responsive design"
echo "- Data caching"
echo ""
echo "Happy coding! 🚀"