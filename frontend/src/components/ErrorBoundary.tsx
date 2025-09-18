import React from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { analytics } from '../utils/analytics';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to analytics
    analytics.trackError(error.message, errorInfo.componentStack || undefined);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Send to external error reporting service (Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In production, send to your error reporting service
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/error-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background text-text flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 text-center">
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-text/70 mb-6">
              We've encountered an unexpected error. The issue has been reported and we're working to fix it.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs">
                <summary className="cursor-pointer text-red-400 font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap text-red-300">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                  {this.state.errorInfo?.componentStack && (
                    '\n\nComponent Stack:' + this.state.errorInfo.componentStack
                  )}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-accent-cyan text-black rounded-lg hover:bg-accent-cyan/90 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90 transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for unhandled promises
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(
      `Unhandled Promise Rejection: ${event.reason}`,
      'unhandledrejection'
    );
    
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    analytics.trackError(
      `Uncaught Error: ${event.error?.message || event.message}`,
      'uncaught'
    );
    
    console.error('Uncaught error:', event.error || event.message);
  });

  // Handle network errors and failed resource loads
  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) {
      const target = event.target as HTMLElement;
      if (target.tagName) {
        analytics.trackError(
          `Resource Load Error: ${target.tagName} - ${(target as any).src || (target as any).href || 'unknown'}`,
          'resource-load'
        );
      }
    }
  }, true);
};

export default ErrorBoundary;
