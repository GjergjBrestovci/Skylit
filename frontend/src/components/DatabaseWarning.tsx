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
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <h3 className="text-yellow-400 font-semibold mb-1">
              Database Not Connected
            </h3>
            <p className="text-yellow-200/80 text-sm mb-2">
              Your credits and unlimited access status will <strong>not persist</strong> across sessions.
              Data is stored in memory and will be lost when you close the browser.
            </p>
            <p className="text-yellow-200/60 text-xs">
              To fix this, apply database migrations. See <code className="bg-black/30 px-1 py-0.5 rounded">APPLY_MIGRATIONS.md</code>
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-400 hover:text-yellow-300 transition-colors"
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
