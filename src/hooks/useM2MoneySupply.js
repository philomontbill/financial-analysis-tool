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
