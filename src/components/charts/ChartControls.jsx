import React from 'react';
import { Download, Maximize2, RefreshCw } from 'lucide-react';

const ChartControls = () => {
  const handleExport = () => {
    console.log('Exporting chart data...');
  };

  const handleFullscreen = () => {
    console.log('Entering fullscreen mode...');
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Chart Controls</h3>
          <p className="text-sm text-gray-400">
            Real-time data updates are enabled
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={20} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
            title="Export Data"
          >
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartControls;
