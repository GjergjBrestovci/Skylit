import { useState, useEffect } from 'react';

interface DatabaseStatus {
  configured: boolean;
  healthy: boolean;
  tablesExist: boolean;
  usingMemoryFallback: boolean;
  error?: string;
}

export function DatabaseWarning() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        if (data.database) {
          setStatus(data.database);
        }
      } catch (err) {
        console.error('Failed to check database status:', err);
      }
    };

    checkDatabase();
  }, []);

  // Don't show if dismissed or database is healthy
  if (dismissed || !status || status.healthy) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl mx-auto">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-amber-800 dark:text-amber-300 font-semibold text-sm mb-1">
              Database Not Connected
            </h3>
            <p className="text-amber-700 dark:text-amber-400 text-sm mb-2">
              Your credits and unlimited access status will <strong>not persist</strong> across sessions.
              Data is stored in memory and will be lost when you close the browser.
            </p>
            <p className="text-amber-600 dark:text-amber-500 text-xs">
              To fix this, apply database migrations. See <code className="bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded text-xs font-mono">APPLY_MIGRATIONS.md</code>
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors flex-shrink-0"
            aria-label="Dismiss warning"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
