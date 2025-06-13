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
