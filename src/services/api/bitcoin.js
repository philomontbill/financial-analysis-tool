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
