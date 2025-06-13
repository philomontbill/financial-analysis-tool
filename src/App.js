import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import './styles/globals.css';

// Temporarily disable lazy loading to debug
// const Dashboard = lazy(() => import('./components/Dashboard'));
import Dashboard from './components/Dashboard';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <ErrorMessage error={error} onRetry={resetErrorBoundary} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Layout>
        <Dashboard />
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
