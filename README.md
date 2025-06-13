# Financial Analysis Tool

A real-time financial visualization dashboard that displays Bitcoin price data alongside M2 money supply metrics.

## Features

- **Real-time Bitcoin Price Tracking**: Live price updates via WebSocket connection
- **M2 Money Supply Data**: Federal Reserve economic data integration
- **Interactive Charts**: Dual-axis visualization with multiple time ranges
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Caching**: Intelligent caching to minimize API calls
- **Error Handling**: Comprehensive error boundaries and fallback UI

## Tech Stack

- **Frontend**: React 18, Zustand (state management)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Data Sources**: CoinGecko API, FRED API, Binance WebSocket
- **Utilities**: date-fns, axios

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- FRED API key (free from [https://fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/financial-analysis-tool.git
cd financial-analysis-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your FRED API key
```

4. Start the development server:
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/       # React components
│   ├── charts/      # Chart components
│   ├── common/      # Shared components
│   ├── layout/      # Layout components
│   └── tickers/     # Price ticker components
├── hooks/           # Custom React hooks
├── services/        # API and WebSocket services
├── store/           # Zustand state management
├── styles/          # Global styles
└── utils/           # Helper functions
```

## API Rate Limits

- **CoinGecko**: 50 calls/minute (free tier)
- **FRED**: 120 requests/minute
- **Binance WebSocket**: No strict limit

The app implements intelligent caching to stay within these limits.

## Performance Optimizations

- Lazy loading of components
- Data caching with TTL
- WebSocket for real-time updates
- Memoized calculations
- Virtualized lists for large datasets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- CoinGecko for cryptocurrency data
- Federal Reserve Economic Data (FRED) for M2 money supply data
- Binance for real-time price feeds
