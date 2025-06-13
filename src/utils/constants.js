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
