import { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { apiClient } from './utils/apiClient';
import { NewDashboard } from './components/NewDashboard';
import { OnboardingTour, useOnboarding } from './components/OnboardingTour';
import { Auth } from './components/Auth';
import { SEOHead } from './components/SEO/SEOHead';
import BackgroundWrapper from './components/BackgroundWrapper';
import { DatabaseWarning } from './components/DatabaseWarning';

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showOnboarding, completeOnboarding } = useOnboarding();

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
      <BackgroundWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </BackgroundWrapper>
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
        <BackgroundWrapper>
          <Auth onAuthSuccess={handleAuthSuccess} />
        </BackgroundWrapper>
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
      <BackgroundWrapper>
        {/* Database connection warning */}
        <DatabaseWarning />
        
        {/* Onboarding Tour */}
        {authToken && showOnboarding && (
          <OnboardingTour onComplete={completeOnboarding} />
        )}
        
        {/* Add tour data attributes to navigation elements */}
        <div data-tour="navigation">
          <NewDashboard 
            onLogout={handleLogout}
          />
        </div>
      </BackgroundWrapper>
    </HelmetProvider>
  );
}

export default App;
