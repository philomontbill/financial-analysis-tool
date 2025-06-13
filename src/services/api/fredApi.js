import ApiClient from './apiClient';

class FredApiService {
  constructor() {
    this.client = new ApiClient('https://api.stlouisfed.org/fred');
    this.apiKey = process.env.REACT_APP_FRED_API_KEY;
  }

  async getM2MoneySupply(startDate, endDate) {
    try {
      const params = {
        series_id: 'M2SL',
        api_key: this.apiKey,
        file_type: 'json',
        frequency: 'w', // Weekly data
        aggregation_method: 'avg',
      };

      if (startDate) params.observation_start = startDate;
      if (endDate) params.observation_end = endDate;

      const data = await this.client.get('/series/observations', params);

      return data.observations.map((obs) => ({
        date: new Date(obs.date),
        value: parseFloat(obs.value),
      }));
    } catch (error) {
      console.error('Failed to fetch M2 money supply:', error);
      throw error;
    }
  }
}

export default new FredApiService();
