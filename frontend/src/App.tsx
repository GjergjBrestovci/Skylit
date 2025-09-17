import { useState, useEffect } from 'react';
import { apiClient } from './utils/apiClient';
import { NewDashboard } from './components/NewDashboard';
import { EnhancedDashboard } from './components/EnhancedDashboard';
import { OnboardingTour, useOnboarding } from './components/OnboardingTour';
import { Auth } from './components/Auth';

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [useEnhancedDashboard, setUseEnhancedDashboard] = useState(false);
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
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-accent-cyan">Loading...</div>
      </div>
    );
  }

  if (!authToken) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background text-text">
        return (
    <div className="min-h-screen bg-background text-text">
      {/* Onboarding Tour */}
      {authToken && showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}
      
      {/* Dashboard Toggle */}
      {authToken && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setUseEnhancedDashboard(!useEnhancedDashboard)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            {useEnhancedDashboard ? 'Classic View' : 'Enhanced View'}
          </button>
        </div>
      )}
      
      {/* Add tour data attributes to navigation elements */}
      <div data-tour="navigation">
        {useEnhancedDashboard ? (
          <EnhancedDashboard />
        ) : (
          <NewDashboard onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
    </div>
  );
}

export default App;
