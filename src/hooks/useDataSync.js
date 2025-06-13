import { useEffect, useCallback } from 'react';
import useStore from '../store';
import bitcoinService from '../services/api/bitcoin';

const useDataSync = () => {
  const { 
    setBitcoinLoading, 
    setBitcoinPrice, 
    setBitcoinHistoricalData, 
    setBitcoinError,
    setM2Loading,
    setM2CurrentValue,
    setM2Error
  } = useStore();

  const syncBitcoinData = useCallback(async () => {
    try {
      console.log('Starting Bitcoin data sync...');
      setBitcoinLoading(true);
      setBitcoinError(null);
      
      // Fetch current price
      console.log('Fetching current Bitcoin price...');
      const currentPrice = await bitcoinService.getCurrentPrice();
      console.log('Bitcoin price fetched:', currentPrice);
      setBitcoinPrice(currentPrice);
      
      // Fetch historical data (30 days)
      console.log('Fetching Bitcoin historical data...');
      const historicalData = await bitcoinService.getHistoricalData(30);
      console.log('Bitcoin historical data fetched:', historicalData.length, 'data points');
      setBitcoinHistoricalData(historicalData);
      
      console.log('Bitcoin data sync completed');
    } catch (error) {
      console.error('Failed to sync Bitcoin data:', error);
      setBitcoinError(error.message);
    } finally {
      setBitcoinLoading(false);
    }
  }, [setBitcoinLoading, setBitcoinPrice, setBitcoinHistoricalData, setBitcoinError]);

  const syncM2Data = useCallback(async () => {
    try {
      setM2Loading(true);
      setM2Error(null);
      
      // For now, set some mock M2 data to prevent infinite loading
      // TODO: Implement actual M2 data fetching from FRED API
      const mockM2CurrentValue = {
        value: 21000000000000, // $21T
        changePercent: 8.5,
        lastUpdated: new Date()
      };
      
      setM2CurrentValue(mockM2CurrentValue);
      
    } catch (error) {
      console.error('Failed to sync M2 data:', error);
      setM2Error(error.message);
    } finally {
      setM2Loading(false);
    }
  }, [setM2Loading, setM2CurrentValue, setM2Error]);

  const syncData = useCallback(async () => {
    console.log('Syncing data...');
    await Promise.all([
      syncBitcoinData(),
      syncM2Data()
    ]);
  }, [syncBitcoinData, syncM2Data]);

  useEffect(() => {
    // Initial sync on mount
    syncData();
  }, [syncData]);

  return {
    syncData,
    syncBitcoinData,
    syncM2Data,
  };
};

export default useDataSync;
