import { useEffect, useCallback } from 'react';
import useStore from '../store';

const useDataSync = () => {
  const { setLoading } = useStore();

  const syncData = useCallback(() => {
    console.log('Syncing data...');
    // Placeholder for data syncing logic
  }, []);

  useEffect(() => {
    // Initial sync on mount
    syncData();
  }, [syncData]);

  return {
    syncData,
  };
};

export default useDataSync;
