import React, { useState, useEffect } from 'react';
import bitcoinService from '../services/api/bitcoin';

const DebugTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    const results = {};
    
    try {
      console.log('Testing direct API call...');
      results.directAPI = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true')
        .then(res => res.json());
      console.log('Direct API success:', results.directAPI);
    } catch (error) {
      console.error('Direct API failed:', error);
      results.directAPIError = error.message;
    }

    try {
      console.log('Testing Bitcoin service getCurrentPrice...');
      results.bitcoinService = await bitcoinService.getCurrentPrice();
      console.log('Bitcoin service success:', results.bitcoinService);
    } catch (error) {
      console.error('Bitcoin service failed:', error);
      results.bitcoinServiceError = error.message;
    }

    try {
      console.log('Testing Bitcoin service getHistoricalData...');
      results.historicalData = await bitcoinService.getHistoricalData(7);
      console.log('Historical data success:', results.historicalData.length, 'data points');
      results.historicalDataLength = results.historicalData.length;
    } catch (error) {
      console.error('Historical data failed:', error);
      results.historicalDataError = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 m-4">
      <h2 className="text-xl font-semibold text-white mb-4">API Debug Test</h2>
      
      {loading && <div className="text-yellow-500">Testing APIs...</div>}
      
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="text-white font-medium">Direct API Test:</h3>
          <pre className="text-gray-300 bg-gray-900 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(testResults.directAPI || testResults.directAPIError, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="text-white font-medium">Bitcoin Service getCurrentPrice:</h3>
          <pre className="text-gray-300 bg-gray-900 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(testResults.bitcoinService || testResults.bitcoinServiceError, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="text-white font-medium">Bitcoin Service getHistoricalData:</h3>
          <pre className="text-gray-300 bg-gray-900 p-2 rounded mt-2 overflow-auto">
            {testResults.historicalDataLength ? 
              `${testResults.historicalDataLength} data points` : 
              JSON.stringify(testResults.historicalDataError, null, 2)
            }
          </pre>
        </div>
        
        <button 
          onClick={testAPI}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          Retest APIs
        </button>
      </div>
    </div>
  );
};

export default DebugTest;