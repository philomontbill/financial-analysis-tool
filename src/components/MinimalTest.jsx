import React, { useEffect } from 'react';
import useStore from '../store';
import bitcoinService from '../services/api/bitcoin';

const MinimalTest = () => {
  const { bitcoin, setBitcoinPrice, setBitcoinLoading, setBitcoinError, setBitcoinHistoricalData } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('MinimalTest: Starting fetch...');
        setBitcoinLoading(true);
        
        const currentPrice = await bitcoinService.getCurrentPrice();
        console.log('MinimalTest: Got current price:', currentPrice);
        setBitcoinPrice(currentPrice);
        
        const historicalData = await bitcoinService.getHistoricalData(7);
        console.log('MinimalTest: Got historical data:', historicalData.length, 'points');
        setBitcoinHistoricalData(historicalData);
        
      } catch (error) {
        console.error('MinimalTest: Error:', error);
        setBitcoinError(error.message);
      } finally {
        console.log('MinimalTest: Setting loading to false');
        setBitcoinLoading(false);
      }
    };

    fetchData();
  }, [setBitcoinPrice, setBitcoinLoading, setBitcoinError, setBitcoinHistoricalData]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded">
      <h2 className="text-xl mb-4">Minimal Test</h2>
      <div className="space-y-2 text-sm">
        <div>Loading: {bitcoin.isLoading ? 'YES' : 'NO'}</div>
        <div>Current Price: {bitcoin.currentPrice?.price || 'null'}</div>
        <div>Historical Data: {bitcoin.historicalData?.length || 0} points</div>
        <div>Error: {bitcoin.error || 'none'}</div>
        <div>Last Updated: {bitcoin.lastUpdated ? new Date(bitcoin.lastUpdated).toLocaleTimeString() : 'never'}</div>
      </div>
    </div>
  );
};

export default MinimalTest;