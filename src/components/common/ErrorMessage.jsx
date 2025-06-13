import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="text-red-500" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            {error?.message || 'An unexpected error occurred while loading data.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
