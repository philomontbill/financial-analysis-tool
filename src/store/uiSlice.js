// UI specific store actions and state
export const uiSlice = (set, get) => ({
  ui: {
    selectedTimeRange: '30d',
    chartType: 'line',
    isRealTimeEnabled: true,
    theme: 'dark',
    sidebarOpen: false,
    notifications: [],
    preferences: {
      showVolume: false,
      showMA: true,
      autoRefresh: true,
      refreshInterval: 30000,
    }
  },

  // Actions
  setTimeRange: (range) =>
    set((state) => ({
      ui: {
        ...state.ui,
        selectedTimeRange: range,
      },
    })),

  setChartType: (type) =>
    set((state) => ({
      ui: {
        ...state.ui,
        chartType: type,
      },
    })),

  toggleRealTime: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        isRealTimeEnabled: !state.ui.isRealTimeEnabled,
      },
    })),

  toggleSidebar: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        sidebarOpen: !state.ui.sidebarOpen,
      },
    })),

  addNotification: (notification) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [
          ...state.ui.notifications,
          {
            id: Date.now(),
            timestamp: new Date(),
            ...notification,
          },
        ],
      },
    })),

  removeNotification: (id) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter((n) => n.id !== id),
      },
    })),

  updatePreferences: (preferences) =>
    set((state) => ({
      ui: {
        ...state.ui,
        preferences: {
          ...state.ui.preferences,
          ...preferences,
        },
      },
    })),

  setTheme: (theme) =>
    set((state) => ({
      ui: {
        ...state.ui,
        theme,
      },
    })),
});
