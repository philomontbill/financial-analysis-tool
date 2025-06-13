// Bitcoin-specific store actions and state
export const bitcoinSlice = (set, get) => ({
  bitcoin: {
    currentPrice: null,
    historicalData: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    stats: {
      high24h: null,
      low24h: null,
      volume24h: null,
      marketCap: null,
      circulatingSupply: null,
    }
  },

  // Actions
  setBitcoinPrice: (priceData) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        currentPrice: priceData,
        lastUpdated: new Date(),
        error: null,
      },
    })),

  setBitcoinHistoricalData: (data) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        historicalData: data,
        error: null,
      },
    })),

  setBitcoinStats: (stats) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        stats: {
          ...state.bitcoin.stats,
          ...stats,
        },
      },
    })),

  setBitcoinLoading: (isLoading) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        isLoading,
      },
    })),

  setBitcoinError: (error) =>
    set((state) => ({
      bitcoin: {
        ...state.bitcoin,
        error,
        isLoading: false,
      },
    })),

  resetBitcoinState: () =>
    set((state) => ({
      bitcoin: {
        currentPrice: null,
        historicalData: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
        stats: {
          high24h: null,
          low24h: null,
          volume24h: null,
          marketCap: null,
          circulatingSupply: null,
        }
      },
    })),
});
