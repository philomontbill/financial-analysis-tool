import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { bitcoinSlice } from './bitcoinSlice';
import { m2Slice } from './m2Slice';
import { uiSlice } from './uiSlice';

const useStore = create(
  devtools((set, get) => ({
    // Combine all slices
    ...bitcoinSlice(set, get),
    ...m2Slice(set, get),
    ...uiSlice(set, get),
    
    // Global actions
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
      
    resetAll: () => {
      get().resetBitcoinState();
      get().resetM2State();
    },
  }))
);

export default useStore;
