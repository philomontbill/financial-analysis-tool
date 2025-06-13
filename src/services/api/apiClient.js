import axios from 'axios';

const API_TIMEOUT = 10000;

class ApiClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if needed
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 429) {
          // Handle rate limiting
          return this.handleRateLimit(error);
        }
        return Promise.reject(error);
      }
    );
  }

  handleRateLimit(error) {
    const retryAfter = error.response.headers['retry-after'];
    console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    return Promise.reject(error);
  }

  get(endpoint, params = {}) {
    return this.client.get(endpoint, { params });
  }
}

export default ApiClient;
