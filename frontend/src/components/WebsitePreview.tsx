import { useState } from 'react';

const getPreviewBaseUrl = (): string => {
  const envBase = import.meta.env?.VITE_PREVIEW_BASE_URL ?? import.meta.env?.VITE_API_BASE_URL ?? '';

  if (envBase) {
    return envBase.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

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

  const handleLoad = () => {
    // console.debug('Preview iframe loaded successfully');
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    console.error('Preview iframe failed to load');
    setLoading(false);
    setError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const apiBase = getPreviewBaseUrl();
  const fullUrl = previewUrl.startsWith('http')
    ? previewUrl
    : `${apiBase}${previewUrl.startsWith('/') ? previewUrl : `/${previewUrl}`}`;

  // console.debug('WebsitePreview - Preview URL:', fullUrl);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
        <div className="bg-[#1e1e1e] border-b border-accent-purple/20 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">🌐</span>
            {title} - Fullscreen
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(fullUrl, '_blank')}
              className="px-4 py-2 bg-accent-cyan text-background rounded-md hover:bg-accent-cyan/90 transition-colors text-sm"
            >
              Open in New Tab
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
              <div className="text-white text-center">
                <div className="animate-spin text-4xl mb-4">
                  <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p>Loading your website...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
              <div className="text-red-400 text-center">
                <div className="text-4xl mb-4">❌</div>
                <p>Failed to load preview</p>
                <button
                  onClick={() => {
                    setError(false);
                    setLoading(true);
                  }}
                  className="mt-4 px-4 py-2 bg-accent-purple text-white rounded-md hover:bg-accent-purple/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          <iframe
            src={fullUrl}
            onLoad={handleLoad}
            onError={handleError}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts allow-forms"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1e1e1e] border border-accent-purple/20 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-[#232323] border-b border-accent-purple/20 p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">🌐</span>
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => window.open(fullUrl, '_blank')}
            className="px-3 py-1 bg-accent-cyan text-background rounded text-sm hover:bg-accent-cyan/90 transition-colors"
            title="Open in new tab"
          >
            <span className="text-sm">Link</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 bg-accent-purple text-white rounded text-sm hover:bg-accent-purple/90 transition-colors"
            title="Fullscreen"
          >
            <span className="text-sm">⛶</span>
          </button>
        </div>
      </div>
      
      <div className="relative" style={{ height: '500px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
            <div className="text-text/70 text-center">
              <div className="animate-spin text-3xl mb-3">
                <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-sm">Loading preview...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
            <div className="text-red-400 text-center">
              <div className="text-3xl mb-3">❌</div>
              <p className="text-sm mb-3">Failed to load preview</p>
              <button
                onClick={() => {
                  setError(false);
                  setLoading(true);
                }}
                className="px-4 py-2 bg-accent-purple text-white rounded-md hover:bg-accent-purple/90 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <iframe
          src={fullUrl}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full border-0"
          title={title}
          sandbox="allow-scripts allow-forms"
        />
      </div>
      
      <div className="bg-[#232323] border-t border-accent-purple/20 p-3">
        <div className="flex items-center justify-between text-sm text-text/60">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Preview Active
          </span>
          <span className="text-xs">
            Preview URL: {previewUrl}
          </span>
        </div>
      </div>
    </div>
  );
}
