import useStore from './index';

describe('Store', () => {
  test('initial state is set correctly', () => {
    const state = useStore.getState();
    
    expect(state.bitcoin).toBeDefined();
    expect(state.bitcoin.currentPrice).toBeNull();
    expect(state.bitcoin.historicalData).toEqual([]);
    
    expect(state.m2).toBeDefined();
    expect(state.m2.data).toEqual([]);
    
    expect(state.ui).toBeDefined();
    expect(state.ui.selectedTimeRange).toBe('30d');
  });

  test('setBitcoinPrice action works', () => {
    const { setBitcoinPrice } = useStore.getState();
    const mockPrice = { price: 50000, change24h: 2.5 };
    
    setBitcoinPrice(mockPrice);
    
    const state = useStore.getState();
    expect(state.bitcoin.currentPrice).toEqual(mockPrice);
    expect(state.bitcoin.lastUpdated).toBeDefined();
  });

  test('setTimeRange action works', () => {
    const { setTimeRange } = useStore.getState();
    
    setTimeRange('7d');
    
    const state = useStore.getState();
    expect(state.ui.selectedTimeRange).toBe('7d');
  });
});
