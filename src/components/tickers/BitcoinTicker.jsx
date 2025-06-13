import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import useStore from '../../store';
import bitcoinService from '../../services/api/bitcoin';
import bitcoinSocket from '../../services/websocket/bitcoinSocket';

const BitcoinTicker = () => {
  const { bitcoin, setBitcoinPrice, setBitcoinLoading, setBitcoinError } = useStore();
  const [isConnected, setIsConnected] = useState(false);
  const [sparkline, setSparkline] = useState([]);

  const fetchCurrentPrice = useCallback(async () => {
    try {
      setBitcoinLoading(true);
      const data = await bitcoinService.getCurrentPrice();
      setBitcoinPrice(data);
    } catch (error) {
      console.error('Failed to fetch Bitcoin price:', error);
      setBitcoinError(error.message);
      // Set a fallback/estimated price if API fails
      setBitcoinPrice({
        price: 0,
        change24h: 0,
        lastUpdated: new Date(),
        error: true
      });
    } finally {
      setBitcoinLoading(false);
    }
  }, [setBitcoinLoading, setBitcoinPrice, setBitcoinError]);

  useEffect(() => {
    // Initial fetch
    fetchCurrentPrice();
    
    // Set up polling fallback every 30 seconds
    const interval = setInterval(fetchCurrentPrice, 30000);
    
    // Set up WebSocket for real-time updates if enabled
    if (process.env.REACT_APP_ENABLE_WEBSOCKET === 'true') {
      const handlePriceUpdate = (data) => {
        setBitcoinPrice({
          price: data.price,
          change24h: data.change24h,
          lastUpdated: data.timestamp
        });
        setIsConnected(true);
        
        // Update sparkline
        setSparkline((prev) => {
          const updated = [...prev, data.price].slice(-20);
          return updated;
        });
      };
      
      bitcoinSocket.subscribe(handlePriceUpdate);
      
      return () => {
        clearInterval(interval);
        bitcoinSocket.unsubscribe(handlePriceUpdate);
      };
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [setBitcoinPrice, setBitcoinLoading, setBitcoinError, fetchCurrentPrice]);

  const formatPrice = (price) => {
    if (!price || price === 0) return '$--,---';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change) => {
    if (!change && change !== 0) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // Loading state
  if (!bitcoin.currentPrice && bitcoin.isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-40 mb-2"></div>
          <div className="h-6 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  const price = bitcoin.currentPrice?.price || 0;
  const change24h = bitcoin.currentPrice?.change24h || 0;
  const hasError = bitcoin.currentPrice?.error || bitcoin.error;
  const isPositive = change24h >= 0;

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
          {hasError ? (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-red-400">Error</span>
            </>
          ) : (
            <>
              <Activity
                size={16}
                className={isConnected ? 'text-green-500' : 'text-yellow-500'}
              />
              <span className="text-xs text-gray-400">
                {isConnected ? 'Live' : 'Polling'}
              </span>
            </>
          )}
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
        
        {/* Mini sparkline */}
        {sparkline.length > 1 && (
          <div className="w-24 h-12">
            <svg
              viewBox="0 0 100 50"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth="2"
                points={sparkline
                  .map((val, i) => {
                    const min = Math.min(...sparkline);
                    const max = Math.max(...sparkline);
                    const x = (i / (sparkline.length - 1)) * 100;
                    const y = 50 - ((val - min) / (max - min)) * 50;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>
        )}
      </div>
      
      {bitcoin.lastUpdated && (
        <div className="mt-2 text-xs text-gray-500">
          Updated: {new Date(bitcoin.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default BitcoinTicker;