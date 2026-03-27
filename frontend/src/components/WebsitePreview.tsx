import { useState } from 'react';

const getPreviewBaseUrl = (): string => {
  const envBase = import.meta.env?.VITE_PREVIEW_BASE_URL ?? import.meta.env?.VITE_API_BASE_URL ?? '';
  if (envBase) return envBase.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

interface WebsitePreviewProps {
  previewUrl: string;
  title?: string;
  className?: string;
}

export function WebsitePreview({ previewUrl, title = "Website Preview", className = "" }: WebsitePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLoad = () => { setLoading(false); setError(false); };
  const handleError = () => { console.error('Preview iframe failed to load'); setLoading(false); setError(true); };
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const apiBase = getPreviewBaseUrl();
  const fullUrl = previewUrl.startsWith('http')
    ? previewUrl
    : `${apiBase}${previewUrl.startsWith('/') ? previewUrl : `/${previewUrl}`}`;

  const spinner = (
    <svg className="w-6 h-6 animate-spin text-muted" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
        <div className="bg-surface border-b border-border px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-medium text-text">{title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(fullUrl, '_blank')}
              className="px-3 py-1.5 text-xs border border-border rounded-md text-muted hover:text-text transition-colors"
            >
              Open in New Tab
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 text-xs bg-surface-elevated border border-border rounded-md text-text hover:bg-surface-overlay transition-colors"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
        <div className="flex-1 relative bg-white">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-2">{spinner}<p className="text-sm text-gray-500">Loading...</p></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-3">
                <p className="text-sm text-red-500">Failed to load preview</p>
                <button onClick={() => { setError(false); setLoading(true); }} className="btn-primary px-4 py-1.5 text-sm">Retry</button>
              </div>
            </div>
          )}
          <iframe src={fullUrl} onLoad={handleLoad} onError={handleError} className="w-full h-full border-0 bg-white" title={title} sandbox="allow-scripts allow-forms" />
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-surface border-b border-border px-4 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <span className="text-xs text-muted ml-2 hidden sm:inline truncate max-w-xs">{previewUrl}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => window.open(fullUrl, '_blank')}
            className="p-1.5 rounded-md text-muted hover:text-text hover:bg-surface-overlay transition-colors"
            title="Open in new tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-muted hover:text-text hover:bg-surface-overlay transition-colors"
            title="Fullscreen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="relative bg-white" style={{ minHeight: '500px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-2">{spinner}<p className="text-xs text-gray-400">Loading preview...</p></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-3">
              <p className="text-sm text-red-500">Failed to load preview</p>
              <button onClick={() => { setError(false); setLoading(true); }} className="btn-primary px-4 py-1.5 text-sm">Retry</button>
            </div>
          </div>
        )}
        <iframe src={fullUrl} onLoad={handleLoad} onError={handleError} className="w-full h-full border-0 bg-white" style={{ minHeight: '500px' }} title={title} sandbox="allow-scripts allow-forms" />
      </div>

      {/* Status bar */}
      <div className="bg-surface border-t border-border px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Live Preview
        </div>
      </div>
    </div>
  );
}
