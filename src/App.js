import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import './styles/globals.css';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));

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
        <Suspense 
          fallback={
            <div className="min-h-[600px] flex items-center justify-center">
              <LoadingSpinner size="large" message="Loading dashboard..." />
            </div>
          }
        >
          <Dashboard />
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
