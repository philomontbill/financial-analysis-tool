#!/bin/bash

# Create Financial Analysis Tool Project Structure
echo "Creating Financial Analysis Tool project structure..."

# Create main directories
mkdir -p src/{components/{charts,tickers,layout,common},services/{api,websocket,cache},hooks,store,utils,styles}

# Create API Client
cat > src/services/api/apiClient.js << 'EOF'
import axios from 'axios';

const API_TIMEOUT = 10000;

class ApiClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if needed
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 429) {
          // Handle rate limiting
          return this.handleRateLimit(error);
        }
        return Promise.reject(error);
      }
    );
  }

  handleRateLimit(error) {
    const retryAfter = error.response.headers['retry-after'];
    console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    return Promise.reject(error);
  }

  get(endpoint, params = {}) {
    return this.client.get(endpoint, { params });
  }
}

export default ApiClient;
EOF

# Create Bitcoin Service
cat > src/services/api/bitcoin.js << 'EOF'
import ApiClient from './apiClient';

class BitcoinService {
  constructor() {
    this.coingecko = new ApiClient('https://api.coingecko.com/api/v3');
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  async getCurrentPrice() {
    const cacheKey = 'bitcoin-price';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) return cached;

    try {
      const data = await this.coingecko.get('/simple/price', {
        ids: 'bitcoin',
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_last_updated_at: true,
      });

      const result = {
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change,
        lastUpdated: new Date(data.bitcoin.last_updated_at * 1000),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to fetch Bitcoin price:', error);
      throw error;
    }
  }

  async getHistoricalData(days = 30) {
    const cacheKey = `bitcoin-history-${days}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) return cached;

    try {
      const data = await this.coingecko.get(`/coins/bitcoin/market_chart`, {
        vs_currency: 'usd',
        days: days,
        interval: days > 90 ? 'daily' : 'hourly',
      });

      const formattedData = data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp),
        price,
      }));

      this.setCache(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      throw error;
    }
  }

  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

export default new BitcoinService();
EOF

# Create FRED API Service
cat > src/services/api/fredApi.js << 'EOF'
import ApiClient from './apiClient';

class FredApiService {
  constructor() {
    this.client = new ApiClient('https://api.stlouisfed.org/fred');
    this.apiKey = process.env.REACT_APP_FRED_API_KEY;
  }

  async getM2MoneySupply(startDate, endDate) {
    try {
      const params = {
        series_id: 'M2SL',
        api_key: this.apiKey,
        file_type: 'json',
        frequency: 'w', // Weekly data
        aggregation_method: 'avg',
      };

      if (startDate) params.observation_start = startDate;
      if (endDate) params.observation_end = endDate;

      const data = await this.client.get('/series/observations', params);

      return data.observations.map((obs) => ({
        date: new Date(obs.date),
        value: parseFloat(obs.value),
      }));
    } catch (error) {
      console.error('Failed to fetch M2 money supply:', error);
      throw error;
    }
  }
}

export default new FredApiService();
EOF

# Create WebSocket Service
cat > src/services/websocket/bitcoinSocket.js << 'EOF'
class BitcoinWebSocket {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      
      this.ws.onopen = () => {
        console.log('Bitcoin WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const formattedData = {
          price: parseFloat(data.c),
          change24h: parseFloat(data.P),
          volume: parseFloat(data.v),
          timestamp: new Date(),
        };
        
        this.notifySubscribers(formattedData);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    if (this.subscribers.size === 1) {
      this.connect();
    }
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
    if (this.subscribers.size === 0) {
      this.disconnect();
    }
  }

  notifySubscribers(data) {
    this.subscribers.forEach((callback) => callback(data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new BitcoinWebSocket();
EOF

# Create Zustand Store
cat > src/store/index.js << 'EOF'
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools((set, get) => ({
    // Bitcoin State
    bitcoin: {
      currentPrice: null,
      historicalData: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
    },
    
    // M2 Money Supply State
    m2: {
      data: [],
      isLoading: false,
      error: null,
    },
    
    // UI State
    ui: {
      selectedTimeRange: '30d',
      chartType: 'line',
      isRealTimeEnabled: true,
    },
    
    // Actions
    setBitcoinPrice: (price) =>
      set((state) => ({
        bitcoin: {
          ...state.bitcoin,
          currentPrice: price,
          lastUpdated: new Date(),
        },
      })),
      
    setBitcoinHistoricalData: (data) =>
      set((state) => ({
        bitcoin: {
          ...state.bitcoin,
          historicalData: data,
        },
      })),
      
    setM2Data: (data) =>
      set((state) => ({
        m2: {
          ...state.m2,
          data,
        },
      })),
      
    setTimeRange: (range) =>
      set((state) => ({
        ui: {
          ...state.ui,
          selectedTimeRange: range,
        },
      })),
      
    setLoading: (slice, isLoading) =>
      set((state) => ({
        [slice]: {
          ...state[slice],
          isLoading,
        },
      })),
      
    setError: (slice, error) =>
      set((state) => ({
        [slice]: {
          ...state[slice],
          error,
        },
      })),
  }))
);

export default useStore;
EOF

# Create placeholder component files
touch src/components/charts/{BitcoinPriceChart.jsx,DualAxisChart.jsx,ChartControls.jsx}
touch src/components/tickers/{BitcoinTicker.jsx,TickerDisplay.jsx}
touch src/components/layout/{Header.jsx,Footer.jsx,Layout.jsx}
touch src/components/common/{LoadingSpinner.jsx,ErrorBoundary.jsx,ErrorMessage.jsx}

# Create placeholder hook files
touch src/hooks/{useBitcoinPrice.js,useM2MoneySupply.js,useWebSocket.js,useDataSync.js}

# Create placeholder store slice files
touch src/store/{bitcoinSlice.js,m2Slice.js,uiSlice.js}

# Create placeholder utility files
touch src/utils/{formatters.js,dateHelpers.js,constants.js}

# Create placeholder cache file
touch src/services/cache/dataCache.js

# Create global styles file
touch src/styles/globals.css

# Create .env.example file for environment variables
cat > .env.example << 'EOF'
REACT_APP_FRED_API_KEY=your_fred_api_key_here
EOF

# Create a basic package.json if it doesn't exist
if [ ! -f package.json ]; then
  cat > package.json << 'EOF'
{
  "name": "financial-analysis-tool",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
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
    "react-scripts": "5.0.1"
  }
}
EOF
fi

echo "✅ Project structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Copy .env.example to .env and add your FRED API key"
echo "3. Implement the placeholder component files"
echo ""
echo "Project structure:"
tree src/ -I 'node_modules' 2>/dev/null || find src -type f -name "*.js*" | sort