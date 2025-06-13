// M2 Money Supply specific store actions and state
export const m2Slice = (set, get) => ({
  m2: {
    data: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    metadata: {
      units: 'Billions of Dollars',
      source: 'Federal Reserve Economic Data',
      frequency: 'Weekly',
      seasonallyAdjusted: true,
    }
  },

  // Actions
  setM2Data: (data) =>
    set((state) => ({
      m2: {
        ...state.m2,
        data,
        lastUpdated: new Date(),
        error: null,
      },
    })),

  setM2Loading: (isLoading) =>
    set((state) => ({
      m2: {
        ...state.m2,
        isLoading,
      },
    })),

  setM2Error: (error) =>
    set((state) => ({
      m2: {
        ...state.m2,
        error,
        isLoading: false,
      },
    })),

  setM2Metadata: (metadata) =>
    set((state) => ({
      m2: {
        ...state.m2,
        metadata: {
          ...state.m2.metadata,
          ...metadata,
        },
      },
    })),

  resetM2State: () =>
    set((state) => ({
      m2: {
        data: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
        metadata: {
          units: 'Billions of Dollars',
          source: 'Federal Reserve Economic Data',
          frequency: 'Weekly',
          seasonallyAdjusted: true,
        }
      },
    })),
});
