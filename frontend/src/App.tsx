import { useState, useEffect } from 'react';
import { apiClient } from './utils/apiClient';
import { NewDashboard } from './components/NewDashboard';
import { Auth } from './components/Auth';

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
      <NewDashboard onLogout={handleLogout} />
    </div>
  );
}

export default App;
