import { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { apiClient } from './utils/apiClient';
import { NewDashboard } from './components/NewDashboard';
import { Auth } from './components/Auth';
import { SEOHead } from './components/SEO/SEOHead';
import { DatabaseWarning } from './components/DatabaseWarning';
import { initializeThemeFromStorage } from './utils/theme';

// Initialize theme on app load
initializeThemeFromStorage();

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('authToken');
      setAuthToken(token);
      if (token) {
        // Trigger a lightweight protected call to validate/refresh if needed
        try {
          await apiClient.get('/api/get-projects');
        } catch (err) {
          // If it fails due to auth, user will be forced to login
          console.warn('Initial token validation failed:', err);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleAuthSuccess = (token: string) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setAuthToken(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton-loader" />
          <div className="w-28 h-7 rounded-lg skeleton-loader" />
        </div>
        <div className="flex flex-col items-center gap-3 w-full max-w-sm px-4">
          <div className="w-full h-2 rounded-full skeleton-loader" />
          <div className="w-3/4 h-2 rounded-full skeleton-loader" />
          <div className="w-5/6 h-2 rounded-full skeleton-loader" />
        </div>
      </div>
    );
  }

  if (!authToken) {
    return (
      <HelmetProvider>
        <SEOHead
          title="Login to SkyLit AI - AI Website Generator"
          description="Sign in to SkyLit AI to create professional websites instantly with AI. Generate responsive websites using React, Vue, Next.js, and more."
          url="/login"
        />
        <Auth onAuthSuccess={handleAuthSuccess} />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <SEOHead
        title="SkyLit AI - AI-Powered Website Generator"
        description="Create professional websites instantly with AI. Generate responsive websites using React, Vue, Next.js, and more. No coding required."
        keywords={['AI website generator', 'website builder', 'AI web development', 'responsive design', 'React websites', 'Vue websites', 'Next.js generator', 'no-code website builder']}
      />
      <DatabaseWarning />
      <div data-tour="navigation">
        <NewDashboard
          onLogout={handleLogout}
        />
      </div>
    </HelmetProvider>
  );
}

export default App;
